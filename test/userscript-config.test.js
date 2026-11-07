const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const {
  getStylesheetForPathname,
  getStylesheetForUrl,
  getScriptForPathname,
  getScriptForUrl,
  routes,
  scripts,
} = require("../scripts/userscript-config");

test("routes Snowheads pages to their intended stylesheet", () => {
  const cases = [
    ["/", "start"],
    ["/index.php", "start"],
    ["/mx/index.php", "start"],
    ["/ski-forum/", "forumlist"],
    ["/ski-forum/index.php", "forumlist"],
    ["/ski-forum/viewforum.php", "viewforum"],
    ["/ski-forum/snow_reports.php", "viewforum"],
    ["/ski-forum/viewtopic.php", "viewtopic"],
  ];

  for (const [pathname, stylesheet] of cases) {
    assert.match(getStylesheetForPathname(pathname), new RegExp(`${stylesheet}\\.css$`));
  }
});

test("routes forum pages to their enhancement scripts", () => {
  const viewforum = routes.find(({ style }) => style === "viewforum");
  const viewtopic = routes.find(({ style }) => style === "viewtopic");

  assert.equal(viewforum.script, "viewforum");
  assert.equal(path.basename(scripts[viewforum.script]), "viewforum.js");
  assert.equal(getScriptForPathname("/ski-forum/viewforum.php"), scripts.viewforum);
  assert.equal(
    getScriptForUrl("https://snowheads.com/ski-forum/viewforum.php?f=2"),
    scripts.viewforum,
  );
  assert.equal(viewtopic.script, "viewtopic");
  assert.equal(path.basename(scripts[viewtopic.script]), "viewtopic.js");
  assert.equal(getScriptForPathname("/ski-forum/viewtopic.php"), scripts.viewtopic);
  assert.equal(
    getScriptForUrl("https://snowheads.com/ski-forum/viewtopic.php?t=123"),
    scripts.viewtopic,
  );
  assert.equal(getScriptForPathname("/ski-forum/"), null);
});

test("routes home pages to the home-page enhancement script", () => {
  const route = routes.find(({ style }) => style === "start");

  assert.equal(route.script, "start");
  assert.equal(path.basename(scripts.start), "start.js");
  assert.equal(getScriptForPathname("/"), scripts.start);
  assert.equal(getScriptForUrl("https://snowheads.com/"), scripts.start);
});

test("does not style unknown paths or other hosts", () => {
  assert.equal(getStylesheetForPathname("/not-a-forum-page"), null);
  assert.equal(getStylesheetForUrl("https://example.com/ski-forum/viewtopic.php"), null);
  assert.equal(getScriptForUrl("https://example.com/ski-forum/viewtopic.php"), null);
  assert.match(
    getStylesheetForUrl("https://snowheads.com/ski-forum/viewtopic.php?t=123"),
    /viewtopic\.css$/,
  );
});
