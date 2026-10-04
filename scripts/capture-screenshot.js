const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { chromium } = require("playwright");
const { getStylesheetForUrl } = require("./userscript-config");

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
    },
  );

  const page = context.pages()[0] || await context.newPage();
  await page.goto(url, { waitUntil: "domcontentloaded" });
  const stylesheet = getStylesheetForUrl(page.url());
  if (stylesheet) await page.addStyleTag({ path: stylesheet });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: output, fullPage: true });
  console.log(`Saved ${output}`);
  await context.close();
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
