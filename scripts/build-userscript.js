const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { routes, stylesheets } = require("./userscript-config");

const root = path.resolve(__dirname, "..");
const packageJson = require(path.join(root, "package.json"));
const repository = "https://github.com/oferm/snowmobile-webextension";
const rawBase = "https://raw.githubusercontent.com/oferm/snowmobile-webextension/userscript";
const buildNumber = execFileSync(
  "git",
  ["rev-list", "--count", "HEAD"],
  { cwd: root, encoding: "utf8" },
).trim();
const version = `${packageJson.version}.${buildNumber}`;

const metadata = `// ==UserScript==
// @name         SnowMobile
// @namespace    ${repository}
// @version      ${version}
// @description  Make the Snowheads.com forum mobile-friendly
// @match        *://snowheads.com/*
// @updateURL    ${rawBase}/snowmobile.meta.js
// @downloadURL  ${rawBase}/snowmobile.user.js
// @grant        GM.addStyle
// @grant        GM_addStyle
// @run-at       document-idle
// ==/UserScript==
`;

const css = Object.fromEntries(
  Object.entries(stylesheets).map(([name, filename]) => [
    name,
    fs.readFileSync(filename, "utf8"),
  ]),
);

const source = `${metadata}
(() => {
  const routes = ${JSON.stringify(routes)};
  const styles = ${JSON.stringify(css)};
  const pathname = window.location.pathname;
  const route = routes.find(({ exact, pattern }) =>
    exact ? exact.includes(pathname) : new RegExp(pattern).test(pathname),
  );
  const css = route ? styles[route.style] : null;

  if (!css) return;
  if (typeof GM_addStyle === "function") {
    GM_addStyle(css);
  } else if (typeof GM !== "undefined" && typeof GM.addStyle === "function") {
    GM.addStyle(css);
  } else {
    const style = document.createElement("style");
    style.textContent = css;
    (document.head || document.documentElement).appendChild(style);
  }
})();
`;

const dist = path.join(root, "dist");
fs.mkdirSync(dist, { recursive: true });
fs.writeFileSync(path.join(dist, "snowmobile.user.js"), source);
fs.writeFileSync(path.join(dist, "snowmobile.meta.js"), metadata);
console.log(`Built SnowMobile userscript v${version}`);
