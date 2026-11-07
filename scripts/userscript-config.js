const path = require("node:path");

const stylesheets = {
  start: path.join(__dirname, "..", "css", "start.css"),
  forumlist: path.join(__dirname, "..", "css", "forumlist.css"),
  viewforum: path.join(__dirname, "..", "css", "viewforum.css"),
  viewtopic: path.join(__dirname, "..", "css", "viewtopic.css"),
};

const scripts = {
  start: path.join(__dirname, "..", "js", "start.js"),
  viewforum: path.join(__dirname, "..", "js", "viewforum.js"),
  viewtopic: path.join(__dirname, "..", "js", "viewtopic.js"),
};

const routes = [
  { style: "start", exact: ["/", "/index.php", "/mx/index.php"], script: "start" },
  {
    style: "viewforum",
    pattern: "^/ski-forum/(?:viewforum|snow_reports)\\.php$",
    script: "viewforum",
  },
  { style: "forumlist", exact: ["/ski-forum/", "/ski-forum/index.php"] },
  { style: "viewtopic", exact: ["/ski-forum/viewtopic.php"], script: "viewtopic" },
];

function getRouteForPathname(pathname) {
  return routes.find(({ exact, pattern }) =>
    exact ? exact.includes(pathname) : new RegExp(pattern).test(pathname),
  );
}

function getStylesheetForPathname(pathname) {
  const route = getRouteForPathname(pathname);
  return route ? stylesheets[route.style] : null;
}

function getScriptForPathname(pathname) {
  const route = getRouteForPathname(pathname);
  return route?.script ? scripts[route.script] : null;
}

function getStylesheetForUrl(url) {
  const parsedUrl = url instanceof URL ? url : new URL(url);
  if (parsedUrl.hostname !== "snowheads.com") return null;
  return getStylesheetForPathname(parsedUrl.pathname);
}

function getScriptForUrl(url) {
  const parsedUrl = url instanceof URL ? url : new URL(url);
  if (parsedUrl.hostname !== "snowheads.com") return null;
  return getScriptForPathname(parsedUrl.pathname);
}

module.exports = {
  getScriptForPathname,
  getScriptForUrl,
  getStylesheetForPathname,
  getStylesheetForUrl,
  routes,
  scripts,
  stylesheets,
};
