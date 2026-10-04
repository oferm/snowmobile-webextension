const path = require("node:path");

const stylesheets = {
  start: path.join(__dirname, "..", "css", "start.css"),
  forumlist: path.join(__dirname, "..", "css", "forumlist.css"),
  viewforum: path.join(__dirname, "..", "css", "viewforum.css"),
  viewtopic: path.join(__dirname, "..", "css", "viewtopic.css"),
};

const routes = [
  { style: "start", exact: ["/", "/index.php", "/mx/index.php"] },
  { style: "viewforum", pattern: "^/ski-forum/(?:viewforum|snow_reports)\\.php$" },
  { style: "forumlist", exact: ["/ski-forum/", "/ski-forum/index.php"] },
  { style: "viewtopic", exact: ["/ski-forum/viewtopic.php"] },
];

function getStylesheetForPathname(pathname) {
  const route = routes.find(({ exact, pattern }) =>
    exact ? exact.includes(pathname) : new RegExp(pattern).test(pathname),
  );
  return route ? stylesheets[route.style] : null;
}

function getStylesheetForUrl(url) {
  const parsedUrl = url instanceof URL ? url : new URL(url);
  if (parsedUrl.hostname !== "snowheads.com") return null;
  return getStylesheetForPathname(parsedUrl.pathname);
}

module.exports = { getStylesheetForPathname, getStylesheetForUrl, routes, stylesheets };
