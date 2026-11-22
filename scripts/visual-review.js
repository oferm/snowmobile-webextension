#!/usr/bin/env node
"use strict";

/*
 * Screenshot-driven CSS iteration loop for SnowMobile.
 *
 *   node scripts/visual-review.js --route viewtopic --save-baseline --cached
 *   <edit css/>
 *   node scripts/visual-review.js --route viewtopic --use-baseline --cached
 *
 * Defaults to Chromium with the unpacked extension loaded; pass --engine webkit
 * to run the built userscript in iPhone 16e WebKit instead.
 */

if (process.argv.includes("webkit") || process.env.ENGINE === "webkit") {
  process.env.PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS = "1";
}

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const crypto = require("node:crypto");
const { execFileSync } = require("node:child_process");
const { chromium, webkit, devices } = require("playwright");
const { getStylesheetForUrl, sampleUrls } = require("./userscript-config");
const { buildUserscriptSource } = require("./userscript-inject");

const root = path.resolve(__dirname, "..");
const ROUTES = sampleUrls;

const outRoot = process.env.REVIEW_DIR || "/tmp/opencode/snowmobile-screenshots/loop";
const cacheDir = process.env.SNOWMOBILE_CACHE_DIR || "/tmp/opencode/snowmobile-cache";
const chromiumPath = process.env.CHROMIUM_PATH || "/usr/bin/chromium-browser";
const deviceName = process.env.DEVICE || "iPhone 16e";

function parseArgs(argv) {
  const options = {
    route: "viewtopic",
    theme: null,
    menuOpen: false,
    all: false,
    url: null,
    baseline: null,
    saveBaseline: false,
    useBaseline: false,
    full: false,
    withExtension: true,
    engine: (process.env.ENGINE || "chromium").toLowerCase(),
    cached: false,
    refresh: false,
    strip: true,
    label: null,
    wait: 300,
    json: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = () => argv[(i += 1)];
    switch (arg) {
      case "--route":
      case "--routes": options.route = next(); break;
      case "--theme": options.theme = next().toLowerCase(); break;
      case "--menu-open": options.menuOpen = true; break;
      case "--all": options.all = true; break;
      case "--url": options.url = next(); break;
      case "--baseline": options.baseline = next(); break;
      case "--label": options.label = next(); break;
      case "--engine": options.engine = next().toLowerCase(); break;
      case "--wait": options.wait = Number(next()); break;
      case "--save-baseline": options.saveBaseline = true; break;
      case "--use-baseline": options.useBaseline = true; break;
      case "--full": options.full = true; break;
      case "--no-ext": options.withExtension = false; break;
      case "--cached": options.cached = true; break;
      case "--refresh": options.refresh = true; options.cached = true; break;
      case "--no-strip": options.strip = false; break;
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
  console.log(`SnowMobile screenshot-driven CSS iteration

  node scripts/visual-review.js --route <route[,route]> [options]

Routes: ${Object.keys(ROUTES).join(", ")}

Options:
  --route <names>    Comma-separated routes (default: viewtopic)
  --theme <name>     Emulate light or dark preference and saved choice
  --menu-open        Capture with the shared menu expanded
  --all              Capture all routes
  --url <url>        Explicit URL (overrides --route)
  --engine <name>    chromium (extension, default) or webkit (userscript)
  --label <name>     Output file name (single target only)
  --full             Full-page screenshot instead of the phone viewport
  --wait <ms>        Settle time after load/fonts (default: 300)
  --no-ext           Launch without extension/userscript
  --cached           Replay/record HAR snapshots in ${cacheDir}
  --refresh          Re-record HAR snapshots (implies --cached)
  --save-baseline    Store capture(s) as route baseline
  --use-baseline     Diff capture(s) against stored baseline
  --baseline <png>   Diff against an explicit image (single target only)
  --no-strip         Skip generating the 1x side-by-side strip image
  --json             Machine-readable output

Environment: REVIEW_DIR, SNOWMOBILE_CACHE_DIR, SNOWMOBILE_PROFILE, CHROMIUM_PATH, DEVICE, ENGINE`);
}

function sha256(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function harPathFor(target) {
  if (target.name !== "custom") return path.join(cacheDir, `${target.name}.har`);
  const hash = crypto.createHash("sha256").update(target.url).digest("hex").slice(0, 10);
  return path.join(cacheDir, `custom-${hash}.har`);
}

function resolveTargets(options) {
  if (options.url) return [{ name: "custom", url: options.url }];
  const names = options.all
    ? Object.keys(ROUTES)
    : options.route.split(",").map((s) => s.trim()).filter(Boolean);
  return names.map((name) => {
    const url = ROUTES[name];
    if (!url) throw new Error(`Unknown route "${name}" (see --list)`);
    return { name, url };
  });
}

async function captureAll(targets, options) {
  const device = devices[deviceName];
  if (!device) throw new Error(`Unknown DEVICE "${deviceName}"`);
  if (!["chromium", "webkit"].includes(options.engine)) {
    throw new Error(`Unknown engine "${options.engine}" (use chromium or webkit)`);
  }

  if (options.engine === "webkit") {
    process.env.PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS = "1";
  }

  const profile =
    process.env.SNOWMOBILE_PROFILE ||
    path.join(
      os.homedir(),
      ".local",
      "share",
      options.engine === "webkit" ? "snowmobile-webkit" : "snowmobile-playwright",
    );

  const launchOpts = {
    ...device,
    headless: process.env.HEADLESS !== "false",
    ignoreHTTPSErrors: true,
  };

  if (options.engine === "chromium") {
    const args = ["--no-sandbox", "--disable-dev-shm-usage"];
    if (options.withExtension) {
      args.push(`--disable-extensions-except=${root}`, `--load-extension=${root}`);
    }
    launchOpts.executablePath = chromiumPath;
    launchOpts.chromiumSandbox = false;
    launchOpts.ignoreDefaultArgs = ["--disable-extensions"];
    launchOpts.args = args;
  }

  const userscriptSource =
    options.engine === "webkit" && options.withExtension ? buildUserscriptSource() : null;

  const launcher = options.engine === "webkit" ? webkit : chromium;
  const context = await launcher.launchPersistentContext(profile, launchOpts);

  if (process.env.SNOWHEADS_COOKIES) {
    await context.addCookies(JSON.parse(fs.readFileSync(process.env.SNOWHEADS_COOKIES, "utf8")));
  }

  const results = [];
  const deviceSlug = deviceName.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  fs.mkdirSync(path.join(outRoot, "current"), { recursive: true });

  try {
    for (const target of targets) {
      const page = await context.newPage();
      if (options.theme) {
        if (!["light", "dark"].includes(options.theme)) {
          throw new Error(`Unknown theme "${options.theme}" (use light or dark)`);
        }
        await page.emulateMedia({ colorScheme: options.theme });
        await page.addInitScript((selectedTheme) => {
          localStorage.setItem("snowmobile:theme", selectedTheme);
        }, options.theme);
      }
      const harPath = options.cached ? harPathFor(target) : null;
      const recording = Boolean(harPath && (options.refresh || !fs.existsSync(harPath)));
      if (harPath) {
        fs.mkdirSync(path.dirname(harPath), { recursive: true });
        await page.routeFromHAR(
          harPath,
          recording
            ? { update: true, updateMode: "minimal" }
            : { update: false, notFound: "fallback" },
        );
      }

      await page.goto(target.url, {
        waitUntil: recording ? "load" : "domcontentloaded",
        timeout: 60000,
      });

      if (userscriptSource) {
        await page.evaluate(userscriptSource);
      }
      if (options.withExtension) {
        await page
          .waitForFunction(() => Boolean(document.querySelector(".snowmobile-toolbar")), { timeout: 2500 })
          .catch(() => {});
      }
      await page.evaluate(() => document.fonts?.ready).catch(() => {});
      if (options.wait > 0) await page.waitForTimeout(options.wait);
      if (options.menuOpen) await page.locator(".snowmobile-menu-toggle").click();

      const metrics = await page.evaluate(() => {
        const iw = window.innerWidth;
        const sw = document.documentElement.scrollWidth;
        let offenders = [];
        if (sw > iw + 1) {
          const over = [...document.querySelectorAll("body *")].filter(
            (e) => e.getBoundingClientRect().right > iw + 1,
          );
          offenders = over
            .filter((e) => !over.some((o) => o !== e && e.contains(o)))
            .slice(0, 3)
            .map((e) => {
              const cls =
                e.className && typeof e.className === "string"
                  ? "." + e.className.trim().split(/\s+/).join(".")
                  : "";
              return `${e.tagName.toLowerCase()}${e.id ? `#${e.id}` : cls}@${Math.round(e.getBoundingClientRect().right)}`;
            });
        }
        return {
          url: location.href,
          title: document.title,
          innerWidth: iw,
          dpr: window.devicePixelRatio,
          touch: "ontouchstart" in window,
          scrollWidth: sw,
          enhanced: document.querySelectorAll(".snowmobile-enhanced").length,
          offenders,
        };
      });

      const stylesheet = getStylesheetForUrl(page.url());
      const label =
        options.label && targets.length === 1
          ? options.label
          : `${target.name}-${deviceSlug}${options.engine === "webkit" ? "-webkit" : ""}`;
      const currentPath = path.join(
        outRoot,
        "current",
        `${label}${options.withExtension ? "" : "-no-ext"}.png`,
      );
      await page.screenshot({ path: currentPath, fullPage: options.full });
      await page.close();

      results.push({
        ...metrics,
        route: target.name,
        label,
        engine: options.engine,
        stylesheet,
        stylesheetRevision: stylesheet ? sha256(stylesheet).slice(0, 12) : null,
        screenshot: currentPath,
        overflow: metrics.scrollWidth > metrics.innerWidth + 1,
        withExtension: options.withExtension,
        cached: options.cached,
      });
    }
  } finally {
    await context.close();
  }

  return results;
}

function pngSize(file) {
  const header = fs.readFileSync(file).subarray(0, 24);
  return { width: header.readUInt32BE(16), height: header.readUInt32BE(20) };
}

function rawRGBA(file, depth = 8) {
  return execFileSync("magick", [file, "-depth", String(depth), "rgba:-"], {
    maxBuffer: 1024 * 1024 * 256,
  });
}

function buildStrip(baselinePath, currentPath, diffPath, stripPath, { width, height, minY, maxY, dpr, innerWidth }) {
  const scaleWidth = innerWidth || Math.round(width / (dpr || 1));
  const maxFullHeight = 1100 * (dpr || 1);
  const args = [];
  if (height > maxFullHeight && maxY >= minY) {
    const pad = Math.round(140 * (dpr || 1));
    const cropTop = Math.max(0, minY - pad);
    const cropBottom = Math.min(height, maxY + 1 + pad);
    const cropHeight = Math.min(maxFullHeight, Math.max(Math.round(300 * (dpr || 1)), cropBottom - cropTop));
    const y = Math.min(cropTop, Math.max(0, height - cropHeight));
    args.push(
      "(", baselinePath, "-crop", `${width}x${cropHeight}+0+${y}`, "+repage", "-resize", `${scaleWidth}x`, ")",
      "(", currentPath, "-crop", `${width}x${cropHeight}+0+${y}`, "+repage", "-resize", `${scaleWidth}x`, ")",
      "(", diffPath, "-crop", `${width}x${cropHeight}+0+${y}`, "+repage", "-resize", `${scaleWidth}x`, ")",
    );
  } else {
    args.push(
      "(", baselinePath, "-resize", `${scaleWidth}x`, ")",
      "(", currentPath, "-resize", `${scaleWidth}x`, ")",
      "(", diffPath, "-resize", `${scaleWidth}x`, ")",
    );
  }
  args.push("+append", stripPath);
  execFileSync("magick", args);
}

function diffImages(baselinePath, currentPath, label, { dpr, innerWidth, makeStrip }) {
  fs.mkdirSync(path.join(outRoot, "diff"), { recursive: true });
  const diffPath = path.join(outRoot, "diff", `${label}-diff.png`);
  const stripPath = path.join(outRoot, "diff", `${label}-strip.png`);

  const baselineSize = pngSize(baselinePath);
  const currentSize = pngSize(currentPath);
  const sameSize =
    baselineSize.width === currentSize.width && baselineSize.height === currentSize.height;

  const tolerance = Number(process.env.DIFF_TOLERANCE || 16);
  const width = Math.min(baselineSize.width, currentSize.width);
  const height = Math.min(baselineSize.height, currentSize.height);
  const total = width * height;

  let changed = 0;
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  let sizeNote = null;

  try {
    let a;
    let b;
    if (sameSize) {
      a = rawRGBA(baselinePath);
      b = rawRGBA(currentPath);
    } else {
      const crop = (file) => {
        const info = pngSize(file);
        if (info.width === width && info.height === height) return file;
        const cropped = path.join(outRoot, "diff", `${label}-${path.basename(file)}`);
        execFileSync("magick", [file, "-crop", `${width}x${height}+0+0`, "+repage", cropped]);
        return cropped;
      };
      a = rawRGBA(crop(baselinePath));
      b = rawRGBA(crop(currentPath));
      sizeNote = `${baselineSize.width}x${baselineSize.height} -> ${currentSize.width}x${currentSize.height}`;
    }

    for (let idx = 0, px = 0; idx < a.length; idx += 4, px += 1) {
      if (
        Math.abs(a[idx] - b[idx]) > tolerance ||
        Math.abs(a[idx + 1] - b[idx + 1]) > tolerance ||
        Math.abs(a[idx + 2] - b[idx + 2]) > tolerance
      ) {
        changed += 1;
        const x = px % width;
        const y = (px - x) / width;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  } catch (error) {
    return { baseline: baselinePath, error: error.message };
  }

  const scale = dpr || 1;
  const bbox =
    changed > 0
      ? {
          x: Math.floor(minX / scale),
          y: Math.floor(minY / scale),
          w: Math.max(1, Math.ceil((maxX + 1 - minX) / scale)),
          h: Math.max(1, Math.ceil((maxY + 1 - minY) / scale)),
        }
      : null;

  if (changed === 0) {
    return {
      baseline: baselinePath,
      changed,
      total,
      percent: 0,
      tolerance,
      sizeNote,
      bbox: null,
      diffImage: null,
      stripImage: null,
    };
  }

  try {
    execFileSync("compare", [baselinePath, currentPath, diffPath], { stdio: "ignore" });
  } catch {
    /* compare exits non-zero when images differ */
  }

  let builtStrip = null;
  if (makeStrip && sameSize) {
    try {
      buildStrip(baselinePath, currentPath, diffPath, stripPath, {
        width,
        height,
        minY,
        maxY,
        dpr: scale,
        innerWidth,
      });
      builtStrip = stripPath;
    } catch {
      /* ignore strip generation failures */
    }
  }

  return {
    baseline: baselinePath,
    changed,
    total,
    percent: total ? (changed / total) * 100 : 0,
    tolerance,
    sizeNote,
    bbox,
    diffImage: diffPath,
    stripImage: builtStrip,
  };
}

(async () => {
  const options = parseArgs(process.argv.slice(2));
  if (options.list) {
    for (const [name, url] of Object.entries(ROUTES)) console.log(`${name}\t${url}`);
    return;
  }
  if (options.help) return usage();

  const targets = resolveTargets(options);
  const captures = await captureAll(targets, options);
  const outputs = [];

  for (const result of captures) {
    const baselinePath = options.baseline
      ? options.baseline
      : options.useBaseline
        ? path.join(outRoot, "baseline", `${result.label}.png`)
        : null;

    let diff = null;
    if (baselinePath && fs.existsSync(baselinePath)) {
      diff = diffImages(baselinePath, result.screenshot, result.label, {
        dpr: result.dpr,
        innerWidth: result.innerWidth,
        makeStrip: options.strip,
      });
    } else if (baselinePath) {
      result.baselineMissing = baselinePath;
    }

    if (options.saveBaseline) {
      fs.mkdirSync(path.join(outRoot, "baseline"), { recursive: true });
      const dest = path.join(outRoot, "baseline", `${result.label}.png`);
      fs.copyFileSync(result.screenshot, dest);
      result.savedBaseline = dest;
    }

    outputs.push({ ...result, diff });
  }

  if (options.json) {
    console.log(JSON.stringify(outputs.length === 1 ? outputs[0] : outputs, null, 2));
    return;
  }

  for (const item of outputs) {
    const { diff } = item;
    console.log(`look: ${item.screenshot}`);
    console.log(
      `  ${item.url}\n  ${item.engine} ${deviceName} ${item.innerWidth}px dpr=${item.dpr} ` +
        `touch=${item.touch} ext=${item.withExtension ? "on" : "off"}${item.cached ? " cached" : ""}` +
        (item.stylesheet
          ? `\n  css=${path.relative(root, item.stylesheet)} @${item.stylesheetRevision}`
          : "\n  css=(no route stylesheet)"),
    );
    if (item.overflow) {
      console.log(
        `  ⚠ horizontal overflow (${item.scrollWidth} > ${item.innerWidth})` +
          (item.offenders.length ? `: ${item.offenders.join(", ")}` : ""),
      );
    }
    if (item.savedBaseline) console.log(`  saved baseline: ${item.savedBaseline}`);
    if (item.baselineMissing) console.log(`  ⚠ no baseline at ${item.baselineMissing}`);
    if (diff) {
      if (diff.error) {
        console.log(`verify: diff failed (${diff.error})`);
      } else {
        const bboxStr = diff.bbox
          ? ` bbox=${diff.bbox.x},${diff.bbox.y},${diff.bbox.w}x${diff.bbox.h}`
          : "";
        console.log(
          `verify: ${diff.changed}/${diff.total} px changed (${diff.percent.toFixed(3)}%, tol ${diff.tolerance})${bboxStr}`,
        );
        if (diff.sizeNote) console.log(`  size changed: ${diff.sizeNote} (compared shared area)`);
        if (diff.stripImage) console.log(`  strip: ${diff.stripImage}`);
        if (diff.diffImage) console.log(`  diff: ${diff.diffImage}`);
      }
    }
  }
})().catch((error) => {
  console.error(`visual-review failed: ${error.message}`);
  process.exitCode = 1;
});
