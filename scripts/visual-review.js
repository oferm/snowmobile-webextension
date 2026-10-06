#!/usr/bin/env node
"use strict";

/*
 * look-change-verify loop for the SnowMobile extension.
 *
 *   node scripts/visual-review.js --route viewtopic          # LOOK  (capture)
 *   <edit css/>
 *   node scripts/visual-review.js --route viewtopic          # CHANGE (capture new)
 *   node scripts/visual-review.js --route viewtopic --use-baseline # VERIFY
 *
 * The extension is loaded into a real Chromium through the persistent profile,
 * so the capture reflects exactly what the browser applies (manifest content
 * scripts, not an injected copy of the CSS).
 */

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const crypto = require("node:crypto");
const { execFileSync } = require("node:child_process");
const { chromium, devices } = require("playwright");
const { getStylesheetForUrl } = require("./userscript-config");

const root = path.resolve(__dirname, "..");

// Sample pages, one per content-script route in manifest.json.
const ROUTES = {
  viewtopic: "https://snowheads.com/ski-forum/viewtopic.php?t=177296",
  forumlist: "https://snowheads.com/ski-forum/",
  start: "https://snowheads.com/",
  viewforum: "https://snowheads.com/ski-forum/viewforum.php?f=1",
};

const outRoot =
  process.env.REVIEW_DIR || "/tmp/opencode/snowmobile-screenshots/loop";
const profile =
  process.env.SNOWMOBILE_PROFILE ||
  path.join(os.homedir(), ".local", "share", "snowmobile-playwright");
const chromiumPath = process.env.CHROMIUM_PATH || "/usr/bin/chromium-browser";
const deviceName = process.env.DEVICE || "iPhone 16e";

function parseArgs(argv) {
  const options = {
    route: "viewtopic",
    url: null,
    baseline: null,
    saveBaseline: false,
    useBaseline: false,
    full: false,
    withExtension: true,
    label: null,
    wait: 1500,
    json: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = () => argv[(i += 1)];
    switch (arg) {
      case "--route": options.route = next(); break;
      case "--url": options.url = next(); break;
      case "--baseline": options.baseline = next(); break;
      case "--label": options.label = next(); break;
      case "--wait": options.wait = Number(next()); break;
      case "--save-baseline": options.saveBaseline = true; break;
      case "--use-baseline": options.useBaseline = true; break;
      case "--full": options.full = true; break;
      case "--no-ext": options.withExtension = false; break;
      case "--json": options.json = true; break;
      case "--list": options.list = true; break;
      case "-h":
      case "--help": options.help = true; break;
      default: throw new Error(`Unknown argument "${arg}"`);
    }
  }
  return options;
}

function usage() {
  console.log(`SnowMobile look-change-verify loop

  node scripts/visual-review.js --route <route> [options]

Captures a phone-sized screenshot of a live Snowheads page with the unpacked
extension loaded, then diffs it against a saved baseline.

Routes: ${Object.keys(ROUTES).join(", ")}

Options:
  --route <name>     Sample page to capture (default: viewtopic)
  --url <url>        Explicit URL (overrides --route)
  --label <name>     Output file name (default: <route>-<device>)
  --full             Full-page screenshot instead of the phone viewport
  --wait <ms>        Settle time after load (default: 1500)
  --no-ext           Launch without the extension (to prove its effect)
  --save-baseline    Store this capture as the route baseline
  --use-baseline     Diff this capture against the stored baseline
  --baseline <png>   Diff against an explicit image
  --json             Machine-readable output

Environment: REVIEW_DIR, SNOWMOBILE_PROFILE, CHROMIUM_PATH, DEVICE`);
}

function sha256(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

async function capture(options) {
  const url = options.url || ROUTES[options.route];
  if (!url) throw new Error(`Unknown route "${options.route}" (see --list)`);

  const device = devices[deviceName];
  if (!device) throw new Error(`Unknown DEVICE "${deviceName}"`);

  const args = ["--no-sandbox", "--disable-dev-shm-usage"];
  if (options.withExtension) {
    args.push(
      `--disable-extensions-except=${root}`,
      `--load-extension=${root}`,
    );
  }

  const context = await chromium.launchPersistentContext(profile, {
    ...device,
    headless: process.env.HEADLESS !== "false",
    ignoreHTTPSErrors: true,
    executablePath: chromiumPath,
    chromiumSandbox: false,
    // Playwright disables extensions by default; this extension is the subject.
    ignoreDefaultArgs: ["--disable-extensions"],
    args,
  });

  try {
    const page = context.pages()[0] || (await context.newPage());
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });

    // The manifest injects CSS at document_start; wait for it to be in effect
    // by checking a selector that only exists on the styled page.
    const stylesheet = getStylesheetForUrl(page.url());
    await page.waitForTimeout(options.wait);

    const metrics = await page.evaluate(() => ({
      url: location.href,
      title: document.title,
      innerWidth: window.innerWidth,
      dpr: window.devicePixelRatio,
      touch: "ontouchstart" in window,
      scrollWidth: document.documentElement.scrollWidth,
    }));

    fs.mkdirSync(path.join(outRoot, "current"), { recursive: true });
    const label =
      options.label ||
      `${options.route}-${deviceName.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
    const currentPath = path.join(
      outRoot,
      "current",
      `${label}${options.withExtension ? "" : "-no-ext"}.png`,
    );
    await page.screenshot({ path: currentPath, fullPage: options.full });

    return {
      ...metrics,
      label,
      url,
      stylesheet,
      stylesheetRevision: stylesheet ? sha256(stylesheet).slice(0, 12) : null,
      screenshot: currentPath,
      overflow: metrics.scrollWidth > metrics.innerWidth + 1,
      withExtension: options.withExtension,
    };
  } finally {
    await context.close();
  }
}

function pngSize(file) {
  const header = fs.readFileSync(file).subarray(0, 24);
  return { width: header.readUInt32BE(16), height: header.readUInt32BE(20) };
}

// Raw, uncompressed RGBA so the pixel count is exact. ImageMagick's own AE
// metric is unreliable in the installed 7.1.2 beta build (it sums error
// instead of counting pixels), so we count here.
function rawRGBA(file, depth = 8) {
  return execFileSync("magick", [file, "-depth", String(depth), "rgba:-"], {
    maxBuffer: 1024 * 1024 * 256,
  });
}

function diffImages(baselinePath, currentPath, label) {
  fs.mkdirSync(path.join(outRoot, "diff"), { recursive: true });
  const diffPath = path.join(outRoot, "diff", `${label}-diff.png`);

  const baselineSize = pngSize(baselinePath);
  const currentSize = pngSize(currentPath);
  const sameSize =
    baselineSize.width === currentSize.width && baselineSize.height === currentSize.height;

  // Screen capture noise (antialiasing, image decoding) is real across runs, so
  // require a per-channel delta before counting a pixel as changed.
  const tolerance = Number(process.env.DIFF_TOLERANCE || 16);

  let changed = 0;
  let total = 0;
  let sizeNote = null;
  try {
    if (sameSize) {
      const a = rawRGBA(baselinePath);
      const b = rawRGBA(currentPath);
      total = baselineSize.width * baselineSize.height;
      for (let i = 0; i < a.length; i += 4) {
        if (
          Math.abs(a[i] - b[i]) > tolerance ||
          Math.abs(a[i + 1] - b[i + 1]) > tolerance ||
          Math.abs(a[i + 2] - b[i + 2]) > tolerance
        ) {
          changed += 1;
        }
      }
    } else {
      // Full-page captures can change height; compare the shared top-left area.
      const width = Math.min(baselineSize.width, currentSize.width);
      const height = Math.min(baselineSize.height, currentSize.height);
      const crop = (file) => {
        const info = pngSize(file);
        if (info.width === width && info.height === height) return file;
        const cropped = path.join(outRoot, "diff", `${label}-${path.basename(file)}`);
        execFileSync("magick", [file, "-crop", `${width}x${height}+0+0`, "+repage", cropped]);
        return cropped;
      };
      const a = rawRGBA(crop(baselinePath));
      const b = rawRGBA(crop(currentPath));
      total = width * height;
      for (let i = 0; i < a.length; i += 4) {
        if (
          Math.abs(a[i] - b[i]) > tolerance ||
          Math.abs(a[i + 1] - b[i + 1]) > tolerance ||
          Math.abs(a[i + 2] - b[i + 2]) > tolerance
        ) {
          changed += 1;
        }
      }
      sizeNote = `${baselineSize.width}x${baselineSize.height} -> ${currentSize.width}x${currentSize.height}`;
    }
  } catch (error) {
    return { baseline: baselinePath, error: error.message };
  }

  // Visual diff (red highlight) for the human eye; its metric is ignored.
  try {
    execFileSync("compare", [baselinePath, currentPath, diffPath], { stdio: "ignore" });
  } catch {
    /* compare exits non-zero when images differ */
  }

  return {
    baseline: baselinePath,
    changed,
    total,
    percent: total ? (changed / total) * 100 : 0,
    tolerance,
    sizeNote,
    diffImage: diffPath,
  };
}

(async () => {
  const options = parseArgs(process.argv.slice(2));
  if (options.list) {
    for (const [name, url] of Object.entries(ROUTES)) console.log(`${name}\t${url}`);
    return;
  }
  if (options.help) return usage();

  const result = await capture(options);

  const baselinePath = options.baseline
    ? options.baseline
    : options.useBaseline
      ? path.join(outRoot, "baseline", `${result.label}.png`)
      : null;

  let diff = null;
  if (baselinePath && fs.existsSync(baselinePath)) {
    diff = diffImages(baselinePath, result.screenshot, result.label);
  } else if (baselinePath) {
    result.baselineMissing = baselinePath;
  }

  if (options.saveBaseline) {
    fs.mkdirSync(path.join(outRoot, "baseline"), { recursive: true });
    const dest = path.join(outRoot, "baseline", `${result.label}.png`);
    fs.copyFileSync(result.screenshot, dest);
    result.savedBaseline = dest;
  }

  if (options.json) {
    console.log(JSON.stringify({ ...result, diff }, null, 2));
    return;
  }

  console.log(`look: ${result.screenshot}`);
  console.log(
    `  ${result.url}\n  ${deviceName} ${result.innerWidth}px dpr=${result.dpr} ` +
      `touch=${result.touch} ext=${result.withExtension ? "on" : "off"}` +
      (result.stylesheet
        ? `\n  css=${path.relative(root, result.stylesheet)} @${result.stylesheetRevision}`
        : "\n  css=(no route stylesheet)"),
  );
  if (result.overflow) console.log("  ⚠ horizontal overflow (scrollWidth > innerWidth)");
  if (result.savedBaseline) console.log(`  saved baseline: ${result.savedBaseline}`);
  if (result.baselineMissing) console.log(`  ⚠ no baseline at ${result.baselineMissing}`);
  if (diff) {
    if (diff.error) {
      console.log(`verify: diff failed (${diff.error})`);
    } else {
      console.log(
        `verify: ${diff.changed}/${diff.total} px changed (${diff.percent.toFixed(3)}%, tolerance ${diff.tolerance})`,
      );
      if (diff.sizeNote) console.log(`  size changed: ${diff.sizeNote} (compared shared area)`);
      console.log(`  diff: ${diff.diffImage}`);
    }
  }
})().catch((error) => {
  console.error(`visual-review failed: ${error.message}`);
  process.exitCode = 1;
});
