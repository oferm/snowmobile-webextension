process.env.PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS = "1";
const crypto = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { webkit, devices } = require("playwright");
const { sampleUrls } = require("./userscript-config");
const { buildUserscriptSource } = require("./userscript-inject");

const args = process.argv.slice(2);
const hasFlag = (name) => args.includes(`--${name}`);
const opt = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};

const routeArg = opt("route") || opt("routes");
const urlArg = opt("url");
const widthArg = opt("width") || opt("widths");
const cached = hasFlag("cached") || hasFlag("refresh");
const refresh = hasFlag("refresh");
const jsonOut = hasFlag("json");
const waitMs = Number(opt("wait") ?? 250);
const cacheDir = process.env.SNOWMOBILE_CACHE_DIR || "/tmp/opencode/snowmobile-cache";

const targets = (() => {
  if (urlArg) return [{ name: "custom", url: urlArg }];
  const names = routeArg ? routeArg.split(",").map((s) => s.trim()).filter(Boolean) : Object.keys(sampleUrls);
  return names.map((name) => {
    const url = sampleUrls[name];
    if (!url) throw new Error(`Unknown route "${name}" (available: ${Object.keys(sampleUrls).join(", ")})`);
    return { name, url };
  });
})();

const widths = widthArg ? widthArg.split(",").map((n) => Number(n.trim())) : [390, 620];

function inPage() {
  const fails = [];
  const pathOf = (el) => {
    let s = el.tagName.toLowerCase();
    if (el.id) s += `#${el.id}`;
    else if (el.className && typeof el.className === "string")
      s += "." + el.className.trim().split(/\s+/).join(".");
    return s;
  };
  const sw = document.documentElement.scrollWidth;
  const iw = window.innerWidth;
  if (sw > iw + 8) {
    const over = [...document.querySelectorAll("body *")].filter(
      (e) => e.getBoundingClientRect().right > iw + 8,
    );
    const inner = over.filter((e) => !over.some((o) => o !== e && e.contains(o)));
    fails.push(
      `scrollWidth ${sw} > innerWidth ${iw}+8; innermost: ` +
        inner
          .slice(0, 8)
          .map((e) => `${pathOf(e)} right=${Math.round(e.getBoundingClientRect().right)}`)
          .join("; "),
    );
  }
  const rows = [...document.querySelectorAll("#pagebody .forumline > tbody > tr")].filter(
    (tr) =>
      tr.querySelector("td.row1 .message_cell, td.row2 .message_cell") ||
      (tr.querySelector(".message_cell") && tr.querySelector("td.row1, td.row2")),
  );
  if (rows.length) {
    const tdEdges = rows.map((tr) => {
      const td = tr.querySelector("td.row1, td.row2");
      const r = td.getBoundingClientRect();
      return `${Math.round(r.left)}-${Math.round(r.right)}`;
    });
    if (new Set(tdEdges).size > 1) fails.push(`post row edges differ: ${[...new Set(tdEdges)].join(", ")}`);
    if (window.innerWidth <= 600) {
      const postBackgrounds = rows.map((tr) =>
        getComputedStyle(tr.querySelector("td.row1, td.row2")).backgroundColor,
      );
      if (postBackgrounds.some((background, index) => index > 0 && background === postBackgrounds[index - 1])) {
        fails.push(`post card backgrounds do not alternate: ${postBackgrounds.join(", ")}`);
      }
      for (const tr of rows) {
        const postCell = tr.querySelector("td.row1, td.row2");
        const actionCell = tr.querySelector(".post_link_landscape")?.closest("td");
        if (postCell && actionCell && getComputedStyle(actionCell).backgroundColor !== getComputedStyle(postCell).backgroundColor) {
          fails.push("post action footer background differs from its card");
          break;
        }
      }
    }
  }
  const bad = [];
  for (const pb of document.querySelectorAll(".postbody")) {
    const td = pb.closest("td");
    if (!td) continue;
    const tr = td.getBoundingClientRect();
    for (const el of pb.querySelectorAll("img, *")) {
      const r = el.getBoundingClientRect();
      if (r.width && r.right > tr.right + 1)
        bad.push(`${pathOf(el)} right=${Math.round(r.right)} > td ${Math.round(tr.right)}`);
    }
  }
  if (bad.length) fails.push(`postbody overflow: ${bad.slice(0, 8).join("; ")}`);
  return { fails, rows: rows.length };
}

function harPathFor(target) {
  if (target.name !== "custom") return path.join(cacheDir, `${target.name}.har`);
  const hash = crypto.createHash("sha256").update(target.url).digest("hex").slice(0, 10);
  return path.join(cacheDir, `custom-${hash}.har`);
}

async function settlePage(page) {
  await page
    .waitForFunction(() => Boolean(document.querySelector(".snowmobile-toolbar")), { timeout: 2000 })
    .catch(() => {});
  await page.evaluate(() => document.fonts?.ready).catch(() => {});
  if (waitMs > 0) await page.waitForTimeout(waitMs);
}

(async () => {
  const source = buildUserscriptSource();
  const context = await webkit.launchPersistentContext(
    process.env.PLAYWRIGHT_USER_DATA_DIR ||
      path.join(os.homedir(), ".local", "share", "snowmobile-webkit"),
    { ignoreHTTPSErrors: true, headless: true, ...devices["iPhone 16e"] },
  );
  if (process.env.SNOWHEADS_COOKIES) {
    await context.addCookies(JSON.parse(fs.readFileSync(process.env.SNOWHEADS_COOKIES, "utf8")));
  }

  const results = [];
  for (const target of targets) {
    const page = await context.newPage();
    const harPath = cached ? harPathFor(target) : null;
    const recording = Boolean(harPath && (refresh || !fs.existsSync(harPath)));
    if (harPath) {
      fs.mkdirSync(path.dirname(harPath), { recursive: true });
      await page.routeFromHAR(
        harPath,
        recording
          ? { update: true, updateMode: "minimal" }
          : { update: false, notFound: "fallback" },
      );
    }

    let loaded = false;
    try {
      await page.setViewportSize({ width: widths[0], height: widths[0] < 500 ? 844 : 900 });
      const resp = await page.goto(target.url, { waitUntil: "load", timeout: 45000 });
      if (!resp || !resp.ok() || /login|ucp\.php/.test(new URL(page.url()).pathname + new URL(page.url()).search)) {
        throw Object.assign(new Error("skip"), { skip: `status ${resp && resp.status()} ${page.url()}` });
      }
      await page.evaluate(source);
      await settlePage(page);
      loaded = true;
    } catch (e) {
      for (const width of widths) {
        const label = `${target.url.replace("https://snowheads.com", "")} @${width}`;
        results.push({ route: target.name, width, label, status: "SKIP", detail: [e.skip || e.message.split("\n")[0]] });
      }
    }

    if (loaded) {
      for (let i = 0; i < widths.length; i += 1) {
        const width = widths[i];
        const label = `${target.url.replace("https://snowheads.com", "")} @${width}`;
        if (i > 0) {
          await page.setViewportSize({ width, height: width < 500 ? 844 : 900 });
          await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
        }
        const r = await page.evaluate(inPage);
        results.push({ route: target.name, width, label, status: r.fails.length ? "FAIL" : "PASS", detail: r.fails });
      }
    }

    await page.close();
  }

  await context.close();

  if (jsonOut) {
    console.log(JSON.stringify({ cached, results }, null, 2));
  } else {
    for (const r of results) console.log(`${r.status.padEnd(5)} ${r.label}`);
    for (const r of results.filter((r) => r.detail.length))
      for (const d of r.detail) console.log(`  ${r.status} ${r.label}: ${d}`);
  }
  if (results.some((r) => r.status === "FAIL")) process.exitCode = 1;
})().catch((error) => {
  console.error(`check-layout failed: ${error.message}`);
  process.exitCode = 1;
});
