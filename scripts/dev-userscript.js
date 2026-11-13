const crypto = require("node:crypto");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { routes, scripts, stylesheets } = require("./userscript-config");

const host = process.env.HOST || "127.0.0.1";
const publicHost = process.env.PUBLIC_HOST || host;
const port = Number(process.env.PORT || 4173);
const baseUrl = `http://${publicHost}:${port}`;
const reportsDir = path.join(__dirname, "..", "dist", "reports");
const reportPath = path.join(__dirname, "..", "dist", "report.json");
const diagnosticsPath = path.join(__dirname, "diagnostics-client.js");
const loggedRevisions = new Map();
const localScriptPath = path.join(__dirname, "..", "dist", "snowmobile.local.user.js");

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error(`Invalid PORT "${process.env.PORT}". Choose a port from 1 to 65535.`);
  process.exit(1);
}

function getStyleForPathname(pathname) {
  const route = routes.find(({ exact, pattern }) =>
    exact ? exact.includes(pathname) : new RegExp(pattern).test(pathname),
  );

  if (!route) return { route: null, css: "", script: "", revision: "none" };

  const css = fs.readFileSync(stylesheets[route.style], "utf8");
  const script = route.script ? fs.readFileSync(scripts[route.script], "utf8") : "";
  const revision = crypto.createHash("sha256").update(css).update("\0").update(script).digest("hex");
  return { route: route.style, css, script, revision };
}

function localMetadata() {
  return `// ==UserScript==
// @name         SnowMobile local development
// @namespace    https://github.com/oferm/snowmobile-webextension
// @version      1.3.0
// @description  Live-load SnowMobile CSS from this Mac during development
// @match        *://snowheads.com/*
// @match        *://www.snowheads.com/*
// @grant        GM.xmlHttpRequest
// @connect      127.0.0.1
// @connect      localhost
// @connect      ${publicHost}
// @run-at       document-idle
// ==/UserScript==
`;
}

function localUserscript() {
  return `${localMetadata()}
(() => {
  const server = ${JSON.stringify(baseUrl)};
  const pageKey = location.pathname;
  const revisionKey = "snowmobile-local-revision:" + pageKey;
  const scrollKey = revisionKey + ":scroll";
  let pageRevision = null;
  let requestInFlight = false;
  let connectionWarningShown = false;

  function addStyles(css) {
    // A <style> element is author-origin, like the production userscript.
    const style = document.createElement("style");
    style.id = "snowmobile-local-style";
    style.textContent = css;
    (document.head || document.documentElement).appendChild(style);
  }

  async function send(payload) {
    try {
      await GM.xmlHttpRequest({
        method: "POST",
        url: server + "/report",
        headers: { "Content-Type": "application/json" },
        data: JSON.stringify(payload),
        timeout: 5000,
      });
    } catch (error) {
      console.warn("[SnowMobile local] Could not send diagnostic report", error);
    }
  }

  function run(source) {
    try {
      new Function("send", source)(send);
    } catch (error) {
      console.warn("[SnowMobile local] Script failed", error);
    }
  }

  async function refreshStyles() {
    if (requestInFlight) return;
    requestInFlight = true;

    try {
      const response = await GM.xmlHttpRequest({
        method: "GET",
        url: server + "/style?path=" + encodeURIComponent(location.pathname),
        timeout: 5000,
      });
      if (response.status !== 200) throw new Error("HTTP " + response.status);

      const result = JSON.parse(response.responseText);
      if (pageRevision === null) {
        const previouslyApplied = sessionStorage.getItem(revisionKey);
        if (previouslyApplied && previouslyApplied !== result.revision) {
          sessionStorage.setItem(revisionKey, result.revision);
          sessionStorage.setItem(scrollKey, String(window.scrollY));
          location.reload();
          return;
        }

        if (result.css) addStyles(result.css);
        if (result.script) run(result.script);
        if (result.diagnostics) run(result.diagnostics);
        pageRevision = result.revision;
        sessionStorage.setItem(revisionKey, result.revision);
        console.info("[SnowMobile local] Applied " + result.route + " (" + pageRevision.slice(0, 8) + ")");

        const savedScroll = sessionStorage.getItem(scrollKey);
        if (savedScroll !== null) {
          sessionStorage.removeItem(scrollKey);
          requestAnimationFrame(() => window.scrollTo(0, Number(savedScroll)));
        }
      } else if (result.revision !== pageRevision) {
        sessionStorage.setItem(revisionKey, result.revision);
        sessionStorage.setItem(scrollKey, String(window.scrollY));
        location.reload();
      }
      connectionWarningShown = false;
    } catch (error) {
      if (!connectionWarningShown) {
        console.warn("[SnowMobile local] Cannot reach " + server + "; is yarn dev:safari running?", error);
        connectionWarningShown = true;
      }
    } finally {
      requestInFlight = false;
    }
  }

  refreshStyles();
  setInterval(refreshStyles, 1000);
})();
`;
}

fs.mkdirSync(path.dirname(localScriptPath), { recursive: true });
fs.writeFileSync(localScriptPath, localUserscript());

if (process.argv.includes("--build-only")) process.exit(0);

const server = http.createServer((request, response) => {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("X-Content-Type-Options", "nosniff");

  if (request.method === "POST" && new URL(request.url, baseUrl).pathname === "/report") {
    let body = "";
    request.on("data", (chunk) => { body += chunk; if (body.length > 2e6) request.destroy(); });
    request.on("end", () => {
      try {
        const report = JSON.parse(body);
        const u = new URL(report.url);
        const slug = (u.pathname + u.search).replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "root";
        fs.mkdirSync(reportsDir, { recursive: true });
        fs.writeFileSync(path.join(reportsDir, `${slug}.json`), body);
        fs.writeFileSync(reportPath, body);
        const family = /iPhone/.test(report.ua) ? "iPhone" : /Mac/.test(report.ua) ? "Mac" : "other";
        console.log(`Report ${report.url} [${family}] scrollWidth ${report.scrollWidth} vs innerWidth ${report.innerWidth}${report.problem ? " PROBLEM" : ""}`);
        response.writeHead(204).end();
      } catch (error) {
        console.warn("Bad report:", error.message);
        response.writeHead(400).end("Bad report");
      }
    });
    return;
  }

  if (request.method !== "GET") {
    response.writeHead(405, { Allow: "GET, POST" }).end("Method not allowed");
    return;
  }

  const url = new URL(request.url, baseUrl);
  if (url.pathname === "/snowmobile.local.user.js") {
    response.writeHead(200, { "Content-Type": "application/javascript; charset=utf-8" });
    response.end(fs.readFileSync(localScriptPath));
    return;
  }

  if (url.pathname === "/style") {
    const result = getStyleForPathname(url.searchParams.get("path") || "");

    if (result.route && loggedRevisions.get(result.route) !== result.revision) {
      loggedRevisions.set(result.route, result.revision);
      console.log(
        `Safari requested ${result.route} CSS revision ${result.revision.slice(0, 8)}`,
      );
    }

    response.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    response.end(JSON.stringify({ ...result, diagnostics: fs.readFileSync(diagnosticsPath, "utf8") }));
    return;
  }

  response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  response.end("Not found");
});

server.on("error", (error) => {
  console.error(`Could not start the Safari dev server at ${baseUrl}: ${error.message}`);
  process.exitCode = 1;
});

server.listen(port, host, () => {
  console.log(`SnowMobile Safari dev server: ${baseUrl}`);
  console.log(`Install the local userscript in Safari: ${baseUrl}/snowmobile.local.user.js`);
  console.log("Leave this running; CSS edits are applied to matching Safari tabs within about a second.");
});
