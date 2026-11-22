// ==UserScript==
// @name         SnowMobile
// @namespace    https://github.com/oferm/snowmobile-webextension
// @version      1.3.0.45
// @description  Make the Snowheads.com forum mobile-friendly
// @match        *://snowheads.com/*
// @match        *://www.snowheads.com/*
// @updateURL    https://raw.githubusercontent.com/oferm/snowmobile-webextension/userscript/snowmobile.meta.js
// @downloadURL  https://raw.githubusercontent.com/oferm/snowmobile-webextension/userscript/snowmobile.user.js
// @grant        none
// @run-at       document-start
// ==/UserScript==

(() => {
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

(() => {
  "use strict";

  // The shared theme bootstrap runs before page paint in the extension and
  // production userscript. Keep the route-specific image optimization below.

  // Keep off-screen post images from competing with the page's initial render.
  // Start observing at document-start so parser-created images are marked as
  // soon as their post row enters the document.
  if (!/^\/ski-forum\/viewtopic\.php$/.test(window.location.pathname)) return;

  function prepareImage(image) {
    if (!image.closest(".post_row")) return;
    if (!image.hasAttribute("loading")) image.loading = "lazy";
    if (!image.hasAttribute("decoding")) image.decoding = "async";
  }

  function prepareImages(root) {
    if (root instanceof HTMLImageElement) prepareImage(root);
    root.querySelectorAll?.("img").forEach(prepareImage);
  }

  const observer = new MutationObserver((records) => {
    for (const record of records) {
      record.addedNodes.forEach(prepareImages);
    }
  });
  observer.observe(document, { childList: true, subtree: true });
  prepareImages(document);
  document.addEventListener("DOMContentLoaded", () => observer.disconnect(), { once: true });
})();

  const routes = [{"style":"start","exact":["/","/index.php","/mx/index.php"],"script":"start"},{"style":"viewforum","pattern":"^/ski-forum/(?:viewforum|snow_reports)\\.php$","script":"viewforum"},{"style":"forumlist","exact":["/ski-forum/","/ski-forum/index.php"]},{"style":"viewtopic","exact":["/ski-forum/viewtopic.php"],"script":"viewtopic"}];
  const styles = {"start":"body{background: #f2f4f7 !important;color: #263442;font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif !important}.snowmobile-home-root{box-sizing: border-box;max-width: 100%;width: 100%}.snowmobile-home-root > .snowmobile-home-inner{box-sizing: border-box;max-width: 100%;padding: 0 !important;width: 100% !important}.snowmobile-home-root .forumline{background-color: #fff;box-sizing: border-box;max-width: 100%;border: 0 !important;border-radius: 15px;box-shadow: 0 2px 10px rgba(28, 44, 60, 0.07);margin-bottom: 14px;overflow: hidden;width: 100% !important}.snowmobile-home-layout{border-spacing: 0 !important;display: block;max-width: 100% !important;table-layout: fixed !important;width: 100% !important}.snowmobile-home-layout > tbody{display: block;width: 100%}.snowmobile-home-layout > tbody > tr{display: flex !important;flex-direction: column;width: 100%}.snowmobile-home-layout > tbody > tr > td{box-sizing: border-box;display: flex !important;flex-direction: column;max-width: 100% !important;min-width: 0;padding: 0 8px;width: 100% !important}.snowmobile-home-layout > tbody > tr > td:first-child{order: 2}.snowmobile-home-layout > tbody > tr > td:nth-child(2){order: 1}.snowmobile-home-layout > tbody > tr > td:nth-child(3){order: 3}.snowmobile-home-layout .forumline .row1, .snowmobile-home-layout .forumline .row2{background-color: #fff !important;margin-top: 0}.snowmobile-home-layout .forumline td{background-color: #fff !important}.snowmobile-home-layout .snowmobile-recent-posts td.row2{background-color: #eef3f7 !important}.snowmobile-home-layout .forumline .genmed{border: none !important}.snowmobile-home-layout .forumline .btnhov, .snowmobile-home-layout .forumline .btnunhov{background-color: #fff;color: inherit;margin-top: 0}.snowmobile-home-layout .genmed img{margin-right: 5px}.snowmobile-home-layout .thHead .cattitle{color: #263442 !important;font-weight: 650}.snowmobile-home-layout .forumline > tbody > tr > th{background: #f8fafc !important;border: 0 !important;border-bottom: 1px solid #e3e8ed !important;border-left: 3px solid #e2b43e !important;color: #263442 !important;font-size: 16px;font-weight: 650;padding: 11px 12px !important;text-align: left !important}.snowmobile-home-layout .forumline th a.cattitle{color: #263442 !important;font-size: inherit;font-weight: inherit;text-decoration: none}.snowmobile-home-layout .snowmobile-recent-posts{order: 1}.snowmobile-home-layout .snowmobile-online{order: 3}.snowmobile-home-layout .snowmobile-welcome, .snowmobile-home-layout .snowmobile-market-posts{order: 2}.snowmobile-home-layout .snowmobile-recent-posts tr:nth-child(n + 17), .snowmobile-home-layout .snowmobile-market-posts tr:nth-child(n + 12){display: none !important}.snowmobile-home-layout .snowmobile-online .gensmall{color: #44445A;display: inline-block;font-size: 13px;line-height: 1.5;overflow-wrap: anywhere}.snowmobile-home-layout .snowmobile-online .gensmall a{font-size: 12px}.snowmobile-home-layout .snowmobile-recent-posts td.row1, .snowmobile-home-layout .snowmobile-recent-posts td.row2, .snowmobile-home-layout .snowmobile-market-posts td.row1, .snowmobile-home-layout .snowmobile-market-posts td.row2{border-bottom: 1px solid #e3e8ed !important;padding: 13px 12px !important}.snowmobile-home-layout .snowmobile-recent-posts td.row1 > div, .snowmobile-home-layout .snowmobile-recent-posts td.row2 > div{display: flex !important;flex-direction: column;gap: 4px;margin: 0 !important;width: 100% !important}.snowmobile-home-layout .snowmobile-recent-posts td.row1 > div > div:first-child, .snowmobile-home-layout .snowmobile-recent-posts td.row2 > div > div:first-child{display: flex !important;flex-direction: column;float: none !important;width: 100%}.snowmobile-home-layout .snowmobile-recent-posts td.row1 > div > div:first-child b, .snowmobile-home-layout .snowmobile-recent-posts td.row2 > div > div:first-child b{display: block;line-height: 1.35}.snowmobile-home-layout .snowmobile-recent-posts td.row1 > div > div:first-child b a, .snowmobile-home-layout .snowmobile-recent-posts td.row2 > div > div:first-child b a, .snowmobile-home-layout .snowmobile-market-posts td.row1 > div > div:first-child b a, .snowmobile-home-layout .snowmobile-market-posts td.row2 > div > div:first-child b a{color: #006699 !important;font-size: 15px;font-weight: 650}.snowmobile-home-layout .snowmobile-recent-posts td.row1 > div > div:first-child > span, .snowmobile-home-layout .snowmobile-recent-posts td.row2 > div > div:first-child > span{display: none}.snowmobile-home-layout .snowmobile-recent-meta{align-items: center;box-sizing: border-box;color: #505d69;display: flex;flex-wrap: wrap;font-size: 12px;gap: 2px 7px;line-height: 1.4;width: 100%}.snowmobile-home-layout .snowmobile-recent-meta.has-latest{min-height: 44px;padding-right: 52px;position: relative}.snowmobile-home-layout .snowmobile-recent-meta a{color: #505d69;font-size: 12px}.snowmobile-home-layout .snowmobile-recent-meta time{color: #505d69;white-space: nowrap}.snowmobile-home-layout .snowmobile-recent-meta.has-forum time::before{color: #8a929b;content: \"·\";margin-right: 6px}.snowmobile-home-layout .snowmobile-recent-meta .snowmobile-recent-last-read{align-items: center;box-sizing: border-box;color: #176d99;display: inline-flex;font-size: 12px;font-weight: 600;line-height: 1;min-height: 44px;padding: 0 10px;position: relative;text-decoration: none;white-space: nowrap}.snowmobile-home-layout .snowmobile-recent-meta .snowmobile-recent-last-read::before{background: #f1f5f7;border: 1px solid #dce5e9;border-radius: 999px;content: \"\";inset: 9px 0;position: absolute;z-index: 0}.snowmobile-home-layout .snowmobile-recent-meta .snowmobile-recent-last-read.has-unread::before{background: #eef5f9;border-color: #c7dce7}.snowmobile-home-layout .snowmobile-recent-meta .snowmobile-recent-last-read > span{align-items: center;display: inline-flex;gap: 5px;position: relative;z-index: 1}.snowmobile-home-layout .snowmobile-recent-meta .snowmobile-recent-last-read.has-unread > span::before{background: #176d99;border-radius: 50%;content: \"\";flex: 0 0 6px;height: 6px;width: 6px}.snowmobile-home-layout .snowmobile-recent-meta .snowmobile-recent-last-read:active::before{background: #e1edf4}.snowmobile-home-layout .snowmobile-recent-meta .snowmobile-latest-post{align-items: center;background: #f1f5f7;border: 1px solid #e0e8ec;border-radius: 50%;box-sizing: border-box;display: flex;height: 44px;justify-content: center;position: absolute;right: 0;text-decoration: none;top: 50%;transform: translateY(-50%);width: 44px}.snowmobile-home-layout .snowmobile-recent-meta .snowmobile-latest-post:active{background: #e5eef4}.snowmobile-home-layout .snowmobile-recent-meta .snowmobile-latest-post img{display: none}.snowmobile-home-layout .snowmobile-recent-meta .snowmobile-latest-post::before{color: #176d99;content: \"↘\";font-size: 20px;line-height: 1}.snowmobile-home-layout .snowmobile-recent-posts td br, .snowmobile-home-layout .snowmobile-market-posts td br{display: none !important}.snowmobile-home-layout .snowmobile-recent-posts tr:last-child > td, .snowmobile-home-layout .snowmobile-market-posts tr:last-child > td{border-bottom: 0 !important}.snowmobile-home-layout .snowmobile-market-posts td.row1 > div, .snowmobile-home-layout .snowmobile-market-posts td.row2 > div{display: flex !important;flex-direction: column;gap: 4px;width: 100% !important}.snowmobile-home-layout .snowmobile-market-posts td.row1 > div > div:first-child, .snowmobile-home-layout .snowmobile-market-posts td.row2 > div > div:first-child{float: none !important;line-height: 1.3;margin: 0 !important;width: 100%}.snowmobile-home-layout .snowmobile-market-posts td.row1 > div > div:first-child b a, .snowmobile-home-layout .snowmobile-market-posts td.row2 > div > div:first-child b a{color: #006699 !important;font-size: 15px;font-weight: 650}.snowmobile-home-layout .snowmobile-market-posts td.row1 > div > div:nth-child(2), .snowmobile-home-layout .snowmobile-market-posts td.row2 > div > div:nth-child(2){color: #59636f;float: none !important;font-size: 12px;margin: 0 !important;text-align: left !important}.snowmobile-home-layout .snowmobile-market-posts .gensmall{color: #59636f !important;font-size: 12px}.snowmobile-home-layout .snowmobile-aside-column > table{max-width: 100% !important;width: 100% !important}.snowmobile-home-layout .snowmobile-aside-column img{display: block;height: auto !important;margin-left: auto;margin-right: auto;max-width: min(100%, 220px) !important}.snowmobile-home-layout .snowmobile-aside-column td{box-sizing: border-box;max-width: 100%;overflow-wrap: anywhere}html[data-snowmobile-theme=\"dark\"] body, html[data-snowmobile-theme=\"dark\"] .snowmobile-home-root{background: var(--sm-page) !important;color: var(--sm-text) !important}html[data-snowmobile-theme=\"dark\"] .snowmobile-home-root .forumline, html[data-snowmobile-theme=\"dark\"] .snowmobile-home-layout .forumline td, html[data-snowmobile-theme=\"dark\"] .snowmobile-home-layout .forumline .row1, html[data-snowmobile-theme=\"dark\"] .snowmobile-home-layout .forumline .row2, html[data-snowmobile-theme=\"dark\"] .snowmobile-home-layout .snowmobile-recent-posts td.row1, html[data-snowmobile-theme=\"dark\"] .snowmobile-home-layout .snowmobile-market-posts td.row1{background-color: var(--sm-surface) !important;color: var(--sm-text) !important}html[data-snowmobile-theme=\"dark\"] .snowmobile-home-layout .snowmobile-recent-posts td.row2, html[data-snowmobile-theme=\"dark\"] .snowmobile-home-layout .snowmobile-market-posts td.row2{background-color: var(--sm-surface-alt) !important;color: var(--sm-text) !important}html[data-snowmobile-theme=\"dark\"] .snowmobile-home-layout .forumline > tbody > tr > th{background: var(--sm-surface-soft) !important;border-color: var(--sm-border) !important;color: var(--sm-text) !important}html[data-snowmobile-theme=\"dark\"] .snowmobile-home-layout .thHead .cattitle, html[data-snowmobile-theme=\"dark\"] .snowmobile-home-layout .forumline th a.cattitle, html[data-snowmobile-theme=\"dark\"] .snowmobile-home-layout .snowmobile-recent-posts td a, html[data-snowmobile-theme=\"dark\"] .snowmobile-home-layout .snowmobile-market-posts td a{color: var(--sm-link) !important}html[data-snowmobile-theme=\"dark\"] .snowmobile-home-layout .snowmobile-recent-posts td.row1 > div > div:first-child b a, html[data-snowmobile-theme=\"dark\"] .snowmobile-home-layout .snowmobile-recent-posts td.row2 > div > div:first-child b a, html[data-snowmobile-theme=\"dark\"] .snowmobile-home-layout .snowmobile-market-posts td.row1 > div > div:first-child b a, html[data-snowmobile-theme=\"dark\"] .snowmobile-home-layout .snowmobile-market-posts td.row2 > div > div:first-child b a{color: var(--sm-link) !important}html[data-snowmobile-theme=\"dark\"] .snowmobile-home-layout .snowmobile-recent-posts td, html[data-snowmobile-theme=\"dark\"] .snowmobile-home-layout .snowmobile-market-posts td{border-color: var(--sm-border) !important}html[data-snowmobile-theme=\"dark\"] .snowmobile-home-layout .snowmobile-recent-meta, html[data-snowmobile-theme=\"dark\"] .snowmobile-home-layout .snowmobile-recent-meta a, html[data-snowmobile-theme=\"dark\"] .snowmobile-home-layout .snowmobile-recent-meta time, html[data-snowmobile-theme=\"dark\"] .snowmobile-home-layout .snowmobile-market-posts .gensmall, html[data-snowmobile-theme=\"dark\"] .snowmobile-home-layout .snowmobile-online .gensmall{color: var(--sm-muted) !important}html[data-snowmobile-theme=\"dark\"] .snowmobile-home-layout .snowmobile-recent-meta .snowmobile-recent-last-read, html[data-snowmobile-theme=\"dark\"] .snowmobile-home-layout .snowmobile-recent-meta .snowmobile-latest-post{background: var(--sm-control);border-color: var(--sm-border);color: var(--sm-link) !important}html[data-snowmobile-theme=\"dark\"] .snowmobile-home-layout .snowmobile-recent-meta .snowmobile-recent-last-read::before, html[data-snowmobile-theme=\"dark\"] .snowmobile-home-layout .snowmobile-recent-meta .snowmobile-recent-last-read.has-unread::before{background: var(--sm-control);border-color: var(--sm-border)}html[data-snowmobile-theme=\"dark\"] .snowmobile-home-layout .snowmobile-recent-meta .snowmobile-recent-last-read.has-unread > span::before{color: var(--sm-link);background-color: var(--sm-link)}","forumlist":"body > div:nth-last-of-type(3) table table tr:first-child{display: none}body > div:nth-last-of-type(3) table table tr td:nth-child(n+3){display: none}body > div:nth-last-of-type(3) table table tr td{border-radius: 0 !important}.ycattitle{display: flex;justify-content: center}table .forum_block{border: 0;box-sizing: border-box;display: flex;flex-direction: column;gap: 4px;padding: 10px 12px}table .forum_block:hover{background-color: inherit;color: inherit;border: 0;padding: 10px 12px}table .forum_block h1{align-items: center;display: flex !important;line-height: 1.3;margin: 0 !important;min-width: 0;padding: 0 !important}table .forum_block h1 img{height: 16px !important;margin-right: 8px;position: static !important;width: 16px}table .forum_block h1 a{min-width: 0}table .forum_block .forumlink{font-size: 18px !important;font-weight: 600}table .forum_block h2{display: block !important;line-height: 1.35;margin: 0 !important;min-width: 0}table .forum_block .fdesc{color: #66667A !important;display: -webkit-box;font-size: 14px;line-height: 1.35;overflow: hidden;-webkit-box-orient: vertical;-webkit-line-clamp: 2}table .forum_block h2 marquee{display: none}@media (max-width: 700px){body{background: #f2f4f7 !important;color: #263442;font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif !important}body > div:nth-last-of-type(3) table table{background: transparent !important;border-collapse: separate;border-spacing: 0;box-sizing: border-box;max-width: 100%;width: 100% !important}body > div:nth-last-of-type(3) table table tr:has(> td[background*=\"MountainRange.jpg\"]) > td{background-color: #176d99 !important;background-image: linear-gradient(110deg, rgba(18, 66, 96, .92), rgba(23, 109, 153, .76)), url(\"/ski-forum/templates/subSilver/images/MountainRange.jpg\") !important;background-position: center, center 48%;background-size: cover;border: 0 !important;border-radius: 0 !important;box-sizing: border-box;height: auto !important;padding: 7px 12px !important}.ycattitle{color: #fff;display: block;font-size: 12px;font-weight: 700;justify-content: flex-start;letter-spacing: .055em;line-height: 1.3;text-align: left;text-shadow: 0 1px 2px rgba(0, 0, 0, .35);text-transform: uppercase}body > div:nth-last-of-type(3) table table tr:has(> td > .forum_block){background: #fff;border-bottom: 1px solid #e3e8ed;box-sizing: border-box;display: grid;grid-template-columns: 104px minmax(0, 1fr);margin: 0;width: 100%}body > div:nth-last-of-type(3) table table tr:has(> td > .forum_block):nth-of-type(even){background: #eef3f7}body > div:nth-last-of-type(3) table table tr:has(> td > .forum_block):nth-of-type(even) > td, body > div:nth-last-of-type(3) table table tr:has(> td > .forum_block):nth-of-type(even) > td:nth-child(2) .forum_block, body > div:nth-last-of-type(3) table table tr:has(> td > .forum_block):nth-of-type(even) > td:nth-child(2) .forum_block:hover{background: #eef3f7 !important}body > div:nth-last-of-type(3) table table tr:has(> td > .forum_block) > td{background: #fff !important;border: 0 !important;box-sizing: border-box;display: block;height: auto !important;min-width: 0;width: auto !important}body > div:nth-last-of-type(3) table table tr:has(> td > .forum_block) > td:first-child{display: none !important}body > div:nth-last-of-type(3) table table tr:has(> td > .forum_block) > td:nth-child(2){grid-column: 1 / -1;padding: 0 !important}table .forum_block, table .forum_block:hover{background: #fff !important;border: 0 !important;border-radius: 0;min-height: 0;padding: 8px 12px 6px}table .forum_block h1{min-height: 44px}table .forum_block h1 a{align-items: center;display: flex;min-height: 44px}table .forum_block .forumlink{color: #006699 !important;font-size: 17px !important;font-weight: 650;line-height: 1.3}table .forum_block h1 img{height: 15px !important;opacity: .72;width: 15px}table .forum_block .fdesc{color: #59636f !important;line-height: 1.4;-webkit-line-clamp: 3}body > div:nth-last-of-type(3) table table tr:has(> td > .forum_block) > td:nth-child(3), body > div:nth-last-of-type(3) table table tr:has(> td > .forum_block) > td:nth-child(4){align-items: center;background: #f7f9fb !important;border-top: 1px solid #edf0f3 !important;color: #647181;display: flex !important;font-size: 10px;line-height: 1.3;min-height: 42px;padding: 4px 10px !important}body > div:nth-last-of-type(3) table table tr:has(> td > .forum_block) > td:nth-child(3){border-radius: 0 0 0 10px;align-content: center;column-gap: 4px;display: grid !important;grid-template-columns: 42px minmax(0, 1fr);grid-template-rows: repeat(2, 12px);justify-content: start}body > div:nth-last-of-type(3) table table tr:has(> td > .forum_block) > td:nth-child(3)::before{color: #8995a2;content: \"Topics\";font-size: 9px;letter-spacing: .015em;grid-column: 1;grid-row: 1}body > div:nth-last-of-type(3) table table tr:has(> td > .forum_block) > td:nth-child(3)::after{color: #8995a2;content: \"Posts\";font-size: 9px;grid-column: 1;grid-row: 2}body > div:nth-last-of-type(3) table table tr:has(> td > .forum_block) > td:nth-child(3) .gensmall{color: #59636f;grid-column: 2;grid-row: 1 / span 2;font-size: 10px;line-height: 12px;white-space: nowrap}body > div:nth-last-of-type(3) table table tr:has(> td > .forum_block) > td:nth-child(3) br{display: inline;line-height: normal}body > div:nth-last-of-type(3) table table tr:has(> td > .forum_block) > td:nth-child(4){border-radius: 0 0 10px 0;justify-content: flex-end;min-width: 0;overflow: hidden;text-align: right;white-space: nowrap}body > div:nth-last-of-type(3) table table tr:has(> td > .forum_block) > td:nth-child(4)::before{color: #8995a2;content: \"Last post\";flex: 0 0 auto;font-size: 9px;margin-right: 6px}body > div:nth-last-of-type(3) table table tr:has(> td > .forum_block) > td:nth-child(4) .gensmall{align-items: center;color: #59636f;display: flex;flex: 1 1 auto;font-size: 10px;gap: 4px;min-width: 0;white-space: nowrap}body > div:nth-last-of-type(3) table table tr:has(> td > .forum_block) > td:nth-child(4) .gensmall > br{display: none}body > div:nth-last-of-type(3) table table tr:has(> td > .forum_block) > td:nth-child(4) .gensmall > a:has(> img[alt=\"View latest post\"]){align-items: center;background: #eaf3f8;border-radius: 10px;display: inline-flex;flex: 0 0 44px;height: 44px;justify-content: center;margin-left: auto;order: 2;width: 44px}body > div:nth-last-of-type(3) table table tr:has(> td > .forum_block) > td:nth-child(4) .gensmall > a[href*=\"profile.php\"]{color: #006699 !important;flex: 0 1 auto;max-width: 76px;min-width: 0;order: 1;overflow: hidden;text-overflow: ellipsis;white-space: nowrap}body > div:nth-last-of-type(3) table table tr:has(> td > .forum_block) > td:nth-child(4) img{height: 13px;margin: 0;width: 13px}table .forum_block:has(h1 img[src*=\"folder_new\"], h1 img[title^=\"New posts\" i]){background: #f0f8fc !important}table .forum_block:has(h1 img[src*=\"folder_new\"], h1 img[title^=\"New posts\" i]) h1 img{background: #dceef7;border-radius: 50%;box-shadow: 0 0 0 3px #e9f4f9;opacity: 1}table .forum_block:has(h1 img[src*=\"folder_new\"], h1 img[title^=\"New posts\" i]) h1::after{background: #e0f0f7;border-radius: 999px;color: #176d99;content: \"NEW\";font-size: 9px;font-weight: 700;letter-spacing: .04em;line-height: 1;margin-left: auto;padding: 5px 7px}#pagebody > table > tbody > tr > td:last-child > span.gensmall{background: #fff;border-radius: 12px 12px 0 0;box-sizing: border-box;color: #59636f;display: block;font-size: 12px;line-height: 1.45;margin-top: 12px;padding: 12px 14px 8px}#pagebody > table > tbody > tr > td:last-child > span.gensmall::before{color: #263442;content: \"Who's online\";display: block;font-size: 15px;font-weight: 650;line-height: 1.3;margin-bottom: 4px}#pagebody > table > tbody > tr > td:last-child > span.gensmall:not(:has(+ form[action=\"login.php\"])){border-radius: 12px;margin-bottom: 12px;padding-bottom: 12px}#pagebody > table > tbody > tr > td:last-child > span.gensmall a{align-items: center;color: #006699 !important;display: inline-flex;min-height: 28px;overflow-wrap: anywhere;padding-right: 4px}#pagebody > table > tbody > tr > td:last-child > form[action=\"login.php\"] > table.forumline{background: #fff;border: 0 !important;border-radius: 0 0 12px 12px;box-shadow: none;margin: 0 0 12px !important;overflow: hidden;width: 100% !important}#pagebody > table > tbody > tr > td:last-child > form[action=\"login.php\"] > table.forumline > tbody > tr > td.catHead{background: #fff !important;border: 0 !important;border-bottom: 1px solid #e3e8ed !important;color: #263442 !important;font-size: 16px;padding: 10px 14px !important;text-align: left}#pagebody > table > tbody > tr > td:last-child > form[action=\"login.php\"] > table.forumline > tbody > tr > td.row1{background: #fff !important;box-sizing: border-box;display: block;height: auto !important;padding: 12px 14px !important;text-align: left !important}#pagebody > table > tbody > tr > td:last-child > form[action=\"login.php\"] .gensmall{align-items: stretch;color: #59636f;display: flex;flex-direction: column;font-size: 13px;gap: 4px;line-height: 1.35;text-align: left}#pagebody > table > tbody > tr > td:last-child > form[action=\"login.php\"] input[type=\"text\"], #pagebody > table > tbody > tr > td:last-child > form[action=\"login.php\"] input[type=\"password\"]{appearance: none;background: #fff;border: 1px solid #cbd5df;border-radius: 8px;box-sizing: border-box;display: block;font: inherit;height: 44px;max-width: 100%;padding: 0 11px;width: 100%}#pagebody > table > tbody > tr > td:last-child > form[action=\"login.php\"] span[onclick*=\"showPass\"]{align-items: center;background: #f2f4f7;border-radius: 8px;display: flex;font-size: 20px;justify-content: center;min-height: 40px}#pagebody > table > tbody > tr > td:last-child > form[action=\"login.php\"] input[type=\"checkbox\"]{align-self: flex-start;height: 20px;margin: 2px 0 4px;width: 20px}#pagebody > table > tbody > tr > td:last-child > form[action=\"login.php\"] input[type=\"submit\"]{background: #176d99;border: 0;border-radius: 8px;box-sizing: border-box;color: #fff;font-size: 15px;font-weight: 650;height: 44px;margin: 2px 0 0 !important;width: 100%}#pagebody table.forumline{background: #fff !important;border: 0 !important;border-collapse: separate;border-radius: 12px;border-spacing: 0;box-sizing: border-box;margin: 12px 0 !important;overflow: hidden;width: 100% !important}#pagebody table.forumline > tbody > tr:first-child{display: table-row !important}#pagebody table.forumline > tbody > tr:first-child > td.catHead{background: #fff !important;border: 0 !important;border-bottom: 1px solid #e3e8ed !important;box-sizing: border-box;color: #263442 !important;height: auto !important;padding: 11px 14px !important;text-align: left !important}#pagebody > table > tbody > tr > td:last-child > form[action=\"login.php\"] > table.forumline > tbody > tr > td.catHead .cattitle, #pagebody table.forumline > tbody > tr:first-child > td.catHead .cattitle, #pagebody table.forumline > tbody > tr:first-child > td.catHead .cattitle a{color: #263442 !important;font-size: 16px;font-weight: 650}#pagebody table.forumline > tbody > tr:first-child > td.catHead .cattitle, #pagebody table.forumline > tbody > tr:first-child > td.catHead .cattitle a{text-decoration: none}#pagebody table.forumline > tbody > tr:nth-child(2) > td:first-child{display: none !important}#pagebody table.forumline > tbody > tr:nth-child(2) > td.row1, #pagebody table.forumline > tbody > tr:nth-child(3) > td.row1{background: #fff !important;border: 0 !important;box-sizing: border-box;display: block;height: auto !important;padding: 10px 14px !important;text-align: left !important;width: 100% !important}#pagebody table.forumline > tbody > tr:nth-child(3) > td.row1{border-top: 1px solid #edf0f3 !important;padding-bottom: 14px !important}#pagebody table.forumline .gensmall{color: #59636f;display: block;font-size: 12px;line-height: 1.5;overflow-wrap: anywhere}#pagebody table.forumline .gensmall a{color: #006699 !important;font-size: inherit;overflow-wrap: anywhere}body > div:has(> span.copyright){background: #fff;border-radius: 12px;box-sizing: border-box;margin: 12px 10px 20px;padding: 12px 14px}body > div:has(> span.copyright) > span.copyright{align-items: center;color: #59636f;display: flex;flex-wrap: wrap;flex-direction: row;font-size: 12px;gap: 4px;justify-content: center;line-height: 1.4}body > div:has(> span.copyright) > span.copyright > br{display: none}body > div:has(> span.copyright) > span.copyright > a{align-items: center;display: inline-flex;justify-content: center;min-height: 44px;padding: 0 8px}body > div:has(> span.copyright) > span.copyright > a:first-of-type img{display: block;height: auto;max-width: 120px}body > div:has(> span.copyright) > span.copyright > a:first-of-type{flex: 0 0 100%}}@media (max-width: 700px){html[data-snowmobile-theme=\"dark\"] body{background: var(--sm-page) !important;color: var(--sm-text) !important}html[data-snowmobile-theme=\"dark\"] body > div:nth-last-of-type(3) table table tr:has(> td > .forum_block), html[data-snowmobile-theme=\"dark\"] body > div:nth-last-of-type(3) table table tr:has(> td > .forum_block) > td, html[data-snowmobile-theme=\"dark\"] table .forum_block, html[data-snowmobile-theme=\"dark\"] table .forum_block:hover{background: var(--sm-surface) !important;border-color: var(--sm-border) !important;color: var(--sm-text) !important}html[data-snowmobile-theme=\"dark\"] body > div:nth-last-of-type(3) table table tr:has(> td > .forum_block):nth-of-type(even), html[data-snowmobile-theme=\"dark\"] body > div:nth-last-of-type(3) table table tr:has(> td > .forum_block):nth-of-type(even) > td, html[data-snowmobile-theme=\"dark\"] body > div:nth-last-of-type(3) table table tr:has(> td > .forum_block):nth-of-type(even) > td:nth-child(2) .forum_block, html[data-snowmobile-theme=\"dark\"] body > div:nth-last-of-type(3) table table tr:has(> td > .forum_block):nth-of-type(even) > td:nth-child(2) .forum_block:hover{background: var(--sm-surface-alt) !important}html[data-snowmobile-theme=\"dark\"] table .forum_block .forumlink, html[data-snowmobile-theme=\"dark\"] table .forum_block h1 a, html[data-snowmobile-theme=\"dark\"] body > div:nth-last-of-type(3) table table tr:has(> td > .forum_block) > td:nth-child(4) .gensmall > a[href*=\"profile.php\"]{color: var(--sm-link) !important}html[data-snowmobile-theme=\"dark\"] body > div:nth-last-of-type(3) table table tr:has(> td > .forum_block) > td:nth-child(4) .gensmall > a:has(> img[alt=\"View latest post\"]) img{display: none}html[data-snowmobile-theme=\"dark\"] body > div:nth-last-of-type(3) table table tr:has(> td > .forum_block) > td:nth-child(4) .gensmall > a:has(> img[alt=\"View latest post\"]){background: var(--sm-control);border: 1px solid var(--sm-border);position: relative}html[data-snowmobile-theme=\"dark\"] body > div:nth-last-of-type(3) table table tr:has(> td > .forum_block) > td:nth-child(4) .gensmall > a:has(> img[alt=\"View latest post\"])::before{color: var(--sm-link);content: \"↘\";font-size: 20px;line-height: 1;position: static}html[data-snowmobile-theme=\"dark\"] table .forum_block .fdesc, html[data-snowmobile-theme=\"dark\"] body > div:nth-last-of-type(3) table table tr:has(> td > .forum_block) > td:nth-child(3), html[data-snowmobile-theme=\"dark\"] body > div:nth-last-of-type(3) table table tr:has(> td > .forum_block) > td:nth-child(4), html[data-snowmobile-theme=\"dark\"] body > div:nth-last-of-type(3) table table tr:has(> td > .forum_block) .gensmall{color: var(--sm-muted) !important}html[data-snowmobile-theme=\"dark\"] body > div:nth-last-of-type(3) table table tr:has(> td > .forum_block) > td:nth-child(3), html[data-snowmobile-theme=\"dark\"] body > div:nth-last-of-type(3) table table tr:has(> td > .forum_block) > td:nth-child(4){background: var(--sm-surface-soft) !important;border-color: var(--sm-border) !important}html[data-snowmobile-theme=\"dark\"] table .forum_block:has(h1 img[src*=\"folder_new\"], h1 img[title^=\"New posts\" i]){background: #1c2d38 !important}html[data-snowmobile-theme=\"dark\"] table .forum_block:has(h1 img[src*=\"folder_new\"], h1 img[title^=\"New posts\" i]) h1 img{background: #29495b;box-shadow: 0 0 0 3px #203b4b}html[data-snowmobile-theme=\"dark\"] table .forum_block:has(h1 img[src*=\"folder_new\"], h1 img[title^=\"New posts\" i]) h1::after{background: #29495b;color: #9bdafa}html[data-snowmobile-theme=\"dark\"] #pagebody > table > tbody > tr > td:last-child > span.gensmall, html[data-snowmobile-theme=\"dark\"] #pagebody > table > tbody > tr > td:last-child > form[action=\"login.php\"] > table.forumline, html[data-snowmobile-theme=\"dark\"] #pagebody table.forumline, html[data-snowmobile-theme=\"dark\"] body > div:has(> span.copyright){background: var(--sm-surface) !important;color: var(--sm-text) !important}html[data-snowmobile-theme=\"dark\"] #pagebody > table > tbody > tr > td:last-child > form[action=\"login.php\"] > table.forumline > tbody > tr > td.catHead, html[data-snowmobile-theme=\"dark\"] #pagebody table.forumline > tbody > tr:first-child > td.catHead, html[data-snowmobile-theme=\"dark\"] #pagebody table.forumline > tbody > tr:nth-child(2) > td.row1, html[data-snowmobile-theme=\"dark\"] #pagebody table.forumline > tbody > tr:nth-child(3) > td.row1{background: var(--sm-surface) !important;border-color: var(--sm-border) !important;color: var(--sm-text) !important}html[data-snowmobile-theme=\"dark\"] #pagebody table.forumline > tbody > tr:first-child > td.catHead .cattitle, html[data-snowmobile-theme=\"dark\"] #pagebody table.forumline > tbody > tr:first-child > td.catHead .cattitle a, html[data-snowmobile-theme=\"dark\"] #pagebody table.forumline .gensmall a{color: var(--sm-link) !important}}","viewforum":"body{background: #f2f4f7 !important;color: #263442}body > div:nth-last-of-type(3) .forumline{border: 0 !important;box-shadow: none !important;display: flex;flex-direction: column;outline: none !important;padding: 0 5px}body > div:nth-last-of-type(3) .forumline tr{display: flex;flex-wrap: wrap;padding-top: 5px}body > div:nth-last-of-type(3) .forumline .gensmall{display: none}body > div:nth-last-of-type(3) .forumline tr:first-child th:nth-child(n + 2){display: none}body > div:nth-last-of-type(3) .forumline th.thCornerL{border-width: 0}body > div:nth-last-of-type(3) .nav{display: flex;flex-direction: column}body > div:nth-last-of-type(3) .forumline tr:nth-child(n + 2) td:first-child{display: none}body > div:nth-last-of-type(3) table:nth-child(3) tr:nth-child(2) td:first-child{display: none}body > div:nth-last-of-type(3) .forumline tr.snowmobile-topic-row{background: #fff;border: 1px solid #E0E7EC;border-left: 3px solid #C7DCE7;border-radius: 12px;box-sizing: border-box;display: block !important;margin: 0 0 5px;overflow: hidden;padding: 0}body > div:nth-last-of-type(3) .forumline tr.snowmobile-topic-alert{border-left-color: #D39A29}body > div:nth-last-of-type(3) .forumline tr.snowmobile-topic-sticky{border-left-color: #7286B6}body > div:nth-last-of-type(3) .forumline tr.snowmobile-topic-row > td{background: #fff !important;box-sizing: border-box;display: block !important;width: 100% !important}body > div:nth-last-of-type(3) .forumline tr.snowmobile-topic-row.snowmobile-topic-alt{background: #eef3f7}body > div:nth-last-of-type(3) .forumline tr.snowmobile-topic-row.snowmobile-topic-alt > td{background: #eef3f7 !important}body > div:nth-last-of-type(3) .forumline tr.snowmobile-topic-row > td:first-child, body > div:nth-last-of-type(3) .forumline tr.snowmobile-topic-row > td:nth-child(n + 3){display: none !important}body > div:nth-last-of-type(3) .forumline tr.snowmobile-topic-row > td:nth-child(2){padding: 8px 10px 7px 12px}body > div:nth-last-of-type(3) .forumline .snowmobile-topic-row .topictitle{align-items: center;display: flex;font-size: 15px;font-weight: 650;gap: 7px;line-height: 1.35;min-width: 0}body > div:nth-last-of-type(3) .forumline .snowmobile-topic-row .topictitle > a{align-items: center;color: #075A83;display: flex;flex: 1 1 auto;min-width: 0;min-height: 44px;text-decoration: none}body > div:nth-last-of-type(3) .forumline .snowmobile-topic-row .topictitle > a:active{color: #043E5C}body > div:nth-last-of-type(3) .forumline .snowmobile-topic-row .topic_type_alert, body > div:nth-last-of-type(3) .forumline .snowmobile-topic-row .topic_type_sticky{align-items: center;border-radius: 999px;box-sizing: border-box;display: inline-flex;flex: 0 0 auto;font-size: 0;font-weight: 600;justify-content: center;line-height: 1;margin: 0 !important;min-height: 24px;padding: 0 8px;width: auto}body > div:nth-last-of-type(3) .forumline .snowmobile-topic-row .topic_type_alert{background: #FFF3D9;color: #78550D}body > div:nth-last-of-type(3) .forumline .snowmobile-topic-row .topic_type_alert::after{content: \"Alert\";font-size: 11px}body > div:nth-last-of-type(3) .forumline .snowmobile-topic-row .topic_type_sticky{background: #EEF1FA;color: #4F608F}body > div:nth-last-of-type(3) .forumline .snowmobile-topic-row .topic_type_sticky::after{content: \"Pinned\";font-size: 11px}body > div:nth-last-of-type(3) .forumline .snowmobile-topic-row .snowmobile-topic-meta{align-items: center;color: #626D76;display: flex;flex-wrap: wrap;font-size: 12px;gap: 0;line-height: 1.35;margin-top: 0;min-height: 44px;padding-right: 46px;position: relative}body > div:nth-last-of-type(3) .forumline .snowmobile-topic-row .snowmobile-topic-author{color: #505D66;font-weight: 600}body > div:nth-last-of-type(3) .forumline .snowmobile-topic-row .snowmobile-topic-meta > :not(:first-child):not(.snowmobile-latest-post)::before{color: #98A3AA;content: \"·\";margin: 0 7px}body > div:nth-last-of-type(3) .forumline .snowmobile-topic-row .snowmobile-latest-post{align-items: center;background: #F1F5F7;border: 1px solid #E0E8EC;border-radius: 50%;box-sizing: border-box;display: flex;height: 44px;justify-content: center;position: absolute;right: -5px;top: 50%;transform: translateY(-50%);width: 44px}body > div:nth-last-of-type(3) .forumline .snowmobile-topic-row .snowmobile-latest-post img{display: none}body > div:nth-last-of-type(3) .forumline .snowmobile-topic-row .snowmobile-latest-post::before{color: #176D99;content: \"↘\";font-size: 20px;line-height: 1}body > div:nth-last-of-type(3) .forumline .snowmobile-topic-row .page_links{background: transparent !important;color: #66747D;display: flex;float: none !important;flex-wrap: wrap;font-size: 11px;line-height: 1.4;margin: 0 0 2px;width: 100%}body > div:nth-last-of-type(3) .forumline .snowmobile-topic-row .page_links a{align-items: center;background: #F2F6F8;border: 1px solid #E4EAED;border-radius: 6px;box-sizing: border-box;color: #536A78;display: inline-flex;font-size: 13px !important;justify-content: center;margin-right: 3px;min-height: 44px;min-width: 32px;text-decoration: none}body > div:nth-last-of-type(3) td.nav > span.gensmall, body > div:nth-last-of-type(3) span.nav[style*=\"white-space:nowrap\"]{align-items: center;display: flex !important;flex-wrap: wrap;gap: 2px;justify-content: flex-end;white-space: normal !important}body > div:nth-last-of-type(3) td.nav > span.gensmall > b{align-items: center;display: flex;flex-wrap: wrap;gap: 2px}body > div:nth-last-of-type(3) .nav a[href*=\"start=\"]{align-items: center;background: #F2F6F8;border: 1px solid #E4EAED;border-radius: 6px;display: inline-flex;font-size: 13px;justify-content: center;min-height: 44px;min-width: 32px;padding: 0 3px}body > div:nth-last-of-type(3) .forumline > tbody > tr:first-child{background: transparent !important;box-sizing: border-box;display: block !important;height: 60px !important;min-height: 60px;padding: 4px 0 8px !important}body > div:nth-last-of-type(3) .forumline > tbody > tr:first-child > th.thCornerL{background: transparent !important;background-image: none !important;box-sizing: border-box;display: block !important;height: 44px !important;min-height: 44px;overflow: visible;padding: 0 !important;width: 100% !important}body > div:nth-last-of-type(3) .forumline > tbody > tr:first-child .head_container{height: 44px;min-height: 44px;position: static !important;width: 100%}body > div:nth-last-of-type(3) .forumline > tbody > tr:first-child .head_content{align-items: center;display: flex;height: 44px;justify-content: flex-end;min-height: 44px;position: static !important;width: 100%}body > div:nth-last-of-type(3) .forumline tr:first-child .menubutton{align-items: center;background: #176D99 !important;background-image: none !important;border-radius: 9px;box-sizing: border-box;color: #fff !important;display: inline-flex;font-size: 14px !important;font-style: normal !important;font-weight: 650 !important;justify-content: center;line-height: 1.2;margin-left: auto;max-width: 100%;min-height: 44px;min-width: 160px;padding: 0 16px !important;text-decoration: none;text-shadow: none !important;white-space: nowrap !important}body > div:nth-last-of-type(3) .forumline > tbody > tr:first-child .head_pic{display: none !important}body > div:nth-last-of-type(3) .forumline > tbody > tr:first-child .head_content > a{align-items: center;display: inline-flex;flex: 0 0 auto;min-height: 44px;max-width: 100%;text-decoration: none;width: max-content}body > div:nth-last-of-type(3) .forumline .snowmobile-topic-heading{align-items: stretch !important;display: flex !important;flex-direction: column;gap: 0;width: 100%}body > div:nth-last-of-type(3) .forumline .snowmobile-topic-heading > .topic_type_alert, body > div:nth-last-of-type(3) .forumline .snowmobile-topic-heading > .topic_type_sticky{align-self: flex-start;margin: 0 0 2px !important;min-height: 20px;padding: 0 7px}body > div:nth-last-of-type(3) .forumline .snowmobile-topic-heading > a.topictitle{align-items: center;flex: 0 0 auto;line-height: 1.25;min-height: 44px;width: 100%}body > div:nth-last-of-type(3) .forumline .snowmobile-topic-row .snowmobile-topic-page-strip{align-items: center;background: transparent !important;border: 0 !important;display: flex;flex-wrap: nowrap;gap: 0;margin: 0;min-height: 44px;opacity: 1 !important;overflow-x: auto;padding: 0 !important;scrollbar-width: none;width: 100%}body > div:nth-last-of-type(3) .forumline .snowmobile-topic-page-strip::-webkit-scrollbar{display: none}body > div:nth-last-of-type(3) .forumline .snowmobile-topic-page-strip:empty{display: none !important}body > div:nth-last-of-type(3) .forumline .snowmobile-topic-page-strip > .snowmobile-page-link{align-items: center;background: transparent !important;border: 0 !important;box-sizing: border-box;display: inline-flex;flex: 0 0 44px;height: 44px;justify-content: center;margin: 0;min-height: 44px;min-width: 44px;padding: 0;text-decoration: none}body > div:nth-last-of-type(3) .forumline .snowmobile-topic-page-strip > .snowmobile-page-link > span{align-items: center;background: #F2F6F8;border: 1px solid #E4EAED;border-radius: 7px;box-sizing: border-box;color: #536A78 !important;display: flex !important;font-size: 12px !important;height: 27px;justify-content: center;min-width: 27px;padding: 0 !important;line-height: 1;position: relative}body > div:nth-last-of-type(3) .forumline .snowmobile-topic-page-strip .page_num{align-items: center;background: transparent !important;color: #536A78 !important;display: flex !important;font-size: 12px !important;height: auto;justify-content: center;line-height: 1;padding: 0 !important;position: static !important}body > div:nth-last-of-type(3) .forumline .snowmobile-topic-page-strip .snowmobile-page-ellipsis{color: #87939B;font-size: 12px;padding: 0 2px}body > div:nth-last-of-type(3) .snowmobile-page-strip{align-items: center;display: flex !important;flex-wrap: wrap;gap: 0;justify-content: flex-end;margin: 0;min-height: 44px;padding: 0;white-space: normal !important;width: 100%}body > div:nth-last-of-type(3) .snowmobile-page-strip > .snowmobile-page-current, body > div:nth-last-of-type(3) .snowmobile-page-strip > .snowmobile-page-link{align-items: center;box-sizing: border-box;display: inline-flex;flex: 0 0 44px;height: 44px;justify-content: center;min-height: 44px;min-width: 44px;position: relative;text-decoration: none}body > div:nth-last-of-type(3) .snowmobile-page-strip > .snowmobile-page-current{color: #fff;font-size: 12px;font-weight: 700}body > div:nth-last-of-type(3) .snowmobile-page-strip > .snowmobile-page-current > span{color: #fff;position: relative;z-index: 1}body > div:nth-last-of-type(3) .snowmobile-page-strip > .snowmobile-page-current::before, body > div:nth-last-of-type(3) .snowmobile-page-strip > .snowmobile-page-link::before{border: 1px solid #DFE6EA;border-radius: 8px;content: \"\";inset: 7px;position: absolute;z-index: 0}body > div:nth-last-of-type(3) .snowmobile-page-strip > .snowmobile-page-current::before{background: #176D99;border-color: #176D99}body > div:nth-last-of-type(3) .snowmobile-page-strip > .snowmobile-page-link::before{background: #fff}body > div:nth-last-of-type(3) .snowmobile-page-strip > .snowmobile-page-link > span{color: #075A83;font-size: 12px;position: relative;z-index: 1}body > div:nth-last-of-type(3) .snowmobile-page-strip > .snowmobile-page-ellipsis{color: #87939B;font-size: 12px;padding: 0 1px}body > div:nth-last-of-type(3) .forumline tr.snowmobile-topic-row.snowmobile-topic-unread{background: #FBFDFF;border-left: 4px solid #176D99 !important}body > div:nth-last-of-type(3) .forumline tr.snowmobile-topic-row.snowmobile-topic-alt.snowmobile-topic-unread, body > div:nth-last-of-type(3) .forumline tr.snowmobile-topic-row.snowmobile-topic-alt.snowmobile-topic-unread > td{background: #F0F8FC !important}body > div:nth-last-of-type(3) .forumline .snowmobile-topic-unread .snowmobile-topic-heading > a.topictitle{color: #064D72;font-weight: 750}body > div:nth-last-of-type(3) .forumline .snowmobile-topic-unread .snowmobile-topic-heading > a.topictitle::before{background: #176D99;border-radius: 50%;content: \"\";flex: 0 0 7px;height: 7px;margin-right: 7px}body > div:nth-last-of-type(3) a[href*=\"mark=topics\"]{align-items: center;background: #fff;border: 1px solid #DCE5E9;border-radius: 8px;box-sizing: border-box;color: #176D99 !important;display: inline-flex;line-height: 1.25;margin: 2px 0;min-height: 44px;padding: 0 10px;text-decoration: none;white-space: normal !important}html[data-snowmobile-theme=\"dark\"] body{background: var(--sm-page) !important;color: var(--sm-text) !important}html[data-snowmobile-theme=\"dark\"] body > div:nth-last-of-type(3) .forumline tr.snowmobile-topic-row, html[data-snowmobile-theme=\"dark\"] body > div:nth-last-of-type(3) .forumline tr.snowmobile-topic-row > td{background: var(--sm-surface) !important;border-color: var(--sm-border) !important;color: var(--sm-text) !important}html[data-snowmobile-theme=\"dark\"] body > div:nth-last-of-type(3) .forumline tr.snowmobile-topic-row.snowmobile-topic-alt, html[data-snowmobile-theme=\"dark\"] body > div:nth-last-of-type(3) .forumline tr.snowmobile-topic-row.snowmobile-topic-alt > td{background: var(--sm-surface-alt) !important}html[data-snowmobile-theme=\"dark\"] body > div:nth-last-of-type(3) .forumline .snowmobile-topic-row .topictitle > a, html[data-snowmobile-theme=\"dark\"] body > div:nth-last-of-type(3) .forumline .snowmobile-topic-unread .snowmobile-topic-heading > a.topictitle{color: var(--sm-link) !important}html[data-snowmobile-theme=\"dark\"] body > div:nth-last-of-type(3) .forumline .snowmobile-topic-row .snowmobile-topic-heading > a.topictitle, html[data-snowmobile-theme=\"dark\"] body > div:nth-last-of-type(3) .forumline .snowmobile-topic-unread .snowmobile-topic-heading > a.topictitle{color: var(--sm-link) !important}html[data-snowmobile-theme=\"dark\"] body > div:nth-last-of-type(3) .forumline a.topictitle{color: var(--sm-link) !important}html[data-snowmobile-theme=\"dark\"] body > div:nth-last-of-type(3) .forumline .snowmobile-topic-row .snowmobile-topic-meta, html[data-snowmobile-theme=\"dark\"] body > div:nth-last-of-type(3) .forumline .snowmobile-topic-row .snowmobile-topic-author, html[data-snowmobile-theme=\"dark\"] body > div:nth-last-of-type(3) .snowmobile-page-strip{color: var(--sm-muted) !important}html[data-snowmobile-theme=\"dark\"] body > div:nth-last-of-type(3) .forumline .snowmobile-topic-row .snowmobile-latest-post, html[data-snowmobile-theme=\"dark\"] body > div:nth-last-of-type(3) .forumline .snowmobile-topic-row .page_links a, html[data-snowmobile-theme=\"dark\"] body > div:nth-last-of-type(3) .forumline .snowmobile-topic-page-strip > .snowmobile-page-link > span, html[data-snowmobile-theme=\"dark\"] body > div:nth-last-of-type(3) .snowmobile-page-strip > .snowmobile-page-link::before, html[data-snowmobile-theme=\"dark\"] body > div:nth-last-of-type(3) .forumline .snowmobile-topic-page-strip > .snowmobile-page-link > span{background: var(--sm-control) !important;border-color: var(--sm-border) !important;color: var(--sm-link) !important}html[data-snowmobile-theme=\"dark\"] body > div:nth-last-of-type(3) .forumline .snowmobile-topic-row .snowmobile-topic-page-strip .page_num, html[data-snowmobile-theme=\"dark\"] body > div:nth-last-of-type(3) .forumline .snowmobile-topic-row .snowmobile-topic-page-strip > .snowmobile-page-link > span{color: var(--sm-link) !important}html[data-snowmobile-theme=\"dark\"] body > div:nth-last-of-type(3) .forumline .snowmobile-topic-row .topic_type_alert{background: #49391f;color: #f4d28d}html[data-snowmobile-theme=\"dark\"] body > div:nth-last-of-type(3) .forumline .snowmobile-topic-row .topic_type_sticky{background: #2d3852;color: #c1cafa}html[data-snowmobile-theme=\"dark\"] body > div:nth-last-of-type(3) .forumline tr.snowmobile-topic-unread, html[data-snowmobile-theme=\"dark\"] body > div:nth-last-of-type(3) .forumline tr.snowmobile-topic-alt.snowmobile-topic-unread, html[data-snowmobile-theme=\"dark\"] body > div:nth-last-of-type(3) .forumline tr.snowmobile-topic-alt.snowmobile-topic-unread > td{background: #1c2d38 !important}html[data-snowmobile-theme=\"dark\"] body > div:nth-last-of-type(3) .nav a[href*=\"start=\"], html[data-snowmobile-theme=\"dark\"] body > div:nth-last-of-type(3) .snowmobile-page-strip > .snowmobile-page-link::before, html[data-snowmobile-theme=\"dark\"] body > div:nth-last-of-type(3) a[href*=\"mark=topics\"]{background: var(--sm-surface) !important;border-color: var(--sm-border) !important;color: var(--sm-link) !important}html[data-snowmobile-theme=\"dark\"] body > div:nth-last-of-type(3) .snowmobile-page-strip > .snowmobile-page-link > span{color: var(--sm-link) !important}html[data-snowmobile-theme=\"dark\"] body > div:nth-last-of-type(3) a[href*=\"mark=topics\"]{background: var(--sm-control) !important}html[data-snowmobile-theme=\"dark\"] body > div:nth-last-of-type(3) .forumline tr:first-child .menubutton{background: #176d99 !important;border-color: #176d99 !important;color: #fff !important}","viewtopic":"#table3 .message_cell{max-width: 90vw}.forumline > tbody > tr > td{display: block;width: 100%}.forumline > tbody > tr > td:not(.name){height: auto !important}.forumline .row1, .forumline .row2{height: 100%}.forumline .poster_info{display: flex !important;padding-bottom: 10px;padding-top: 5px;margin-left: 10px}.forumline .poster_info .plusclick{margin-right: 5px}.forumline .poster_info span{display: flex}.forumline .poster_info font{display: flex}.forumline .poster_info .report_conditions:not(.post_date_portrait){display: none}.forumline .poster_info .report_conditionsRed{display: none}.forumline .poster_info .report_conditions.post_date_portrait{display: flex;font-weight: normal !important;padding-right: 5px}.forumline .poster_info .report_conditions.post_date_portrait br{display: none}.forumline .post_row #table3 > tbody > tr > td:not(.quote){border-left: none !important;position: inherit !important;display: block;width: 100% !important;max-width: 100% !important}#pagebody .forumline{table-layout: fixed;width: 100%}.forumline .postbody{overflow-wrap: anywhere}.forumline .postbody .imagepadleft, .forumline .postbody .imagepadright{box-sizing: border-box;float: none;margin: 8px 0;max-width: 100%;width: fit-content}.forumline .postbody img{box-sizing: border-box;height: auto;max-width: 100% !important}.forumline td.row1, .forumline td.row2{background-color: #F5F5FF}#table2 .forumline .row1, #table2 .forumline .row2{border: none !important}.post_info .plusclick{display: flex}.post_date_portrait{background-color: inherit}.postbody{font-size: 1em;line-height: 1.5}.post_info{position: static !important;display: block !important;width: 100% !important;margin: 4px 0 0 !important;padding-right: 8px;box-sizing: border-box;text-align: right;transform: translateY(14px)}.post_info div{float: inherit !important;position: inherit !important;margin-top: 0}.forumline #post_row.post_row table#table3 tbody tr td a img{width: 18px !important;height: 14px !important;padding: 0 !important;vertical-align: middle}.forumline #post_row.post_row table#table3 tbody tr td:has(.post_link_landscape){white-space: nowrap}.forumline #post_row.post_row .post_link_landscape, .forumline #post_row.post_row .post_quote_landscape{display: inline-flex !important;align-items: center;vertical-align: middle;margin: 0 0 0 4px !important;padding: 0 !important;white-space: nowrap}.forumline #post_row.post_row .post_quote_landscape{margin-right: 12px !important;transform: translateY(-3px)}.forumline #post_row.post_row .post_quote_landscape img{transform: translateY(-2px)}.forumline #post_row.post_row .post_link_landscape{transform: translateY(-3px)}.forumline tbody tr td.row1 form{background: none !important;width: auto !important}.quote{background: #F1F1FA;border-left: 3px solid #7777AA;border-radius: 0 8px 8px 0;box-sizing: border-box;overflow: hidden;padding: 10px 12px}.postbody .quote{color: #465466;font-size: 0.94em;line-height: 1.5;margin: 8px 0}.postbody .quote > b:first-child, .postbody .quote > strong:first-child{color: #354a60}.postbody .quote .quote{background: #fff;border-left-color: #9ba9b7;border-radius: 0 6px 6px 0;margin: 8px 0;padding: 8px 10px}.postbody pre, .postbody .code{box-sizing: border-box;max-width: 100%;overflow-x: auto;-webkit-overflow-scrolling: touch;white-space: pre}.postbody code{overflow-wrap: anywhere;word-break: break-word}.postbody iframe, .postbody video, .postbody object, .postbody embed{box-sizing: border-box;max-width: 100%}@media (max-width: 1200px){#pagebody .forumline > tbody > tr > td.name{box-sizing: border-box;width: 100% !important;min-width: 0 !important;max-width: 100% !important}#pagebody .forumline .poster_info{align-items: center;background-color: #ECECFF;border-bottom: 1px solid #D2D2EE;box-sizing: border-box;flex-wrap: wrap;gap: 6px;margin: 0;padding: 6px 10px;width: 100%}#pagebody .forumline .poster_info > span:not(.plusclick):not(.report_conditions){flex: 0 1 auto}#pagebody .forumline .poster_info .post_date_portrait{background: transparent !important;color: #7777AA !important;display: flex !important;font-size: 10px !important;padding: 0 !important}#pagebody .forumline .post_date_landscape{display: none !important}#pagebody .forumline .poster_info.snowmobile-enhanced{align-items: center;background: #fff;border-bottom: 0;column-gap: 8px;display: grid !important;grid-template-columns: 44px minmax(0, 1fr);padding: 10px 12px}#pagebody .forumline .poster_info.snowmobile-enhanced .expand_poster_data{align-items: center;background: #e9eff6;border-radius: 50%;color: #173b59;cursor: pointer;display: flex !important;grid-column: 1;grid-row: 1;height: 44px;justify-content: center;margin: 0;outline-offset: 2px;width: 44px}#pagebody .forumline .poster_info.snowmobile-enhanced .snowmobile-author{grid-column: 2;min-width: 0}#pagebody .forumline .poster_info.snowmobile-enhanced .snowmobile-author-name{align-items: center;display: flex;flex-wrap: wrap;gap: 7px;line-height: 1.25}#pagebody .forumline .poster_info.snowmobile-enhanced .snowmobile-author-name > span{margin: 0 !important;white-space: normal !important}#pagebody .forumline .poster_info.snowmobile-enhanced .snowmobile-author-name a, #pagebody .forumline .poster_info.snowmobile-enhanced .snowmobile-author-name .snowmobile-plain-author{font-size: 15px;font-weight: 600}#pagebody .forumline .poster_info.snowmobile-enhanced .snowmobile-author-name a{text-decoration: none}#pagebody .forumline .poster_info.snowmobile-enhanced:not(:has(.expand_poster_data)){grid-template-columns: minmax(0, 1fr)}#pagebody .forumline .poster_info.snowmobile-enhanced:not(:has(.expand_poster_data)) .snowmobile-author{grid-column: 1}#pagebody .forumline .poster_info.snowmobile-enhanced .snowmobile-member-badge{background: #f1f0ed;border-radius: 5px;color: #57534b;font-size: 11px;font-weight: 600;line-height: 1;padding: 5px 7px}#pagebody .forumline .poster_info.snowmobile-enhanced .snowmobile-member-badge.is-snowhead{background: #eaf2eb;color: #3f6848}#pagebody .forumline .poster_info.snowmobile-enhanced .snowmobile-member-badge.is-super-snowhead{background: #fff0df;color: #a65309}#pagebody .forumline .poster_info.snowmobile-enhanced .snowmobile-relative-time{color: #686868;font-size: 12px;white-space: nowrap !important}#pagebody .forumline .poster_info.snowmobile-enhanced .snowmobile-author-details{display: none !important}#pagebody .forumline .poster_info.snowmobile-enhanced .post_date_portrait{display: none !important}#pagebody .forumline .poster_info.snowmobile-enhanced .expand_poster_data.snowmobile-avatar{font-size: 14px;font-weight: 700;letter-spacing: 0.02em}#pagebody .forumline #post_row.post_row table#table3 tbody tr td:has(.post_link_landscape){align-items: center;border-left: 0 !important;display: flex !important;gap: 4px;justify-content: flex-end;min-height: 36px;padding: 4px 8px;width: 100% !important}#pagebody .forumline #post_row.post_row table#table3 tbody tr td > a:has(> .post_link_landscape), #pagebody .forumline #post_row.post_row table#table3 tbody tr td .post_quote_landscape > a{align-items: center;background: #F1F1FA;border-radius: 14px;box-sizing: border-box;display: inline-flex !important;height: 28px;justify-content: center;margin: 0 !important;min-width: 28px;padding: 0 10px;position: relative;transform: none !important;width: auto;white-space: nowrap}#pagebody .forumline #post_row.post_row table#table3 tbody tr td > a:has(> .post_link_landscape)::after, #pagebody .forumline #post_row.post_row table#table3 tbody tr td .post_quote_landscape > a::after{content: \"\";inset: -8px -3px;position: absolute}#pagebody .forumline .snowmobile-labeled-action{color: #173b59 !important;font-size: 12px;font-weight: 600;gap: 6px;text-decoration: none}#pagebody .forumline #post_row.post_row table#table3 tbody tr td .snowmobile-labeled-action img{display: none !important}#pagebody .forumline #post_row.post_row table#table3 tbody tr td .post_link_landscape, #pagebody .forumline #post_row.post_row table#table3 tbody tr td .post_quote_landscape{margin: 0 !important;transform: none !important}#pagebody .forumline #post_row.post_row table#table3 tbody tr td .post_link_landscape img, #pagebody .forumline #post_row.post_row table#table3 tbody tr td .post_quote_landscape img{height: 18px !important;width: 18px !important}#pagebody .forumline #post_row.post_row table#table3 .post_info.snowmobile-post-menu{box-sizing: border-box;display: flex !important;margin: 0 !important;padding: 0 !important;position: relative !important;transform: none !important;width: auto !important}#pagebody .forumline #post_row.post_row table#table3 .snowmobile-post-menu > div:first-child{display: flex !important;float: none !important;position: relative !important;top: auto !important}#pagebody .forumline #post_row.post_row table#table3 .snowmobile-post-menu .expand_post_data{align-items: center;background: #f2f4f7;border: 1px solid #e3e8ed;border-radius: 14px;box-sizing: border-box;color: #173b59;cursor: pointer;display: inline-flex !important;font-size: 12px;font-weight: 600;height: 28px;justify-content: center;margin: 0 !important;min-width: 28px;outline-offset: 2px;padding: 0 10px;position: relative;white-space: nowrap;width: auto}#pagebody .forumline #post_row.post_row table#table3 .snowmobile-post-menu .expand_post_data::after{content: \"\";inset: -8px -3px;position: absolute}body a.snowmobile-topic-action{align-items: center;appearance: none;background: #173b59 !important;border: 1px solid #173b59 !important;border-radius: 9px;box-sizing: border-box;color: #fff !important;display: inline-flex !important;font-size: 14px;font-weight: 600;justify-content: center;line-height: 1.2;margin: 5px 8px 5px 0;min-height: 44px;min-width: 44px;padding: 0 14px;text-decoration: none;vertical-align: middle}#pagebody .forumline .message_cell .postbody{font-size: 16px;line-height: 1.5}#qr_form #quick_reply_text{box-sizing: border-box !important;font-size: 16px !important;height: 120px !important;line-height: 1.5;min-height: 120px !important;resize: vertical;width: 100% !important}#qr_form .snowmobile-smilies-toggle{background: #ECECFF;border: 1px solid #C6C6E4;border-radius: 7px;color: #33336B;font: inherit;margin: 6px 0;min-height: 44px;padding: 7px 12px}#qr_form .snowmobile-smilies:not(.is-expanded){display: none !important}}@media (max-width: 600px){#page_head_Xport img{max-width: 100% !important;height: auto !important}#navzone{box-sizing: border-box;display: flex;flex-direction: column;gap: 5px;padding: 0 12px 8px;width: 100% !important}.forumline > tbody > tr > td{box-sizing: border-box}.postbody, .quote, .postbody *, .quote *{overflow-wrap: anywhere !important;word-break: break-word !important}body{background: #f2f4f7 !important;color: #263442;font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif !important}#pagebody{background: #f2f4f7 !important}#pagebody h1{box-sizing: border-box;color: #263442;display: block !important;font-size: 25px;line-height: 1.2;margin: 4px 12px 8px !important;padding: 0 !important}#topic_header{float: none !important;font-size: 13px;line-height: 1.35;margin: 0 !important;width: 100%}#topic_header h3{font-size: inherit;line-height: inherit;margin: 0}#navzone > div:last-child{float: none !important;text-align: right;width: 100%}#navzone .nav{align-items: center;display: inline-flex;gap: 6px;line-height: 1.2}#navzone .nav a{align-items: center;background: #fff;border: 1px solid #d8e0e7;border-radius: 9px;box-sizing: border-box;color: #173b59 !important;display: inline-flex;font-size: 14px;justify-content: center;min-height: 44px;padding: 0 11px;text-decoration: none}#pagebody .forumline{background: transparent !important;border: 0 !important;border-collapse: separate;border-spacing: 0 5px;overflow: visible}#pagebody .forumline > tbody > tr:has(.post_row){background: #fff;border-radius: 14px;border: 1px solid #e1e7ec;display: block;margin: 0;overflow: hidden}#pagebody .forumline > tbody > tr:has(.post_row) > td{background: #fff !important;border: 0 !important;box-sizing: border-box;width: 100% !important}#pagebody .forumline > tbody > tr:has(.post_row) > td.name{border-radius: 14px 14px 0 0}#pagebody .forumline .poster_info.snowmobile-enhanced{padding: 10px 12px 8px}#pagebody .forumline .post_row{background: #fff;box-sizing: border-box;max-width: 100% !important;margin: 0 !important;padding: 0 12px;width: 100% !important}#pagebody .forumline #post_row.post_row table#table3{background: #fff;border-collapse: separate;border-spacing: 0;box-sizing: border-box;width: 100% !important}#pagebody .forumline .message_cell{background: #fff !important;border-right: 0 !important;padding: 8px 0 12px !important}#pagebody .forumline .message_cell .postbody{color: #263442;line-height: 1.55}#pagebody .forumline .message_cell .gensmallite{color: #788491;display: block;font-size: 13px;line-height: 1.4;margin-top: 10px}#pagebody .forumline .message_cell .gensmallite img{max-width: 100%}#pagebody .forumline #post_row.post_row table#table3 tbody tr td:has(.post_link_landscape){background: #fff !important;border-radius: 0 0 14px 14px;border-top: 1px solid #edf0f3 !important;min-height: 36px;padding: 4px 0}#pagebody .forumline #post_row.post_row table#table3 tbody tr td > a:has(> .post_link_landscape), #pagebody .forumline #post_row.post_row table#table3 tbody tr td .post_quote_landscape > a{background: #f2f4f7;border: 1px solid #e3e8ed}#pagebody .forumline > tbody > tr:has(.post_row).snowmobile-post-alt, #pagebody .forumline > tbody > tr:has(.post_row).snowmobile-post-alt > td, #pagebody .forumline tr.snowmobile-post-alt .poster_info.snowmobile-enhanced, #pagebody .forumline tr.snowmobile-post-alt .post_row, #pagebody .forumline tr.snowmobile-post-alt #table3{background: #eef3f7 !important}#pagebody .forumline tr.snowmobile-post-alt .message_cell{background: #eef3f7 !important}#pagebody .forumline tr.snowmobile-post-alt #post_row.post_row table#table3 tbody tr td:has(.post_link_landscape){background: #eef3f7 !important}#qr_form{background: #fff !important;border: 1px solid #e3e8ed !important;border-radius: 14px !important;box-sizing: border-box !important;margin: 10px auto 16px !important;padding: 12px !important;text-align: left !important;width: calc(100vw - 24px) !important}#qr_form #quick_reply_text{background: #fff !important;border: 1px solid #d8e0e7 !important;border-radius: 10px !important;box-sizing: border-box !important;color: #263442;font: inherit;padding: 10px !important;width: 100% !important}#qr_form input[type=\"button\"], #qr_form input[type=\"submit\"]{appearance: none;background: #173b59 !important;border: 1px solid #173b59 !important;border-radius: 9px !important;color: #fff !important;font: inherit;font-size: 14px;margin: 5px 4px 5px 0 !important;min-height: 44px;padding: 0 12px !important}#qr_form .snowmobile-primary-submit{font-weight: 700;min-width: 104px}#qr_form input.snowmobile-secondary-submit, #qr_form input.snowmobile-quote-selected{background: #f2f4f7 !important;border-color: #d8e0e7 !important;color: #173b59 !important}#qr_form .snowmobile-secondary-submit{min-width: 88px}#qr_form .snowmobile-smilies-toggle{background: #f2f4f7;border: 1px solid #d8e0e7;color: #173b59}}@media (max-width: 700px){#pagebody .forumline{margin-left: auto !important;margin-right: auto !important;max-width: calc(100vw - 24px) !important;table-layout: fixed !important;width: calc(100vw - 24px) !important}#pagebody .forumline #table3 .message_cell{box-sizing: border-box !important;max-width: 100% !important;width: 100% !important}}@media (min-width: 1201px){#qr_form .snowmobile-smilies-toggle{display: none !important}}html[data-snowmobile-theme=\"dark\"] body, html[data-snowmobile-theme=\"dark\"] #pagebody{background: var(--sm-page) !important;color: var(--sm-text) !important}html[data-snowmobile-theme=\"dark\"] #pagebody h1, html[data-snowmobile-theme=\"dark\"] #topic_header, html[data-snowmobile-theme=\"dark\"] #topic_header h3{color: var(--sm-text) !important}html[data-snowmobile-theme=\"dark\"] #navzone .nav a{background: var(--sm-surface) !important;border-color: var(--sm-border) !important;color: var(--sm-link) !important}html[data-snowmobile-theme=\"dark\"] #pagebody .forumline > tbody > tr:has(.post_row), html[data-snowmobile-theme=\"dark\"] #pagebody .forumline > tbody > tr:has(.post_row) > td, html[data-snowmobile-theme=\"dark\"] #pagebody .forumline #post_row.post_row table#table3, html[data-snowmobile-theme=\"dark\"] #pagebody .forumline .post_row, html[data-snowmobile-theme=\"dark\"] #pagebody .forumline .message_cell{background: var(--sm-surface) !important;border-color: var(--sm-border) !important;color: var(--sm-text) !important}html[data-snowmobile-theme=\"dark\"] #pagebody .forumline > tbody > tr:has(.post_row).snowmobile-post-alt, html[data-snowmobile-theme=\"dark\"] #pagebody .forumline > tbody > tr:has(.post_row).snowmobile-post-alt > td, html[data-snowmobile-theme=\"dark\"] #pagebody .forumline > tbody > tr:has(.post_row).snowmobile-post-alt .poster_info.snowmobile-enhanced, html[data-snowmobile-theme=\"dark\"] #pagebody .forumline > tbody > tr:has(.post_row).snowmobile-post-alt .post_row, html[data-snowmobile-theme=\"dark\"] #pagebody .forumline > tbody > tr:has(.post_row).snowmobile-post-alt #table3, html[data-snowmobile-theme=\"dark\"] #pagebody .forumline > tbody > tr:has(.post_row).snowmobile-post-alt .message_cell, html[data-snowmobile-theme=\"dark\"] #pagebody .forumline > tbody > tr:has(.post_row).snowmobile-post-alt #post_row.post_row table#table3 tbody tr td:has(.post_link_landscape){background: var(--sm-surface-alt) !important}html[data-snowmobile-theme=\"dark\"] #pagebody .forumline .message_cell .postbody, html[data-snowmobile-theme=\"dark\"] #pagebody .forumline .snowmobile-author-name, html[data-snowmobile-theme=\"dark\"] #pagebody .forumline .snowmobile-author-details{color: var(--sm-text) !important}html[data-snowmobile-theme=\"dark\"] #pagebody .forumline .poster_info.snowmobile-enhanced{background: var(--sm-surface) !important;border-color: var(--sm-border) !important}html[data-snowmobile-theme=\"dark\"] #pagebody .forumline #post_row.post_row table#table3 tbody tr td:has(.post_link_landscape){background: var(--sm-surface) !important;border-color: var(--sm-border) !important}html[data-snowmobile-theme=\"dark\"] #pagebody .forumline > tbody > tr:has(.post_row).snowmobile-post-alt #post_row.post_row table#table3 tbody tr td:has(.post_link_landscape){background: var(--sm-surface-alt) !important}html[data-snowmobile-theme=\"dark\"] #pagebody .forumline .snowmobile-relative-time, html[data-snowmobile-theme=\"dark\"] #pagebody .forumline .message_cell .gensmallite{color: var(--sm-muted) !important}html[data-snowmobile-theme=\"dark\"] #pagebody .forumline .expand_poster_data.snowmobile-avatar{background: #263b4b;color: var(--sm-link)}html[data-snowmobile-theme=\"dark\"] #pagebody .forumline .snowmobile-member-badge{background: #35332e;color: #ded7c5}html[data-snowmobile-theme=\"dark\"] #pagebody .forumline .snowmobile-member-badge.is-snowhead{background: #24392a;color: #a8d4ae}html[data-snowmobile-theme=\"dark\"] #pagebody .forumline .snowmobile-member-badge.is-super-snowhead{background: #49311e;color: #f1bd8b}html[data-snowmobile-theme=\"dark\"] #pagebody .forumline .post_link_landscape, html[data-snowmobile-theme=\"dark\"] #pagebody .forumline .post_quote_landscape > a, html[data-snowmobile-theme=\"dark\"] #pagebody .forumline .expand_post_data, html[data-snowmobile-theme=\"dark\"] #pagebody .forumline .snowmobile-labeled-action, html[data-snowmobile-theme=\"dark\"] #pagebody .forumline .snowmobile-post-menu .expand_post_data{background: var(--sm-control) !important;border-color: var(--sm-border) !important;color: var(--sm-link) !important}html[data-snowmobile-theme=\"dark\"] #pagebody .forumline .quote, html[data-snowmobile-theme=\"dark\"] #pagebody .forumline .postbody .quote{background: #202b36 !important;border-left-color: #688096 !important;color: #d3dde5 !important}html[data-snowmobile-theme=\"dark\"] #pagebody .forumline .postbody .quote > b:first-child, html[data-snowmobile-theme=\"dark\"] #pagebody .forumline .postbody .quote > strong:first-child{color: #edf3f7 !important}html[data-snowmobile-theme=\"dark\"] #pagebody .forumline .postbody .quote .quote, html[data-snowmobile-theme=\"dark\"] #pagebody .forumline .postbody pre, html[data-snowmobile-theme=\"dark\"] #pagebody .forumline .postbody .code{background: #121a21 !important;border-color: #3b4b59 !important;color: #d3dde5 !important}html[data-snowmobile-theme=\"dark\"] #pagebody .forumline .postbody a{color: var(--sm-link) !important}html[data-snowmobile-theme=\"dark\"] #qr_form{background: var(--sm-surface) !important;border-color: var(--sm-border) !important;color: var(--sm-text) !important}html[data-snowmobile-theme=\"dark\"] #qr_form #quick_reply_text{background: #111920 !important;border-color: var(--sm-border) !important;color: var(--sm-text) !important}html[data-snowmobile-theme=\"dark\"] #qr_form input[type=\"button\"], html[data-snowmobile-theme=\"dark\"] #qr_form input[type=\"submit\"], html[data-snowmobile-theme=\"dark\"] body a.snowmobile-topic-action{background: #176d99 !important;border-color: #176d99 !important;color: #fff !important}html[data-snowmobile-theme=\"dark\"] #qr_form input.snowmobile-secondary-submit, html[data-snowmobile-theme=\"dark\"] #qr_form input.snowmobile-quote-selected, html[data-snowmobile-theme=\"dark\"] #qr_form .snowmobile-smilies-toggle{background: var(--sm-control) !important;border-color: var(--sm-border) !important;color: var(--sm-link) !important}"};
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
    style.textContent = ":root{color-scheme: light;--sm-page: #f2f4f7;--sm-surface: #fff;--sm-surface-alt: #eef3f7;--sm-surface-soft: #f8fafc;--sm-border: #e0e7ec;--sm-text: #263442;--sm-muted: #59636f;--sm-link: #075a83;--sm-accent: #176d99;--sm-control: #f1f5f7;--sm-shadow: rgba(28, 44, 60, 0.07)}:root[data-snowmobile-theme=\"dark\"]{color-scheme: dark;--sm-page: #0f1419;--sm-surface: #171f27;--sm-surface-alt: #1e2833;--sm-surface-soft: #202b36;--sm-border: #34424f;--sm-text: #e6edf3;--sm-muted: #a0adba;--sm-link: #75c7ee;--sm-accent: #49a9d4;--sm-control: #273440;--sm-shadow: rgba(0, 0, 0, 0.28)}.snowmobile-bar, .snowmobile-header-logo{display: none}@media (max-width: 600px){div[name=\"page_header\"]{background: #173b59 !important;box-sizing: border-box;padding-top: env(safe-area-inset-top);position: relative !important}#topCorner{background: #173b59 !important;box-sizing: border-box;border-bottom: 1px solid rgba(255, 255, 255, 0.12);height: 52px !important;left: 0 !important;position: relative !important;top: 0 !important;width: 100% !important}.snowmobile-header-logo{align-items: center;box-sizing: border-box;display: flex;height: 44px;justify-content: center;left: 8px;position: absolute;top: 4px;width: 44px;z-index: 31}.snowmobile-header-logo img{display: block;height: 40px;max-height: 40px;max-width: 40px;object-fit: contain;width: 40px}#snowimage_Port, #snowimage_Land, #menu_dummy, #menu_container, #left_menus_table, #fay\\ kaydee > table, [id=\"fay kaydee\"] > table, [id=\"fay kaydee\"] > div[style*=\"background-color:#FFF\"], .snowmobile-legacy-header{display: none !important}[id=\"fay kaydee\"]{height: 52px !important;left: 0 !important;position: absolute !important;top: 0 !important;width: 100% !important;z-index: 30 !important}.snowmobile-bar{align-items: center;background: #173b59;border-bottom: 1px solid rgba(255, 255, 255, 0.12);box-sizing: border-box;display: flex;height: 52px;justify-content: space-between;padding: 0 12px;position: relative;width: 100%;z-index: 14000}.snowmobile-bar .snowmobile-toolbar{position: static}.snowmobile-bar .snowmobile-header-logo{flex: 0 0 44px;position: static}.snowmobile-toolbar{align-items: center;display: flex;gap: 8px;position: absolute;right: 12px;top: 4px;z-index: 14000}.snowmobile-toolbar .snowmobile-icon-control{align-items: center;background-color: #244d6d !important;border: 1px solid rgba(255, 255, 255, 0.25);border-radius: 10px;box-sizing: border-box;color: #fff !important;display: block;flex: 0 0 44px;height: 44px;margin: 0 !important;overflow: hidden;position: relative;text-indent: -9999px;width: 44px}.snowmobile-toolbar .snowmobile-icon-control:active{background-color: #416483 !important}.snowmobile-toolbar .snowmobile-icon-control::before, .snowmobile-toolbar .snowmobile-icon-control::after{content: \"\";left: 50%;position: absolute;text-indent: 0;top: 50%;transform: translate(-50%, -50%)}.snowmobile-toolbar .snowmobile-icon-control > .menuitem{background: none !important}.snowmobile-toolbar .snowmobile-icon-control > .menuitem, .snowmobile-toolbar .snowmobile-visually-hidden{clip: rect(0, 0, 0, 0);clip-path: inset(50%);height: 1px;overflow: hidden;position: absolute;white-space: nowrap;width: 1px}.snowmobile-toolbar .snowmobile-menu-toggle::before{background: linear-gradient(#fff, #fff) 0 0 / 18px 2px no-repeat, linear-gradient(#fff, #fff) 0 7px / 18px 2px no-repeat, linear-gradient(#fff, #fff) 0 14px / 18px 2px no-repeat;height: 16px;width: 18px}.snowmobile-toolbar .snowmobile-search-control::before{border: 2px solid #fff;border-radius: 50%;height: 13px;left: calc(50% - 2px);top: calc(50% - 2px);width: 13px}.snowmobile-toolbar .snowmobile-search-control::after{background: #fff;border-radius: 2px;height: 2px;left: calc(50% + 7px);top: calc(50% + 7px);transform: rotate(45deg);width: 8px}.snowmobile-toolbar .snowmobile-messages-control::before{border: 2px solid #fff;border-radius: 5px;height: 14px;left: 50%;top: 48%;width: 19px}.snowmobile-toolbar .snowmobile-messages-control::after{border-bottom: 2px solid #fff;border-left: 2px solid #fff;height: 6px;left: calc(50% - 7px);top: calc(50% + 7px);transform: skewY(-35deg);width: 6px}.snowmobile-toolbar .snowmobile-account-control::before{background: #fff;border-radius: 50%;height: 8px;left: 50%;top: 14px;transform: translate(-50%, -50%);width: 8px}.snowmobile-toolbar .snowmobile-account-control::after{border: 2px solid #fff;border-bottom: 0;border-radius: 12px 12px 0 0;height: 10px;left: 50%;top: 28px;transform: translate(-50%, -50%);width: 20px}.snowmobile-quick-navigation{background: #f1f6f9;border-radius: 12px;box-sizing: border-box;border-spacing: 0;display: block !important;margin: 6px 0 10px;padding: 8px 10px;text-align: left;width: 100% !important}.snowmobile-quick-navigation > tbody, .snowmobile-quick-navigation > tbody > tr{display: flex !important;flex-direction: column;gap: 7px;width: 100%}.snowmobile-quick-navigation td{box-sizing: border-box;display: block !important;padding: 0 !important;text-align: left !important;width: 100% !important}.snowmobile-last-visit{color: #687582;display: block;font-size: 11px;font-weight: 400;line-height: 1.3}.snowmobile-quick-links{align-items: center;display: flex;flex-wrap: wrap;gap: 6px}.snowmobile-quick-navigation .snowmobile-quick-link{align-items: center;background: #fff !important;border: 1px solid #d5e0e7;border-radius: 999px;box-sizing: border-box;color: #173b59 !important;display: inline-flex;font-size: 13px;font-weight: 600;justify-content: center;line-height: 1.2;min-height: 44px;padding: 0 12px;text-decoration: none;white-space: nowrap}.snowmobile-quick-navigation .snowmobile-quick-link:active{background: #e5eef4 !important}.snowmobile-menu[hidden]{display: none !important}.snowmobile-menu{background: #fff;border: 1px solid #d8e0e7;border-radius: 12px;box-shadow: 0 8px 24px rgba(20, 38, 55, 0.24);box-sizing: border-box;color: #263442;max-height: calc(100vh - 64px);max-width: calc(100vw - 24px);min-width: min(280px, calc(100vw - 24px));overflow-y: auto;padding: 7px;position: absolute;right: 0;top: calc(100% + 4px);width: 310px;z-index: 14001}.snowmobile-menu .snowmobile-menu-heading{color: #596573;font-size: 11px;font-weight: 700;letter-spacing: 0.04em;line-height: 1.2;padding: 4px 10px 0;text-transform: uppercase}.snowmobile-menu a{align-items: center;background: none !important;border-radius: 8px;box-sizing: border-box;color: #173b59 !important;display: flex;font-size: 15px;min-height: 44px;padding: 0 10px;text-decoration: none;white-space: normal}.snowmobile-menu a > .menuitem{margin: 0 !important;padding: 0 !important}.snowmobile-menu a *{background: none !important;color: #173b59 !important;font-family: inherit !important;font-size: 15px !important;font-weight: 500 !important}.snowmobile-menu a:active{background: #edf3f7 !important}.snowmobile-menu .snowmobile-theme-toggle{align-items: center;appearance: none;background: none;border: 0;border-radius: 8px;box-sizing: border-box;color: var(--sm-text);cursor: pointer;display: flex;font: inherit;font-size: 15px;justify-content: space-between;min-height: 44px;padding: 0 10px;text-align: left;width: 100%}.snowmobile-theme-track{background: #aab4bd;border-radius: 999px;flex: 0 0 38px;height: 22px;margin-left: 12px;position: relative;transition: background-color 160ms ease}.snowmobile-theme-track::after{background: #fff;border-radius: 50%;content: \"\";height: 18px;left: 2px;position: absolute;top: 2px;transition: transform 160ms ease;width: 18px}.snowmobile-theme-toggle[aria-checked=\"true\"] .snowmobile-theme-track{background: #358db7}.snowmobile-theme-toggle[aria-checked=\"true\"] .snowmobile-theme-track::after{transform: translateX(16px)}}html[data-snowmobile-theme=\"dark\"] body{background-color: var(--sm-page) !important;color: var(--sm-text) !important}html[data-snowmobile-theme=\"dark\"] body :is( .gen, .genmed, .gensmall, .gensmallite, .genbig, .name, .postdetails, .report_conditions, .copyright, .nav, .maintitle, h1, h2, h3, h4, label ){color: var(--sm-text) !important}html[data-snowmobile-theme=\"dark\"] body a:not(.snowmobile-icon-control){color: var(--sm-link) !important}html[data-snowmobile-theme=\"dark\"] body :is(input, textarea, select){background-color: var(--sm-surface) !important;border-color: var(--sm-border) !important;color: var(--sm-text) !important}html[data-snowmobile-theme=\"dark\"] body :is(.forumline, .bodyline){border-color: var(--sm-border) !important}@media (max-width: 600px){html[data-snowmobile-theme=\"dark\"] div[name=\"page_header\"], html[data-snowmobile-theme=\"dark\"] #topCorner, html[data-snowmobile-theme=\"dark\"] .snowmobile-bar{background: #111c25 !important;border-color: #34424f}html[data-snowmobile-theme=\"dark\"] .snowmobile-toolbar .snowmobile-icon-control{background-color: #263b4b !important;border-color: #526574}html[data-snowmobile-theme=\"dark\"] .snowmobile-quick-navigation{background: var(--sm-surface-alt)}html[data-snowmobile-theme=\"dark\"] .snowmobile-last-visit{color: var(--sm-muted)}html[data-snowmobile-theme=\"dark\"] .snowmobile-quick-navigation .snowmobile-quick-link{background: var(--sm-surface) !important;border-color: var(--sm-border);color: var(--sm-link) !important}html[data-snowmobile-theme=\"dark\"] .snowmobile-menu{background: var(--sm-surface);border-color: var(--sm-border);box-shadow: 0 8px 24px rgba(0, 0, 0, 0.55);color: var(--sm-text)}html[data-snowmobile-theme=\"dark\"] .snowmobile-menu .snowmobile-menu-heading{color: var(--sm-muted)}html[data-snowmobile-theme=\"dark\"] .snowmobile-menu a, html[data-snowmobile-theme=\"dark\"] .snowmobile-menu a *{color: var(--sm-link) !important}html[data-snowmobile-theme=\"dark\"] .snowmobile-menu .snowmobile-theme-toggle{color: var(--sm-text)}html[data-snowmobile-theme=\"dark\"] .snowmobile-menu a:active, html[data-snowmobile-theme=\"dark\"] .snowmobile-menu .snowmobile-theme-toggle:active{background: var(--sm-surface-alt) !important}}" + (route ? styles[route.style] : "");
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
    (() => {
  "use strict";

  const LOGIN_HREF = "/ski-forum/login.php";
  const SEARCH_HREF = "/ski-forum/search.php";

  function topLevel(element) {
    let node = element;
    while (node && node.parentElement !== document.body) node = node.parentElement;
    return node;
  }

  function anchor(href, label) {
    const link = document.createElement("a");
    link.href = href;
    link.textContent = label;
    return link;
  }

  function homeLogo() {
    const link = anchor("https://snowheads.com/", "");
    link.className = "snowmobile-header-logo";
    link.setAttribute("aria-label", "Snowheads home");
    link.title = "Snowheads home";

    const image = document.createElement("img");
    image.src = "/ski-forum/designLab/s_for_snowHeads_dotcom.png";
    image.alt = "";
    link.append(image);
    return link;
  }

  function enhanceHeader() {
    if (document.querySelector(".snowmobile-toolbar")) return;

    const corner = document.querySelector("#topCorner");
    if (corner && !corner.querySelector(".snowmobile-header-logo")) {
      corner.append(homeLogo());
    }
    const legacy = corner
      ? null
      : topLevel(document.querySelector("img[src*='ski-club']") || document.querySelector("input[name='username']"));

    const toolbar = document.createElement("div");
    toolbar.className = "snowmobile-toolbar";

    const menuButton = document.createElement("button");
    menuButton.className = "snowmobile-icon-control snowmobile-menu-toggle";
    menuButton.type = "button";
    menuButton.textContent = "Menu";
    menuButton.setAttribute("aria-label", "Open menu");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-controls", "snowmobile-menu");

    const menu = document.createElement("nav");
    menu.className = "snowmobile-menu";
    menu.id = "snowmobile-menu";
    menu.setAttribute("aria-label", "Site menu");
    menu.hidden = true;

    const themeToggle = document.createElement("button");
    themeToggle.className = "snowmobile-theme-toggle";
    themeToggle.type = "button";
    themeToggle.setAttribute("role", "switch");
    const themeLabel = document.createElement("span");
    themeLabel.className = "snowmobile-theme-label";
    themeLabel.textContent = "Dark mode";
    const themeTrack = document.createElement("span");
    themeTrack.className = "snowmobile-theme-track";
    themeTrack.setAttribute("aria-hidden", "true");
    themeToggle.append(themeLabel, themeTrack);
    menu.append(themeToggle);
    themeToggle.addEventListener("click", () => window.SnowmobileTheme?.toggle());

    const addMenuSection = (label, links) => {
      if (!links.length) return;
      const heading = document.createElement("div");
      heading.className = "snowmobile-menu-heading";
      heading.textContent = label;
      menu.append(heading, ...links);
    };

    const accountLink = document.querySelector("#menu_container a[href*='payments.php'], #topCorner a[href*='payments.php']");
    const loggedIn = Boolean(accountLink);

    const searchLink = anchor(SEARCH_HREF, "Search");
    searchLink.classList.add("snowmobile-icon-control", "snowmobile-search-control");
    searchLink.setAttribute("aria-label", "Search");
    searchLink.title = "Search";

    if (loggedIn) {
      const linksIn = (id) => [...(document.querySelector(`#${id}`)?.querySelectorAll("a[href]") || [])];
      addMenuSection("User Facilities", linksIn("UFmenushell"));
      addMenuSection("snowBase", linksIn("SBmenushell"));

      const logoutLink = document.querySelector("#menu_container a[href*='logout=true']");
      if (logoutLink) {
        logoutLink.textContent = "Log out";
        addMenuSection("Account", [logoutLink]);
      }

      const messagesLink = document.querySelector("#menu_container a[href*='privmsg.php']");
      if (messagesLink) {
        messagesLink.classList.add("snowmobile-icon-control", "snowmobile-messages-control");
        messagesLink.setAttribute("aria-label", "Messages");
        messagesLink.title = "Send and read messages";
        toolbar.append(messagesLink);
      }

      accountLink.classList.add("snowmobile-icon-control", "snowmobile-account-control");
      accountLink.setAttribute("aria-label", "snowAccount");
      accountLink.title = "snowAccount";
      accountLink.replaceChildren();
      const label = document.createElement("span");
      label.className = "snowmobile-visually-hidden";
      label.textContent = "snowAccount";
      accountLink.append(label);
      toolbar.append(accountLink);
    } else {
      addMenuSection("snowHeads", [
        anchor("/ski-forum/snow_reports.php", "Snow Reports"),
        anchor("/ski-forum/faq.php", "FAQ"),
        anchor("/ski-forum/profile.php?mode=register", "Register"),
        anchor(LOGIN_HREF, "Log in"),
      ]);

      const loginLink = anchor(LOGIN_HREF, "");
      loginLink.className = "snowmobile-icon-control snowmobile-account-control";
      loginLink.setAttribute("aria-label", "Log in");
      loginLink.title = "Log in";
      toolbar.append(loginLink);
    }

    toolbar.prepend(searchLink);
    toolbar.insertBefore(menuButton, toolbar.firstChild);
    toolbar.append(menu);

    menuButton.addEventListener("click", () => {
      const opening = menu.hidden;
      menu.hidden = !opening;
      menuButton.setAttribute("aria-expanded", String(opening));
      menuButton.setAttribute("aria-label", opening ? "Close menu" : "Open menu");
    });
    menu.addEventListener("click", (event) => {
      if (event.target.closest("a")) closeMenu();
    });
    document.addEventListener("pointerdown", (event) => {
      if (!toolbar.contains(event.target) && !menu.hidden) closeMenu();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !menu.hidden) {
        closeMenu();
        menuButton.focus();
      }
    });

    function closeMenu() {
      menu.hidden = true;
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "Open menu");
    }

    if (corner) {
      corner.append(toolbar);
      window.SnowmobileTheme?.get();
      enhanceQuickNavigation();
      return;
    }

    const bar = document.createElement("div");
    bar.className = "snowmobile-bar";
    bar.append(homeLogo(), toolbar);

    if (legacy) {
      legacy.classList.add("snowmobile-legacy-header");
      legacy.before(bar);
    } else {
      document.body.prepend(bar);
    }
    window.SnowmobileTheme?.get();
    enhanceQuickNavigation();
  }

  function enhanceQuickNavigation() {
    const label = [...document.querySelectorAll("#pagebody .gensmall")]
      .find((element) => /^last visit\s*:/i.test(element.textContent.trim()));
    const row = label?.closest("tr");
    if (!label || !row) return;

    const links = [...row.querySelectorAll("a.gensmall[href]")].filter((link) =>
      /^(?:new posts|your posts|unanswered posts)$/i.test(link.textContent.trim()),
    );
    const navigation = row.closest("table");
    const labelCell = label.closest("td");
    const linksCell = links[0]?.closest("td");
    if (links.length !== 3 || !navigation || !labelCell || !linksCell) return;

    const quickLinks = document.createElement("div");
    quickLinks.className = "snowmobile-quick-links";
    links.forEach((link) => {
      link.classList.add("snowmobile-quick-link");
      quickLinks.append(link);
    });

    navigation.classList.add("snowmobile-quick-navigation");
    label.classList.add("snowmobile-last-visit");
    labelCell.replaceChildren(label);
    linksCell.replaceChildren(quickLinks);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", enhanceHeader, { once: true });
  } else {
    enhanceHeader();
  }
})();

  }
  if (route?.script === "start") {
(() => {
  "use strict";

  const LAST_READ_KEY = "snowmobile:lastReadPosts";

  function readLastReadStore() {
    try {
      const raw = window.localStorage.getItem(LAST_READ_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch {
      return {};
    }
  }

  function buildPostHref(baseHref, postId) {
    const url = new URL(baseHref, window.location.href);
    const sid = url.searchParams.get("sid");
    url.search = "";
    url.searchParams.set("p", postId);
    if (sid) url.searchParams.set("sid", sid);
    url.hash = postId;
    return url.pathname + url.search + url.hash;
  }

  function relativeTime(label) {
    const text = label.trim();
    const relative = text.match(/^(\d+)\s+(minute|hour|day|week|month|year)s? ago$/i);
    if (relative) {
      const units = {
        minute: "m",
        hour: "h",
        day: "d",
        week: "w",
        month: "mo",
        year: "y",
      };
      return `${relative[1]}${units[relative[2].toLowerCase()]} ago`;
    }

    const now = new Date();
    let postedAt;
    const date = text.match(/(?:\w{3}\s+)?(\d{1,2})-(\d{1,2})-(\d{2,4})/);
    if (date) {
      const year = Number(date[3]);
      postedAt = new Date(
        year < 100 ? 2000 + year : year,
        Number(date[2]) - 1,
        Number(date[1]),
      );
    } else if (/^yesterday\b/i.test(text)) {
      postedAt = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    } else if (/^today\b/i.test(text)) {
      postedAt = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else {
      return text;
    }

    const time = text.match(/(\d{1,2}):(\d{2})/);
    if (time) postedAt.setHours(Number(time[1]), Number(time[2]));
    if (Number.isNaN(postedAt.getTime())) return text;

    const minutes = Math.floor(Math.max(0, now.getTime() - postedAt.getTime()) / 60000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    return `${Math.floor(months / 12)}y ago`;
  }

  function enhanceHome() {
    const recentTable = [...document.querySelectorAll("table.forumline")].find((table) =>
      /recent posts/i.test(table.querySelector("th")?.textContent || ""),
    );
    const layout =
      recentTable?.closest("td")?.closest("table") ||
      document.querySelector("body > div:last-of-type > div > table");
    const columns = layout?.querySelector(":scope > tbody > tr");
    if (!layout || !columns || layout.classList.contains("snowmobile-home-layout")) return;

    layout.classList.add("snowmobile-home-layout");
    layout.parentElement?.classList.add("snowmobile-home-inner");
    layout.parentElement?.parentElement?.classList.add("snowmobile-home-root");
    const cells = [...columns.children];
    cells[2]?.classList.add("snowmobile-aside-column");

    layout.querySelectorAll("table.forumline").forEach((table) => {
      const heading = table.querySelector("th")?.textContent.trim() || "";
      if (/recent posts/i.test(heading)) {
        table.classList.add("snowmobile-recent-posts");
        enhanceRecentPosts(table);
      } else if (/2nd hand/i.test(heading)) {
        table.classList.add("snowmobile-market-posts");
      } else if (/who is online/i.test(heading)) {
        table.classList.add("snowmobile-online");
      } else if (/welcome to snowheads/i.test(heading)) {
        table.classList.add("snowmobile-welcome");
      }
    });
  }

  function enhanceRecentPosts(table) {
    const lastReadStore = readLastReadStore();

    table.querySelectorAll("tr").forEach((row) => {
      const cell = row.querySelector("td.row1, td.row2");
      if (!cell || cell.querySelector(".snowmobile-recent-meta")) return;

      const topicLink = cell.querySelector(':scope > div > div:first-child a[href*="viewtopic.php"]');
      const forumLink = cell.querySelector('a.gensmall[href*="viewforum.php"], a.gensmall[href*="snow_reports.php"]');
      const timeLabel = [...cell.querySelectorAll("span.gensmall")].find((span) =>
        !span.querySelector("a") &&
        /(?:ago|^today\b|^yesterday\b|\d{1,2}-\d{1,2}-\d{2,4})/i.test(span.textContent.trim()),
      );
      const latestLink = cell.querySelector('a[href*="viewtopic.php?p="]');
      if (!forumLink && !timeLabel && !latestLink) return;

      const topicId = topicLink?.getAttribute("href")?.match(/[?&]t=(\d+)/)?.[1] || null;
      const latestPostId =
        latestLink?.getAttribute("href")?.match(/[?&]p=(\d+)/)?.[1] ||
        topicLink?.getAttribute("href")?.match(/#(\d+)/)?.[1] ||
        null;
      const savedPostId = topicId ? String(lastReadStore[topicId]?.p || "") : "";
      const lastReadPostId = /^\d+$/.test(savedPostId) ? savedPostId : null;
      const legacyRight = timeLabel?.parentElement || latestLink?.closest("div");

      const meta = document.createElement("div");
      meta.className = "snowmobile-recent-meta";
      if (forumLink) {
        meta.classList.add("has-forum");
        forumLink.remove();
        meta.append(forumLink);
      }
      if (timeLabel) {
        const time = document.createElement("time");
        time.className = "snowmobile-recent-time";
        time.title = timeLabel.textContent.trim();
        time.textContent = relativeTime(timeLabel.textContent);
        meta.append(time);
      }
      if (lastReadPostId && topicLink) {
        const lastReadLink = document.createElement("a");
        lastReadLink.className = "snowmobile-recent-last-read";
        const hasUnread = Boolean(latestPostId && Number(latestPostId) > Number(lastReadPostId));
        if (hasUnread) lastReadLink.classList.add("has-unread");
        lastReadLink.href = buildPostHref(topicLink.href, lastReadPostId);
        const label = document.createElement("span");
        label.textContent = "Last read";
        lastReadLink.append(label);
        const accessibleLabel = hasUnread
          ? "Jump to last read message (newer replies available)"
          : "Jump to last read message";
        lastReadLink.setAttribute("aria-label", accessibleLabel);
        lastReadLink.title = accessibleLabel;
        meta.append(lastReadLink);
      }
      if (latestLink) {
        const latestIcon = latestLink.querySelector("img")?.cloneNode(true);
        if (latestIcon) latestLink.replaceChildren(latestIcon);
        latestLink.classList.add("snowmobile-latest-post");
        latestLink.setAttribute("aria-label", "Go to latest post");
        latestLink.title = "Go to latest post";
        meta.classList.add("has-latest");
        meta.append(latestLink);
      }
      if (legacyRight && legacyRight !== cell.querySelector(":scope > div")) {
        legacyRight.remove();
      }

      const title = cell.querySelector(":scope > div > div:first-child");
      title?.childNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE && !node.textContent.trim()) node.remove();
      });

      cell.querySelector(":scope > div")?.append(meta);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", enhanceHome, { once: true });
  } else {
    enhanceHome();
  }
})();

}
if (route?.script === "viewforum") {
(() => {
  "use strict";

  function getRelativeDate(dateText, timeText) {
    const now = new Date();
    let postedAt;
    const exactDate = dateText.match(/(\d{1,2})[,\s]+([A-Za-z]{3})[,\s]+(\d{2,4})/);
    const weekdayDate = dateText.match(/\b(Sun|Mon|Tue|Wed|Thu|Fri|Sat)\b/i);

    if (exactDate) {
      const year = Number(exactDate[3]);
      postedAt = new Date(
        year < 100 ? 2000 + year : year,
        new Date(`${exactDate[2]} 1, 2000`).getMonth(),
        Number(exactDate[1]),
      );
    } else if (/^yesterday\b/i.test(dateText)) {
      postedAt = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    } else if (/^today\b/i.test(dateText)) {
      postedAt = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (weekdayDate) {
      const weekdays = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
      const targetDay = weekdays.indexOf(weekdayDate[1].toLowerCase());
      const daysAgo = (now.getDay() - targetDay + 7) % 7;
      postedAt = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysAgo);
    } else {
      return "";
    }

    const time = timeText.match(/(\d{1,2}):(\d{2})/);
    if (time) postedAt.setHours(Number(time[1]), Number(time[2]));
    if (Number.isNaN(postedAt.getTime())) return "";

    const elapsed = Math.max(0, now.getTime() - postedAt.getTime());
    const minutes = Math.floor(elapsed / 60000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    return `${Math.floor(months / 12)}y ago`;
  }

  function appendPageItem(items, node) {
    if (node.nodeType === Node.TEXT_NODE) {
      if (/\.{3}|…/.test(node.textContent)) {
        const ellipsis = document.createElement("span");
        ellipsis.className = "snowmobile-page-ellipsis";
        ellipsis.textContent = "…";
        items.push(ellipsis);
      }
      return;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return;

    if (node.matches('a[href*="start="]')) {
      const label = document.createElement("span");
      label.textContent = node.textContent.trim();
      node.replaceChildren(label);
      node.classList.add("snowmobile-page-link");
      if (label.textContent.toLowerCase() === "next") {
        node.classList.add("snowmobile-page-next");
      }
      items.push(node);
      return;
    }

    if (node.tagName === "B" && /^\d+$/.test(node.textContent.trim())) {
      const current = document.createElement("span");
      current.className = "snowmobile-page-current";
      const label = document.createElement("span");
      label.textContent = node.textContent.trim();
      current.append(label);
      items.push(current);
      return;
    }

    node.childNodes.forEach((child) => appendPageItem(items, child));
  }

  function enhancePagination() {
    document.querySelectorAll(
      'body > div:nth-last-of-type(3) td.nav > span.gensmall, body > div:nth-last-of-type(3) span.nav[style*="white-space:nowrap"]',
    ).forEach((strip) => {
      const items = [];
      strip.childNodes.forEach((node) => appendPageItem(items, node));
      strip.replaceChildren(...items);
      strip.classList.add("snowmobile-page-strip");
      strip.setAttribute("aria-label", "Forum page navigation");
    });
  }

  function simplifyTopicPageLinks(pageLinks) {
    const items = [];
    pageLinks.childNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE && node.tagName === "A") {
        node.classList.add("snowmobile-page-link");
        const label = document.createElement("span");
        label.textContent = node.querySelector(".page_num")?.textContent.trim() ||
          node.textContent.trim().replace(/\s+/g, "");
        node.replaceChildren(label);
        items.push(node);
      } else {
        appendPageItem(items, node);
      }
    });
    pageLinks.replaceChildren(...items);
    pageLinks.classList.add("snowmobile-topic-page-strip");
    pageLinks.setAttribute("aria-label", "Topic pages");
  }

  function isUnreadTopic(row, title, latestPostLink) {
    const statusCell = row.cells[0];
    const titleContainer = title.closest("span.topictitle");
    const statusClasses = [row.className, statusCell?.className, titleContainer?.className, title.className].join(" ");
    const statusImages = [...(statusCell?.querySelectorAll("img") || [])];
    const hasNewFolderIcon = statusImages.some((image) => {
      const src = image.getAttribute("src") || "";
      return /(?:^|\/)folder_new(?:_[a-z]+)?\.(?:gif|png|jpe?g|svg)$/i.test(src) ||
        /\bnew posts?\b/i.test(`${image.alt} ${image.title}`);
    });
    const newestPostLabel = latestPostLink &&
      /\b(?:newest post|new posts?|unread)\b/i.test(
        `${latestPostLink.title} ${latestPostLink.getAttribute("aria-label") || ""} ${latestPostLink.querySelector("img")?.alt || ""}`,
      );
    const unreadClass = /(?:^|\s)(?:unread|topic[_-]new|new[_-]post)(?:\s|$)/i.test(statusClasses);
    const explicitBold = title.matches("b, strong") || Boolean(title.closest("b, strong")) ||
      [...[title], ...title.querySelectorAll("b, strong, [style]")].some((element) =>
        /font-weight\s*:\s*(?:bold|[6-9]00)/i.test(element.getAttribute("style") || ""),
      );

    return hasNewFolderIcon || newestPostLabel || unreadClass || explicitBold;
  }

  function enhanceTopics() {
    let topicIndex = 0;
    document.querySelectorAll("body > div:nth-last-of-type(3) .forumline tr").forEach((row) => {
      const cells = row.querySelectorAll(":scope > td");
      if (cells.length < 3 || row.classList.contains("snowmobile-topic-row")) return;

      const topicCell = cells[1];
      const title = topicCell.querySelector("a.topictitle");
      const titleWrap = topicCell.querySelector("span.topictitle");
      const alertBadge = topicCell.querySelector(".topic_type_alert");
      const stickyBadge = topicCell.querySelector(".topic_type_sticky");
      const lastPostCell = cells[cells.length - 1];
      const authors = lastPostCell.querySelectorAll('.postdetails a[href*="profile.php?mode=viewprofile"]');
      const author = authors[authors.length - 1];
      const authorName = author?.textContent.trim() ||
        lastPostCell.querySelector(".postdetails > div:nth-child(2)")?.textContent.trim() ||
        lastPostCell.querySelector(".postdetails > div:first-child")?.textContent.trim();
      const replyCount = cells.length > 3
        ? cells[2].querySelector(".postdetails b")?.textContent.trim()
        : "";
      const lastPostBlock = lastPostCell.querySelector(".postdetails > div:last-child");
      const dateText = lastPostBlock?.firstChild?.textContent.trim() || "";
      const timeText = lastPostBlock?.querySelector("b")?.textContent.trim() || "";
      const latestPostLink = lastPostBlock?.querySelector('a[href*="viewtopic.php?p="]');
      if (!title || !authorName) return;
      const unread = isUnreadTopic(row, title, latestPostLink);
      if (topicIndex % 2 === 1) row.classList.add("snowmobile-topic-alt");
      topicIndex += 1;

      if (titleWrap) {
        titleWrap.classList.add("snowmobile-topic-heading");
        titleWrap.replaceChildren(...[alertBadge, stickyBadge, title].filter(Boolean));
      }

      const meta = document.createElement("div");
      meta.className = "snowmobile-topic-meta";
      const authorLabel = document.createElement("span");
      authorLabel.className = "snowmobile-topic-author";
      authorLabel.textContent = authorName;
      meta.append(authorLabel);

      if (replyCount) {
        const replies = document.createElement("span");
        replies.textContent = `${replyCount} ${Number(replyCount) === 1 ? "reply" : "replies"}`;
        meta.append(replies);
      }

      const relativeDate = getRelativeDate(dateText, timeText);
      if (relativeDate) {
        const time = document.createElement("time");
        time.className = "snowmobile-topic-time";
        time.textContent = relativeDate;
        time.title = `${dateText} ${timeText}`.trim();
        meta.append(time);
      }
      topicCell.append(meta);
      const pageLinks = topicCell.querySelector(":scope > div .page_links");
      if (pageLinks) {
        simplifyTopicPageLinks(pageLinks);
        topicCell.append(pageLinks);
      }
      if (latestPostLink) {
        const latestIcon = latestPostLink.querySelector("img")?.cloneNode(true);
        if (latestIcon) latestPostLink.replaceChildren(latestIcon);
        latestPostLink.classList.add("snowmobile-latest-post");
        latestPostLink.setAttribute("aria-label", unread ? "Go to newest unread post" : "Go to latest post");
        latestPostLink.title = unread ? "Go to newest unread post" : "Go to latest post";
        meta.append(latestPostLink);
      }
      if (unread) row.classList.add("snowmobile-topic-unread");
      if (alertBadge) {
        row.classList.add("snowmobile-topic-alert");
        alertBadge.setAttribute("aria-label", "Alert topic");
      }
      if (stickyBadge) {
        row.classList.add("snowmobile-topic-sticky");
        stickyBadge.setAttribute("aria-label", "Pinned topic");
      }
      row.classList.add("snowmobile-topic-row");
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      enhanceTopics();
      enhancePagination();
    }, { once: true });
  } else {
    enhanceTopics();
    enhancePagination();
  }
})();

}
if (route?.script === "viewtopic") {
(() => {
  "use strict";

  const LAST_READ_KEY = "snowmobile:lastReadPosts";
  const MAX_TRACKED_TOPICS = 200;

  function readLastReadStore() {
    try {
      const raw = window.localStorage.getItem(LAST_READ_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch {
      return {};
    }
  }

  function saveLastReadPost(topicId, postId) {
    if (!/^\d+$/.test(topicId) || !/^\d+$/.test(postId)) return;
    try {
      const store = readLastReadStore();
      const prevId = Number(store[topicId]?.p || 0);
      const nextId = Number(postId);
      if (nextId <= prevId) return;

      store[topicId] = { p: String(nextId), t: Date.now() };
      const keys = Object.keys(store);
      if (keys.length > MAX_TRACKED_TOPICS) {
        keys
          .sort((a, b) => Number(store[b]?.t || 0) - Number(store[a]?.t || 0))
          .slice(MAX_TRACKED_TOPICS)
          .forEach((key) => delete store[key]);
      }
      window.localStorage.setItem(LAST_READ_KEY, JSON.stringify(store));
    } catch {
      /* Ignore storage quota or private-browsing failures. */
    }
  }

  function getTopicId() {
    const queryTopic = new URLSearchParams(window.location.search).get("t");
    if (queryTopic && /^\d+$/.test(queryTopic)) return queryTopic;

    const input = document.querySelector('input[name="t"]');
    if (input && /^\d+$/.test(input.value)) return input.value;

    for (const link of document.querySelectorAll('a[href*="viewtopic.php?"]')) {
      const match = link.getAttribute("href")?.match(/[?&]t=(\d+)/);
      if (match) return match[1];
    }
    return null;
  }

  function getPostId(postRow) {
    const row = postRow.closest("tr");
    const name = row?.querySelector("a[name]")?.getAttribute("name")?.trim();
    if (name && /^\d+$/.test(name)) return name;

    const permalink = postRow.querySelector("a:has(> .post_link_landscape)");
    if (permalink) {
      const hash = new URL(permalink.href, window.location.href).hash.slice(1);
      if (/^\d+$/.test(hash)) return hash;
    }
    return null;
  }

  function trackLastRead() {
    const topicId = getTopicId();
    if (!topicId) return;

    const entries = [...document.querySelectorAll("#pagebody .forumline .post_row")]
      .map((postRow) => ({
        element: postRow.closest("tr") || postRow,
        postId: getPostId(postRow),
      }))
      .filter((entry) => entry.postId);
    if (!entries.length) return;

    const recordVisible = () => {
      const viewportBottom = window.innerHeight || document.documentElement.clientHeight;
      let highestSeen = 0;
      for (const { element, postId } of entries) {
        const rect = element.getBoundingClientRect();
        if (rect.height > 0 && rect.top < viewportBottom) {
          const id = Number(postId);
          if (id > highestSeen) highestSeen = id;
        }
      }
      if (highestSeen) saveLastReadPost(topicId, String(highestSeen));
    };

    const hashId = window.location.hash.slice(1);
    if (/^\d+$/.test(hashId) && entries.some((entry) => entry.postId === hashId)) {
      saveLastReadPost(topicId, hashId);
    }

    let timer = 0;
    const scheduleRecord = () => {
      if (timer) return;
      timer = window.setTimeout(() => {
        timer = 0;
        recordVisible();
      }, 150);
    };

    recordVisible();
    window.addEventListener("scroll", scheduleRecord, { passive: true });
    window.addEventListener("pagehide", recordVisible);
  }

  function getRelativeDate(posterInfo) {
    const portraitDates = posterInfo.querySelectorAll(".post_date_portrait");
    const dateSpans = portraitDates.length
      ? portraitDates
      : posterInfo.querySelectorAll(".post_date_landscape");
    const dateText = dateSpans[0]?.textContent || "";
    const timeText = dateSpans[1]?.textContent || "";
    const dateMatch = dateText.match(/(?:\w{3}\s+)?(\d{1,2})\s+([A-Z][a-z]{2}),?\s+(\d{2,4})/);
    const timeMatch = timeText.match(/(\d{1,2}):(\d{2})/);
    if (!dateMatch || !timeMatch) return "";

    const month = new Date(`${dateMatch[2]} 1, 2000`).getMonth();
    const year = Number(dateMatch[3]);
    const postedAt = new Date(
      year < 100 ? 2000 + year : year,
      month,
      Number(dateMatch[1]),
      Number(timeMatch[1]),
      Number(timeMatch[2]),
    );
    if (Number.isNaN(postedAt.getTime())) return "";

    const elapsed = Math.max(0, Date.now() - postedAt.getTime());
    const minutes = Math.floor(elapsed / 60000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    return `${Math.floor(months / 12)}y ago`;
  }

  function labelActionLink(link, label, accessibleLabel) {
    if (link.querySelector(".snowmobile-action-label")) return;

    const icon = link.querySelector("img");
    if (icon) {
      icon.alt = "";
      icon.setAttribute("aria-hidden", "true");
      icon.removeAttribute("title");
    }

    const text = document.createElement("span");
    text.className = "snowmobile-action-label";
    text.textContent = label;
    link.append(text);
    link.classList.add("snowmobile-labeled-action");
    link.setAttribute("aria-label", accessibleLabel);
    link.title = accessibleLabel;
  }

  function labelPostMenuButton(button) {
    if (!button || button.querySelector(".snowmobile-action-label")) return;

    const label = document.createElement("span");
    label.className = "snowmobile-action-label";
    label.textContent = "More";
    button.replaceChildren(label);
    button.classList.add("snowmobile-post-menu-toggle");
    button.setAttribute("role", "button");
    button.setAttribute("tabindex", "0");
    button.setAttribute("aria-label", "More post options");
    button.title = "More post options";
    button.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      button.click();
    });
  }

  function actionLabel(link) {
    const target = `${link.href} ${link.title} ${link.querySelector("img")?.alt || ""}`.toLowerCase();
    if (/mode=edit|editpost/.test(target)) return "Edit";
    if (/mode=delete|deletepost/.test(target)) return "Delete";
    if (/mode=report|report\.php/.test(target)) return "Report";
    if (/mode=reply|posting\.php.*reply/.test(target)) return "Reply";
    if (/mode=quote|posting\.php.*quote/.test(target)) return "Quote";
    return "";
  }

  function enhancePostActions(actionCell, postInfo) {
    if (!actionCell) return;

    const permalink = actionCell.querySelector("a:has(> .post_link_landscape)");
    if (permalink) {
      const postId = new URL(permalink.href).hash.slice(1);
      labelActionLink(permalink, "Permalink", postId ? `Permalink to post ${postId}` : "Permalink to this post");

      const duplicateLink = postInfo?.querySelector("a[href]");
      if (duplicateLink && duplicateLink.href === permalink.href) {
        duplicateLink.remove();
        if (!postInfo.textContent.trim() && !postInfo.querySelector("*")) postInfo.remove();
      }
    }

    actionCell.querySelectorAll(".post_quote_landscape a").forEach((quoteLink) => {
      labelActionLink(quoteLink, "Quote", "Quote this post");
    });

    actionCell.querySelectorAll("a[href]").forEach((link) => {
      const label = actionLabel(link);
      if (label) labelActionLink(link, label, `${label} this post`);
    });

    postInfo?.querySelectorAll("a[href]").forEach((link) => {
      const label = actionLabel(link);
      if (label) labelActionLink(link, label, `${label} this post`);
    });
    labelPostMenuButton(postInfo?.querySelector(".expand_post_data"));
  }

  function enhancePosts() {
    const postRows = [...document.querySelectorAll("#pagebody .forumline .post_row")];

    postRows.forEach((postRow, index) => {
      const postRowElement = postRow.closest("tr");
      postRowElement?.classList.toggle("snowmobile-post-alt", index % 2 === 1);
      const posterInfo = postRowElement?.querySelector(".poster_info");
      if (!posterInfo || posterInfo.classList.contains("snowmobile-enhanced")) return;

      const postInfo = postRow.querySelector(".post_info");
      const actionCell = postRow.querySelector("#table3 td:has(.post_link_landscape)");
      if (postInfo && actionCell && !actionCell.contains(postInfo)) {
        postInfo.classList.add("snowmobile-post-menu");
        actionCell.append(postInfo);
      }
      enhancePostActions(actionCell, postInfo);

      const authorLink = posterInfo.querySelector('.menushell a[href*="profile.php?mode=viewprofile"]');
      const authorName = [...posterInfo.children].find((child) =>
        child.matches("span") &&
        !child.classList.contains("plusclick") &&
        !child.classList.contains("report_conditions"),
      );
      if (!authorName) return;

      // Guests sometimes get a plain "Poster: <b>name</b>" label instead of
      // the linked profile markup. Keep those posts in the same clean header.
      if (!authorLink) {
        const boldNames = [...authorName.querySelectorAll("b")]
          .map((element) => element.textContent.trim())
          .filter(Boolean);
        const plainName = boldNames.at(-1) || authorName.textContent.replace(/^\s*Poster:\s*/i, "").trim();
        authorName.replaceChildren(document.createTextNode(plainName));
        authorName.classList.add("snowmobile-plain-author");
      }

      const displayName = authorLink?.textContent.trim() || authorName.textContent.trim();
      const avatarToggle = posterInfo.querySelector(":scope > .expand_poster_data");
      if (avatarToggle && displayName) {
        const initials = displayName
          .split(/\s+/)
          .filter(Boolean)
          .slice(0, 2)
          .map((part) => part[0].toLocaleUpperCase())
          .join("");
        avatarToggle.replaceChildren(document.createTextNode(initials));
        avatarToggle.classList.add("snowmobile-avatar");
        avatarToggle.setAttribute("role", "button");
        avatarToggle.setAttribute("tabindex", "0");
        avatarToggle.setAttribute("aria-label", `Show ${displayName}'s profile details`);
        avatarToggle.title = `Show ${displayName}'s profile details`;
        avatarToggle.addEventListener("keydown", (event) => {
          if (event.key !== "Enter" && event.key !== " ") return;
          event.preventDefault();
          avatarToggle.click();
        });
      }

      const countText = [...posterInfo.querySelectorAll(":scope > .report_conditions:not(.post_date_portrait)")]
        .map((element) => element.textContent)
        .join(" ");
      const countMatch = countText.match(/Posts:\s*([\d,]+)/i);
      const details = document.createElement("div");
      details.className = "snowmobile-author-details";
      let postCount = "";
      if (countMatch) {
        const count = Number(countMatch[1].replaceAll(",", ""));
        postCount = `${count.toLocaleString()} ${count === 1 ? "post" : "posts"}`;
      }

      const author = document.createElement("div");
      author.className = "snowmobile-author";
      const nameLine = document.createElement("div");
      nameLine.className = "snowmobile-author-name";
      authorName.parentNode.insertBefore(author, authorName);
      author.append(nameLine);
      nameLine.append(authorName);

      const existingMemberLabel = posterInfo.querySelector(":scope > .report_conditionsRed");
      const memberLabel = existingMemberLabel?.textContent.trim();
      let memberBadge;
      if (memberLabel && /snowhead/i.test(memberLabel)) {
        memberBadge = document.createElement("span");
        memberBadge.className = "snowmobile-member-badge";
        if (/super-snowhead/i.test(memberLabel)) {
          memberBadge.classList.add("is-super-snowhead");
        } else if (/^snowhead$/i.test(memberLabel)) {
          memberBadge.classList.add("is-snowhead");
        }
        memberBadge.textContent = memberLabel;
      }

      const relativeDate = getRelativeDate(posterInfo);
      let relativeTimeLabel;
      if (relativeDate) {
        relativeTimeLabel = document.createElement("span");
        relativeTimeLabel.className = "snowmobile-relative-time";
        relativeTimeLabel.textContent = relativeDate;
        nameLine.append(relativeTimeLabel);
      }

      if (memberBadge) nameLine.append(memberBadge);
      if (postCount) details.append(document.createTextNode(postCount));
      if (details.hasChildNodes()) author.append(details);

      const originalDate = [...posterInfo.querySelectorAll(".post_date_portrait, .post_date_landscape")]
        .map((element) => element.textContent.trim())
        .filter(Boolean)
        .join(" ");
      if (originalDate && relativeTimeLabel) relativeTimeLabel.title = originalDate;
      posterInfo.classList.add("snowmobile-enhanced");
    });
  }

  function enhanceQuickReply() {
    const form = document.querySelector("#qr_form");
    const smileys = form?.querySelector('#wide_box > div:has(img[onclick*="insertAtCaret"])');
    if (!form) return;

    const textarea = form.querySelector("#quick_reply_text");
    if (textarea) textarea.setAttribute("aria-label", "Quick reply message");
    form.querySelector('input[name="post"][type="submit"]')?.classList.add("snowmobile-primary-submit");
    form.querySelector('input[name="preview"][type="submit"]')?.classList.add("snowmobile-secondary-submit");
    form.querySelector('input[name="quoteselected"][type="button"]')?.classList.add("snowmobile-quote-selected");

    if (!smileys || form.querySelector(".snowmobile-smilies-toggle")) return;

    smileys.classList.add("snowmobile-smilies");
    const toggle = document.createElement("button");
    toggle.className = "snowmobile-smilies-toggle";
    toggle.type = "button";
    toggle.setAttribute("aria-expanded", "false");
    toggle.textContent = "Show smileys";
    smileys.before(toggle);

    toggle.addEventListener("click", () => {
      const expanded = smileys.classList.toggle("is-expanded");
      toggle.setAttribute("aria-expanded", String(expanded));
      toggle.textContent = expanded ? "Hide smileys" : "Show smileys";
    });
  }

  function enhanceTopicActions() {
    document.querySelectorAll('a[href*="mode=newtopic"], a[href*="mode=reply"]').forEach((link) => {
      if (link.classList.contains("snowmobile-topic-action")) return;
      const label = link.href.includes("mode=newtopic") ? "New topic" : "Post reply";
      link.replaceChildren(document.createTextNode(label));
      link.classList.add("snowmobile-topic-action");
      link.setAttribute("aria-label", label);
      link.title = label;
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      enhancePosts();
      enhanceQuickReply();
      enhanceTopicActions();
      trackLastRead();
    }, { once: true });
  } else {
    enhancePosts();
    enhanceQuickReply();
    enhanceTopicActions();
    trackLastRead();
  }
})();

}
})();
