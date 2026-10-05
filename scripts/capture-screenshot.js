const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { chromium, webkit, devices } = require("playwright");
const { getStylesheetForUrl } = require("./userscript-config");

// Playwright's WebKit build is an Ubuntu binary and its host validation only
// knows Ubuntu package names, so it reports missing deps on Fedora even after
// scripts/install-webkit-deps.js has supplied the libraries. The browser itself
// launches fine, so skip the (distro-specific) validation.
if ((process.env.ENGINE || "webkit") === "webkit") {
  process.env.PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS = "1";
}

const url =
  process.argv[2] ||
  "https://snowheads.com/ski-forum/viewtopic.php?t=177296#5602301";
const engine = (process.env.ENGINE || "webkit").toLowerCase();
const deviceName = process.env.DEVICE || "iPhone 16e";
const headless = process.env.HEADLESS !== "false";

const device = devices[deviceName];
if (!device) {
  console.error(`Unknown DEVICE "${deviceName}".`);
  process.exitCode = 1;
  return;
}

// Emulate an actual phone instead of a desktop window squeezed to phone width:
// the device profile adds the mobile layout viewport (where `width=device-width`
// resolves correctly against the fixed-width page), DPR, touch and an iOS UA.
const contextOptions = {
  ...device,
  headless,
  executablePath:
    engine === "chromium"
      ? process.env.CHROMIUM_PATH || "/usr/bin/chromium-browser"
      : undefined,
};

// Optional manual viewport override, kept for quick comparisons.
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

(async () => {
  const launcher = engine === "chromium" ? chromium : webkit;
  const userDataDir =
    process.env.PLAYWRIGHT_USER_DATA_DIR ||
    path.join(os.homedir(), ".local", "share", `snowmobile-${engine}`);

  const context = await launcher.launchPersistentContext(userDataDir, {
    ignoreHTTPSErrors: true,
    ...contextOptions,
  });

  const page = context.pages()[0] || (await context.newPage());
  await page.goto(url, { waitUntil: "domcontentloaded" });
  const stylesheet = getStylesheetForUrl(page.url());
  if (stylesheet) await page.addStyleTag({ path: stylesheet });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: output, fullPage: true });

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
