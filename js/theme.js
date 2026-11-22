(() => {
  "use strict";

  const KEY = "snowmobile:theme";
  const media = window.matchMedia?.("(prefers-color-scheme: dark)");

  function storedTheme() {
    try {
      const value = window.localStorage.getItem(KEY);
      return value === "dark" || value === "light" ? value : null;
    } catch {
      return null;
    }
  }

  function apply(theme) {
    const resolved = theme === "dark" || theme === "light"
      ? theme
      : media?.matches ? "dark" : "light";
    const root = document.documentElement;
    if (root) {
      root.dataset.snowmobileTheme = resolved;
      root.style.colorScheme = resolved;
    }
    document.querySelectorAll(".snowmobile-theme-toggle").forEach((toggle) => {
      toggle.setAttribute("aria-checked", String(resolved === "dark"));
      toggle.setAttribute("aria-label", `Dark mode ${resolved === "dark" ? "on" : "off"}`);
    });
    return resolved;
  }

  const api = {
    get() {
      return apply(storedTheme());
    },
    set(theme) {
      if (theme !== "dark" && theme !== "light") return api.get();
      try {
        window.localStorage.setItem(KEY, theme);
      } catch {
        /* Keep the current page usable when storage is unavailable. */
      }
      return apply(theme);
    },
    toggle() {
      return api.set(api.get() === "dark" ? "light" : "dark");
    },
  };

  window.SnowmobileTheme = api;
  api.get();

  media?.addEventListener?.("change", () => {
    if (!storedTheme()) api.get();
  });
  window.addEventListener("storage", (event) => {
    if (event.key === KEY || event.key === null) api.get();
  });
})();
