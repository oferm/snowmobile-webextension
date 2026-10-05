const crypto = require("node:crypto");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { routes, stylesheets } = require("./userscript-config");

const host = "127.0.0.1";
const port = Number(process.env.PORT || 4173);
const baseUrl = `http://${host}:${port}`;
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

  if (!route) return null;

  const css = fs.readFileSync(stylesheets[route.style], "utf8");
  const revision = crypto.createHash("sha256").update(css).digest("hex");
  return { route: route.style, css, revision };
}

function localMetadata() {
  return `// ==UserScript==
// @name         SnowMobile local development
// @namespace    https://github.com/oferm/snowmobile-webextension
// @version      1.1.1
// @description  Live-load SnowMobile CSS from this Mac during development
// @match        *://snowheads.com/*
// @grant        GM.addStyle
// @grant        GM_addStyle
// @grant        GM.xmlHttpRequest
// @connect      127.0.0.1
// @connect      localhost
// @run-at       document-idle
// ==/UserScript==
`;
}

function localUserscript() {
  return `${localMetadata()}
(() => {
  const routes = ${JSON.stringify(routes)};
  const route = routes.find(({ exact, pattern }) =>
    exact ? exact.includes(location.pathname) : new RegExp(pattern).test(location.pathname),
  );
  if (!route) return;

  const server = ${JSON.stringify(baseUrl)};
  const revisionKey = "snowmobile-local-revision:" + route.style + ":" + location.pathname;
  const scrollKey = revisionKey + ":scroll";
  let pageRevision = null;
  let requestInFlight = false;
  let connectionWarningShown = false;

  async function addStyles(css) {
    if (typeof GM_addStyle === "function") {
      GM_addStyle(css);
    } else if (typeof GM !== "undefined" && typeof GM.addStyle === "function") {
      await GM.addStyle(css);
    } else {
      const style = document.createElement("style");
      style.textContent = css;
      (document.head || document.documentElement).appendChild(style);
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
          console.info("[SnowMobile local] CSS changed; refreshing to reinject through GM.addStyle");
          location.reload();
          return;
        }

        await addStyles(result.css);
        pageRevision = result.revision;
        sessionStorage.setItem(revisionKey, result.revision);
        console.info("[SnowMobile local] Applied " + result.route + " CSS (" + pageRevision.slice(0, 8) + ")");

        const savedScroll = sessionStorage.getItem(scrollKey);
        if (savedScroll !== null) {
          sessionStorage.removeItem(scrollKey);
          requestAnimationFrame(() => window.scrollTo(0, Number(savedScroll)));
        }
      } else if (result.revision !== pageRevision) {
        sessionStorage.setItem(revisionKey, result.revision);
        sessionStorage.setItem(scrollKey, String(window.scrollY));
        console.info("[SnowMobile local] CSS changed; refreshing to reinject through GM.addStyle");
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

  if (request.method !== "GET") {
    response.writeHead(405, { Allow: "GET" }).end("Method not allowed");
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
    if (!result) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("No SnowMobile stylesheet is configured for this path");
      return;
    }

    if (loggedRevisions.get(result.route) !== result.revision) {
      loggedRevisions.set(result.route, result.revision);
      console.log(
        `Safari requested ${result.route} CSS revision ${result.revision.slice(0, 8)}`,
      );
    }

    response.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    response.end(JSON.stringify(result));
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
