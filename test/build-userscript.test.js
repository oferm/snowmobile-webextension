const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const { buildSource, minifyCss } = require("../scripts/build-userscript");
const { routes, sampleUrls, scripts, shared, stylesheets } = require("../scripts/userscript-config");

test("built userscript parses cleanly and includes route styles and scripts", () => {
  const source = buildSource();
  new vm.Script(source, { filename: "snowmobile.user.js" });

  assert.match(source, /if \(route\?\.script === "viewtopic"\)/);
  assert.match(source, /if \(route\?\.script === "viewforum"\)/);
  assert.match(source, /if \(route\?\.script === "start"\)/);
  assert.match(source, /function getRelativeDate\(posterInfo\)/);
  const themeBoot = source.indexOf("window.SnowmobileTheme = api");
  const styleInjection = source.indexOf("const addStyles = () =>");
  assert.ok(themeBoot >= 0 && themeBoot < styleInjection);
  assert.ok(source.includes(JSON.stringify(minifyCss(fs.readFileSync(shared.stylesheet, "utf8")))));
});

test("every JS source file parses cleanly", () => {
  const files = [
    path.join(root, "js", "theme.js"),
    path.join(root, "js", "perf.js"),
    shared.script,
    ...Object.values(scripts),
  ];
  for (const file of files) {
    new vm.Script(fs.readFileSync(file, "utf8"), { filename: path.basename(file) });
  }
});

test("manifest.json content scripts match userscript-config routes", () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, "manifest.json"), "utf8"));
  const declared = new Set(
    manifest.content_scripts.flatMap((entry) => [...(entry.css || []), ...(entry.js || [])]),
  );

  assert.ok(declared.has(path.relative(root, shared.stylesheet)));
  assert.ok(declared.has(path.relative(root, shared.script)));
  assert.ok(declared.has("js/theme.js"));
  const earlyTheme = manifest.content_scripts.find((entry) => entry.js?.includes("js/theme.js"));
  assert.equal(earlyTheme.run_at, "document_start");
  assert.ok(earlyTheme.js.indexOf("js/theme.js") < earlyTheme.js.indexOf("js/perf.js"));
  for (const route of routes) {
    assert.ok(declared.has(path.relative(root, stylesheets[route.style])));
    if (route.script) {
      assert.ok(declared.has(path.relative(root, scripts[route.script])));
    }
    assert.ok(sampleUrls[route.style], `Missing sampleUrls entry for ${route.style}`);
  }
});
