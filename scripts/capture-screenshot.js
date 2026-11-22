const crypto = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { chromium, webkit, devices } = require("playwright");
const { sampleUrls } = require("./userscript-config");
const { buildUserscriptSource } = require("./userscript-inject");

if ((process.env.ENGINE || "webkit").toLowerCase() === "webkit") {
  process.env.PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS = "1";
}

const args = process.argv.slice(2);
const hasFlag = (name) => args.includes(`--${name}`);
const opt = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const positional = [];
for (let i = 0; i < args.length; i += 1) {
  if (args[i].startsWith("--")) {
    if (["--route", "--wait"].includes(args[i])) i += 1;
  } else {
    positional.push(args[i]);
  }
}

const routeName = opt("route");
const url = positional[0] || (routeName ? sampleUrls[routeName] : null) || sampleUrls.viewtopic;
if (!url) {
  console.error(`Unknown route "${routeName}" (available: ${Object.keys(sampleUrls).join(", ")})`);
  process.exit(1);
}

const engine = (process.env.ENGINE || "webkit").toLowerCase();
const deviceName = process.env.DEVICE || "iPhone 16e";
const headless = process.env.HEADLESS !== "false";
const fullPage = !(hasFlag("viewport") || hasFlag("no-full"));
const cached = hasFlag("cached") || hasFlag("refresh");
const refresh = hasFlag("refresh");
const waitMs = Number(opt("wait") ?? 300);
const cacheDir = process.env.SNOWMOBILE_CACHE_DIR || "/tmp/opencode/snowmobile-cache";

const device = devices[deviceName];
if (!device) {
  console.error(`Unknown DEVICE "${deviceName}".`);
  process.exit(1);
}

const contextOptions = {
  ...device,
  headless,
  executablePath:
    engine === "chromium"
      ? process.env.CHROMIUM_PATH || "/usr/bin/chromium-browser"
      : undefined,
};

if (process.env.VIEWPORT_WIDTH || process.env.VIEWPORT_HEIGHT) {
  contextOptions.viewport = {
    width: Number(process.env.VIEWPORT_WIDTH || device.viewport.width),
    height: Number(process.env.VIEWPORT_HEIGHT || device.viewport.height),
  };
}

const label = `${engine}-${deviceName.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
const output =
  process.env.SCREENSHOT ||
  path.join("/tmp", "opencode", "snowmobile-screenshots", `${label}.png`);

fs.mkdirSync(path.dirname(output), { recursive: true });
const userscriptSource = buildUserscriptSource();

(async () => {
  const launcher = engine === "chromium" ? chromium : webkit;
  const userDataDir =
    process.env.PLAYWRIGHT_USER_DATA_DIR ||
    path.join(os.homedir(), ".local", "share", `snowmobile-${engine}`);

  const context = await launcher.launchPersistentContext(userDataDir, {
    ignoreHTTPSErrors: true,
    ...contextOptions,
  });

  if (process.env.SNOWHEADS_COOKIES) {
    await context.addCookies(JSON.parse(fs.readFileSync(process.env.SNOWHEADS_COOKIES, "utf8")));
  }

  const page = context.pages()[0] || (await context.newPage());
  if (cached) {
    const hash = crypto.createHash("sha256").update(url).digest("hex").slice(0, 10);
    const harPath = routeName
      ? path.join(cacheDir, `${routeName}.har`)
      : path.join(cacheDir, `custom-${hash}.har`);
    const recording = refresh || !fs.existsSync(harPath);
    fs.mkdirSync(path.dirname(harPath), { recursive: true });
    await page.routeFromHAR(
      harPath,
      recording ? { update: true, updateMode: "minimal" } : { update: false, notFound: "fallback" },
    );
  }

  await page.goto(url, { waitUntil: cached ? "load" : "domcontentloaded" });
  await page.evaluate(userscriptSource);
  await page
    .waitForFunction(() => Boolean(document.querySelector(".snowmobile-toolbar")), { timeout: 2500 })
    .catch(() => {});
  await page.evaluate(() => document.fonts?.ready).catch(() => {});
  if (waitMs > 0) await page.waitForTimeout(waitMs);
  await page.screenshot({ path: output, fullPage });

  const metrics = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    dpr: window.devicePixelRatio,
    touch: "ontouchstart" in window,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  const overflow = metrics.scrollWidth > metrics.innerWidth + 1;
  console.log(`Saved ${output}`);
  console.log(
    `  ${engine} ${deviceName}: innerWidth=${metrics.innerWidth} dpr=${metrics.dpr} ` +
      `touch=${metrics.touch} scrollWidth=${metrics.scrollWidth}` +
      (overflow ? "  ⚠ horizontal overflow" : ""),
  );
  await context.close();
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
