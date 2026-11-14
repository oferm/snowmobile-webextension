const { buildSource } = require("./build-userscript");

// Built in memory so parallel Playwright runs never read a half-written dist file.
function buildUserscriptSource() {
  return buildSource();
}

module.exports = { buildUserscriptSource };
