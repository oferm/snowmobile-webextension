const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(__dirname, "..", "js", "theme.js"), "utf8");

function createTheme({ systemDark = false, initial = null } = {}) {
  const values = new Map(initial ? [["snowmobile:theme", initial]] : []);
  const listeners = {};
  const mediaListeners = {};
  const root = { dataset: {}, style: {} };
  const media = {
    matches: systemDark,
    addEventListener: (name, listener) => { mediaListeners[name] = listener; },
  };
  const attributes = {};
  const toggle = {
    setAttribute: (name, value) => { attributes[name] = value; },
  };
  const window = {
    localStorage: {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
    },
    matchMedia: () => media,
    addEventListener: (name, listener) => { listeners[name] = listener; },
  };
  const document = {
    documentElement: root,
    querySelectorAll: (selector) => selector === ".snowmobile-theme-toggle" ? [toggle] : [],
  };
  vm.runInNewContext(source, { window, document });
  return { root, attributes, values, listeners, media, mediaListeners, theme: window.SnowmobileTheme };
}

test("uses the system preference until the user chooses a theme", () => {
  const { root, attributes, media, mediaListeners, theme } = createTheme({ systemDark: true });
  assert.equal(root.dataset.snowmobileTheme, "dark");
  assert.equal(root.style.colorScheme, "dark");
  assert.equal(attributes["aria-checked"], "true");

  media.matches = false;
  mediaListeners.change();
  assert.equal(root.dataset.snowmobileTheme, "light");
  assert.equal(attributes["aria-checked"], "false");
  assert.equal(theme.get(), "light");
});

test("persists explicit choices and ignores later system changes", () => {
  const { root, values, media, mediaListeners, theme } = createTheme();
  assert.equal(theme.set("dark"), "dark");
  assert.equal(values.get("snowmobile:theme"), "dark");

  media.matches = false;
  mediaListeners.change();
  assert.equal(root.dataset.snowmobileTheme, "dark");
  assert.equal(theme.toggle(), "light");
  assert.equal(values.get("snowmobile:theme"), "light");
});

test("syncs stored theme changes from other tabs", () => {
  const { root, values, listeners } = createTheme();
  values.set("snowmobile:theme", "dark");
  listeners.storage({ key: "snowmobile:theme" });
  assert.equal(root.dataset.snowmobileTheme, "dark");
});
