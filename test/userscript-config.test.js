const test = require("node:test");
const assert = require("node:assert/strict");
const { getStylesheetForPathname, getStylesheetForUrl } = require("../scripts/userscript-config");

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

test("does not style unknown paths or other hosts", () => {
  assert.equal(getStylesheetForPathname("/not-a-forum-page"), null);
  assert.equal(getStylesheetForUrl("https://example.com/ski-forum/viewtopic.php"), null);
  assert.match(
    getStylesheetForUrl("https://snowheads.com/ski-forum/viewtopic.php?t=123"),
    /viewtopic\.css$/,
  );
});
