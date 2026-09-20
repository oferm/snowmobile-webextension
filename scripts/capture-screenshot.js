const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { chromium } = require("playwright");

const extensionPath = path.resolve(__dirname, "..");
const url = process.argv[2] ||
  "https://snowheads.com/ski-forum/viewtopic.php?t=177296#5602301";
const width = Number(process.env.VIEWPORT_WIDTH || 390);
const height = Number(process.env.VIEWPORT_HEIGHT || 844);
const output = process.env.SCREENSHOT ||
  path.join(os.tmpdir(), "opencode", "snowmobile-screenshots", `${width}x${height}.png`);

fs.mkdirSync(path.dirname(output), { recursive: true });

(async () => {
const context = await chromium.launchPersistentContext(
    process.env.PLAYWRIGHT_USER_DATA_DIR ||
      path.join(os.homedir(), ".local", "share", "snowmobile-playwright"),
    {
      executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium-browser",
      headless: false,
      viewport: { width, height },
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
      ],
    },
  );

  const page = context.pages()[0] || await context.newPage();
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: output, fullPage: true });
  console.log(`Saved ${output}`);
  await context.close();
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
