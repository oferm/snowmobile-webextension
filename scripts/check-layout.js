process.env.PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS = "1";
const os = require("node:os");
const path = require("node:path");
const { webkit, devices } = require("playwright");
const { buildUserscriptSource } = require("./userscript-inject");

const args = process.argv.slice(2);
const opt = (n) => {
  const i = args.indexOf(`--${n}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const TOPIC = "https://snowheads.com/ski-forum/viewtopic.php?t=177125";
const urls = opt("url")
  ? [opt("url")]
  : [
      TOPIC,
      "https://snowheads.com/ski-forum/",
      "https://snowheads.com/ski-forum/viewforum.php?f=2",
    ];
const widths = opt("width") ? [Number(opt("width"))] : [390, 620];

function inPage() {
  const fails = [];
  const path = (el) => {
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
          .map((e) => `${path(e)} right=${Math.round(e.getBoundingClientRect().right)}`)
          .join("; "),
    );
  }
  const rows = [...document.querySelectorAll("#pagebody .forumline > tbody > tr")].filter(
    (tr) => tr.querySelector("td.row1 .message_cell, td.row2 .message_cell") ||
      (tr.querySelector(".message_cell") && tr.querySelector("td.row1, td.row2")),
  );
  if (rows.length) {
    const edges = new Set();
    const bgs = {};
    for (const tr of rows) {
      for (const td of tr.querySelectorAll("td.row1, td.row2")) {
        const r = td.getBoundingClientRect();
        edges.add(`${Math.round(r.left)}-${Math.round(r.right)}`);
        const k = td.classList.contains("row1") ? "row1" : "row2";
        (bgs[k] ||= new Set()).add(getComputedStyle(td).backgroundColor);
      }
    }
    const tdEdges = rows.map((tr) => {
      const td = tr.querySelector("td.row1, td.row2");
      const r = td.getBoundingClientRect();
      return `${Math.round(r.left)}-${Math.round(r.right)}`;
    });
    if (new Set(tdEdges).size > 1) fails.push(`post row edges differ: ${[...new Set(tdEdges)].join(", ")}`);
    if (bgs.row1 && bgs.row2) {
      const a = [...bgs.row1].join("|"), b = [...bgs.row2].join("|");
      if (a !== b) fails.push(`row1/row2 backgrounds differ: ${a} vs ${b}`);
    }
  }
  const bad = [];
  for (const pb of document.querySelectorAll(".postbody")) {
    const td = pb.closest("td");
    if (!td) continue;
    const tr = td.getBoundingClientRect();
    for (const el of pb.querySelectorAll("img, *")) {
      const r = el.getBoundingClientRect();
      if (r.width && r.right > tr.right + 1) bad.push(`${path(el)} right=${Math.round(r.right)} > td ${Math.round(tr.right)}`);
    }
  }
  if (bad.length) fails.push(`postbody overflow: ${bad.slice(0, 8).join("; ")}`);
  return { fails, rows: rows.length };
}

(async () => {
  const source = buildUserscriptSource();
  const context = await webkit.launchPersistentContext(
    path.join(os.homedir(), ".local", "share", "snowmobile-webkit"),
    { ignoreHTTPSErrors: true, headless: true, ...devices["iPhone 16e"] },
  );
  const page = context.pages()[0] || (await context.newPage());
  const results = [];
  for (const url of urls) {
    for (const width of widths) {
      const label = `${url.replace("https://snowheads.com", "")} @${width}`;
      try {
        await page.setViewportSize({ width, height: width < 500 ? 844 : 900 });
        const resp = await page.goto(url, { waitUntil: "load", timeout: 45000 });
        if (!resp || !resp.ok() || /login|ucp\.php/.test(new URL(page.url()).pathname + new URL(page.url()).search))
          throw Object.assign(new Error("skip"), { skip: `status ${resp && resp.status()} ${page.url()}` });
        await page.evaluate(source);
        await page.waitForTimeout(1500);
        const r = await page.evaluate(inPage);
        results.push({ label, status: r.fails.length ? "FAIL" : "PASS", detail: r.fails });
      } catch (e) {
        results.push({ label, status: "SKIP", detail: [e.skip || e.message.split("\n")[0]] });
      }
    }
  }
  await context.close();
  for (const r of results) console.log(`${r.status.padEnd(5)} ${r.label}`);
  for (const r of results.filter((r) => r.detail.length))
    for (const d of r.detail) console.log(`  ${r.status} ${r.label}: ${d}`);
  if (results.some((r) => r.status === "FAIL")) process.exitCode = 1;
})();
