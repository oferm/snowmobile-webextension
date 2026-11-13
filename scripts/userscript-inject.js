const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const root = path.resolve(__dirname, "..");

function buildUserscriptSource() {
  execFileSync("node", [path.join(__dirname, "build-userscript.js")], {
    cwd: root,
    stdio: "ignore",
  });
  return fs.readFileSync(path.join(root, "dist", "snowmobile.user.js"), "utf8");
}

module.exports = { buildUserscriptSource };
