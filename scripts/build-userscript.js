const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { routes, scripts: scriptFiles, shared, stylesheets } = require("./userscript-config");

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
// @match        *://www.snowheads.com/*
// @updateURL    ${rawBase}/snowmobile.meta.js
// @downloadURL  ${rawBase}/snowmobile.user.js
// @grant        none
// @run-at       document-start
// ==/UserScript==
`;

function minifyCss(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{};])\s*/g, "$1")
    .replace(/;}/g, "}")
    .trim();
}

function buildSource() {
const earlyScript = ["theme.js", "perf.js"]
  .map((file) => fs.readFileSync(path.join(root, "js", file), "utf8"))
  .join("\n");
const css = Object.fromEntries(
  Object.entries(stylesheets).map(([name, filename]) => [
    name,
    minifyCss(fs.readFileSync(filename, "utf8")),
  ]),
);

const scripts = Object.fromEntries(
  Object.entries(scriptFiles).map(([name, filename]) => [
    name,
    fs.readFileSync(filename, "utf8"),
  ]),
);
const sharedCss = minifyCss(fs.readFileSync(shared.stylesheet, "utf8"));
const sharedScript = fs.readFileSync(shared.script, "utf8");
const scriptCases = Object.entries(scripts)
  .map(([name, script]) => `if (route?.script === ${JSON.stringify(name)}) {\n${script}\n}`)
  .join("\n");

return `${metadata}
(() => {
  ${earlyScript}
  const routes = ${JSON.stringify(routes)};
  const styles = ${JSON.stringify(css)};
  const pathname = window.location.pathname;
  const route = routes.find(({ exact, pattern }) =>
    exact ? exact.includes(pathname) : new RegExp(pattern).test(pathname),
  );
  // GM.addStyle injects a user-origin stylesheet in Safari, which the site's own
  // (author) CSS beats regardless of specificity. A <style> element is author-origin.
  const addStyles = () => {
    const target = document.head || document.documentElement;
    if (!target) return false;
    const style = document.createElement("style");
    style.textContent = ${JSON.stringify(sharedCss)} + (route ? styles[route.style] : "");
    target.appendChild(style);
    return true;
  };
  if (!addStyles()) {
    const rootObserver = new MutationObserver(() => {
      if (addStyles()) rootObserver.disconnect();
    });
    rootObserver.observe(document, { childList: true });
  }

  {
    ${sharedScript}
  }
  ${scriptCases}
})();
`;
}

module.exports = { buildSource, metadata, minifyCss };

if (require.main === module) {
const source = buildSource();
const dist = path.join(root, "dist");
fs.mkdirSync(dist, { recursive: true });
fs.writeFileSync(path.join(dist, "snowmobile.user.js"), source);
fs.writeFileSync(path.join(dist, "snowmobile.meta.js"), metadata);
console.log(`Built SnowMobile userscript v${version}`);
}
