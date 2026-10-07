// ==UserScript==
// @name         SnowMobile
// @namespace    https://github.com/oferm/snowmobile-webextension
// @version      1.3.0.23
// @description  Make the Snowheads.com forum mobile-friendly
// @match        *://snowheads.com/*
// @updateURL    https://raw.githubusercontent.com/oferm/snowmobile-webextension/userscript/snowmobile.meta.js
// @downloadURL  https://raw.githubusercontent.com/oferm/snowmobile-webextension/userscript/snowmobile.user.js
// @grant        GM.addStyle
// @grant        GM_addStyle
// @run-at       document-idle
// ==/UserScript==

(() => {
  const routes = [{"style":"start","exact":["/","/index.php","/mx/index.php"]},{"style":"viewforum","pattern":"^/ski-forum/(?:viewforum|snow_reports)\\.php$"},{"style":"forumlist","exact":["/ski-forum/","/ski-forum/index.php"]},{"style":"viewtopic","exact":["/ski-forum/viewtopic.php"],"script":"viewtopic"}];
  const styles = {"start":"/* CSS for index.php and mx/index.php */\r\n/* regex: http:\\/\\/(www\\.)?snowheads.com\\/(mx\\/index.php)?((\\?.*)?)?; */\r\nbody > table:nth-child(3) > tbody:nth-child(1) > tr:nth-child(3) > td:nth-child(1) > div:nth-child(1) {\r\n    /* The top login box */\r\n    margin: inherit !important;\r\n}\r\n\r\nbody > div:nth-child(4) > div:nth-child(1) {\r\n    padding: 0 !important;\r\n}\r\n\r\nbody > div:nth-child(4) table tbody tr td {\r\n    display: flex;\r\n    flex-direction: column;\r\n    width: inherit !important;\r\n}\r\n\r\n.forumline {\r\n    width: 100%;\r\n    padding-top: 10px;\r\n    background-color: inherit;\r\n}\r\n\r\nbody > div:nth-child(4) > div:nth-child(2) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) {\r\n    display: flex;\r\n    flex-direction: column;\r\n}\r\n\r\nbody > div:nth-child(4) > div:nth-child(2) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(1) {\r\n    /* Ski Club 2.0 and left-side sections */\r\n    order: 2;\r\n}\r\n\r\nbody > div:nth-child(4) > div:nth-child(2) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(1) > table:nth-child(2) {\r\n    /* Ski Club 2.0 */\r\n    border: none;\r\n}\r\n\r\nbody > div:nth-child(4) > div:nth-child(2) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(1) > table:nth-child(2) td {\r\n    /* Ski Club 2.0 */\r\n    border: none;\r\n}\r\n\r\ntable.forumline:nth-child(3) {\r\n    /* Who is Online */\r\n    order: 3;\r\n}\r\n\r\ntable.forumline:nth-child(6) {\r\n    /* 2nd Hand */\r\n    order: 2;\r\n}\r\ntable.forumline:nth-child(6) > tbody:nth-child(1) > tr:nth-child(n+11),\r\nbody > div:nth-child(4) > div:nth-child(2) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(2) > table:nth-child(3) > tbody:nth-child(1) > tr:nth-child(n+16),\r\nbody > div:nth-child(4) > div:nth-child(2) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(2) > table:nth-child(2) > tbody:nth-child(1) > tr:nth-child(n+16){\r\n    /* only show 10 2nd hand links, hide the rest */\r\n    /* only show 15 Recent posts, hide the rest */\r\n    display: none;\r\n}\r\n.forumline .row1,\r\n.forumline .row2 {\r\n    background-color: #F5F5FF;\r\n    margin-top: 5px;\r\n}\r\n\r\n.forumline .genmed {\r\n    border: none !important;\r\n}\r\n\r\n.forumline .btnhov,\r\n.forumline .btnunhov {\r\n    background-color: #F5F5FF;\r\n    color: inherit;\r\n    margin-top: 5px;\r\n}\r\n\r\n.genmed img {\r\n    margin-right: 5px;\r\n}\r\n\r\n.thHead .cattitle {\r\n    color: #EEDD00;\r\n    font-weight: bold;\r\n}\r\nbody > div:nth-child(4) > div:nth-child(2) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(2) {\r\n    /* Recent posts */\r\n    order: 1;\r\n}\r\n\r\nbody > div:nth-child(4) > div:nth-child(2) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(3) {\r\n    /* About... */\r\n    order: 3;\r\n    margin-top: 10px;\r\n}","forumlist":"/* CSS for ski-forum/index.php */\r\n/* regex: http:\\/\\/(www\\.)?snowheads.com\\/ski-forum\\/(index.php(\\?.*)?)? */\r\nbody > div:nth-last-of-type(3) table table tr:first-child {\r\n\tdisplay: none;\r\n}\r\n\r\nbody > div:nth-last-of-type(3) table table tr td:nth-child(n+3) {\r\n\tdisplay: none;\r\n}\r\n\r\nbody > div:nth-last-of-type(3) table table tr td {\r\n    border-radius: 0 !important;\r\n}\r\n\r\nbody > table:nth-child(3) > tbody:nth-child(1) > tr:nth-child(3) > td:nth-child(1) > div:nth-child(1) {\r\n    /* The top login box */\r\n    margin: inherit !important;\r\n}\r\n\r\n.ycattitle {\r\n    display: flex;\r\n    justify-content: center;\r\n}\r\n\r\ntable .forum_block {\r\n    border: 0;\r\n}\r\n\r\ntable .forum_block:hover {\r\n    background-color: inherit;\r\n    color: inherit;\r\n    border: 0;\r\n    padding: 3px 3px 3px 10px;\r\n}","viewforum":"/* CSS for viewforum.php and snow_reports.php */\r\n/* regex:Ö http:\\/\\/(www\\.)?snowheads.com\\/ski-forum\\/((viewforum.php|snow_reports.php)(\\?.*)?)?; */\r\nbody > table:nth-child(3) > tbody:nth-child(1) > tr:nth-child(3) > td:nth-child(1) > div:nth-child(1) {\r\n    /* The top login box */\r\n    margin: inherit !important;\r\n}\r\n\r\nbody > div:nth-last-of-type(3) .forumline {\r\n    display: flex;\r\n    flex-direction: column;\r\n    padding: 0 5px;\r\n}\r\n\r\nbody > div:nth-last-of-type(3) .forumline tr {\r\n    display: flex;\r\n    flex-wrap: wrap;\r\n    padding-top: 5px;\r\n}\r\n\r\nbody > div:nth-last-of-type(3) .forumline .gensmall {\r\n    display: none;\r\n}\r\n\r\nbody > div:nth-last-of-type(3) .forumline tr .row1,\r\nbody > div:nth-last-of-type(3) .forumline tr .row2,\r\nbody > div:nth-last-of-type(3) .forumline tr .row3Right {\r\n    background-color: #F5F5FF;\r\n    display: flex;\r\n    flex-grow: 1;\r\n}\r\n\r\nbody > div:nth-last-of-type(3) .forumline tr .row2 {\r\n    display: flex;\r\n    justify-content: flex-end;\r\n    order: 4;\r\n    flex-grow: 1;\r\n}\r\n\r\nbody > div:nth-last-of-type(3) .forumline tr:first-child th:nth-child(n + 2) {\r\n    display: none;\r\n}\r\n\r\nbody > div:nth-last-of-type(3) .forumline th.thCornerL {\r\n    border-width: 0;\r\n}\r\n\r\nbody > div:nth-last-of-type(3) .forumline .row2 .postdetails {\r\n    /* View count should not be visible */\r\n    color: #F5F5FF;\r\n    font-size: 0;\r\n}\r\n\r\nbody > div:nth-last-of-type(3) .forumline .row2 .postdetails b {\r\n    /* But post count should be visible! */\r\n    color: #7777AA;\r\n    display: flex;\r\n    font-size: 9px;\r\n}\r\n\r\nbody > div:nth-last-of-type(3) .forumline .row3Right .postdetails {\r\n    color: #F5F5FF;\r\n    font-size: 0;\r\n}\r\nbody > div:nth-last-of-type(3) .forumline .row3Right .postdetails div:first-child {\r\n\t/* Post Creator */\r\n    display: none !important;\r\n}\r\nbody > div:nth-last-of-type(3) .forumline .row3Right .postdetails div {\r\n    color: #7777AA;\r\n    font-size: 9px;\r\n}\r\n\r\nbody > div:nth-last-of-type(3) .forumline .row3Right .postdetails div:nth-child(2)::after {\r\n\t/* Last poster */\r\n    font-size: 9px;\r\n    color: #7777AA;\r\n    content: \",\";\r\n}   \r\n\r\nbody > div:nth-last-of-type(3) .forumline .row2 .postdetails b::after {\r\n    display: flex;\r\n    margin-left: 5px;\r\n    width: 15px;\r\n    height: 15px;\r\n    content: \"\";\r\n\tbackground-image: url(\"data:image/svg+xml;charset=utf8,%3C?xml version='1.0' encoding='UTF-8'?%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3Csvg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' version='1.1' width='15' height='15' viewBox='0 0 24 24'%3E%3Cpath d='M20,2H4A2,2 0 0,0 2,4V22L6,18H20A2,2 0 0,0 22,16V4A2,2 0 0,0 20,2M6,9H18V11H6M14,14H6V12H14M18,8H6V6H18' /%3E%3C/svg%3E\");\r\n\r\n}\r\n\r\nbody > div:nth-last-of-type(3) .nav {\r\n    display: flex;\r\n    flex-direction: column;\r\n}\r\n\r\nbody > div:nth-last-of-type(3) > table:nth-child(3) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(2) > table:nth-child(2) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(2) > div:nth-child(2) > span:nth-child(1) {\r\n    /* Page 1, 2, 3 at the bottom */\r\n    flex-direction: row;\r\n}\r\n\r\nbody > div:nth-last-of-type(3) .forumline tr:nth-child(n + 2) td:first-child {\r\n    display: none;\r\n}\r\nbody > div:nth-last-of-type(3) table:nth-child(3) tr:nth-child(2) td:first-child {\r\n    display: none;\r\n}","viewtopic":"/* CSS for viewtopic.php */\r\n/* regex: http:\\/\\/(www\\.)?snowheads.com\\/ski-forum\\/(viewtopic.php(\\?.*)?); */\r\nbody > table:nth-child(3) > tbody:nth-child(1) > tr:nth-child(3) > td:nth-child(1) > div:nth-child(1) {\r\n    /* The top login box */\r\n    margin: inherit !important;\r\n}\r\n\r\nbody > table:nth-child(3) > tbody:nth-child(1) > tr:nth-child(3) > td:nth-child(1) > div:nth-child(1) {\r\n \r\n    margin: inherit !important;\r\n}\r\n\r\n#table3 .message_cell {\r\n    max-width: 90vw;\r\n}\r\n\r\n.forumline > tbody > tr > td {\n    display: block;\n    width: 100%;\n}\n\n/* The post cells have a legacy height=\"3\" attribute. With the block-cell\n   mobile layout, height:100% collapses each table row to its poster height,\n   letting later posts overlap the previous post's content. */\n.forumline > tbody > tr > td:not(.name) {\n    height: auto !important;\n}\n\n.forumline .row1,\n.forumline .row2 {\n    height: 100%;\r\n}\r\n.forumline .poster_info {\r\n    display: flex !important;\r\n    padding-bottom: 10px;\r\n    padding-top: 5px;\r\n    margin-left: 10px;\r\n}\r\n.forumline .poster_info .plusclick {\r\n    margin-right: 5px;\r\n}\r\n.forumline .poster_info span {\r\n    display: flex;\r\n}\r\n.forumline .poster_info font {\r\n    display: flex;\r\n}\r\n.forumline .poster_info .report_conditions:not(.post_date_portrait) {\r\n    display: none;\r\n}\r\n.forumline .poster_info .report_conditionsRed {\r\n    /* e.g. freerider, user, super-snowhead */\r\n    \r\n    display: none;\r\n}\r\n.forumline .poster_info .report_conditions.post_date_portrait {\r\n    display: flex;\r\n    \r\n    /* remove bold HH:MM */\r\n    font-weight: normal !important;\r\n    padding-right: 5px;\r\n}\r\n.forumline .poster_info .report_conditions.post_date_portrait br {\r\n    display: none;\r\n}\r\n\r\n.forumline .post_row #table3 > tbody > tr > td:not(.quote) {\n    border-left: none !important;\r\n    position: inherit !important;\r\n    display: block;\r\n    width: 100% !important;\r\n    max-width: 100% !important;\r\n}\r\n\r\n.forumline td.row1,\r\n.forumline td.row2 {\r\n    background-color: #F5F5FF;\r\n}\r\n#table2 .forumline .row1,\r\n#table2 .forumline .row2 {\r\n    /* Aligns the poster_info and the post */\r\n    \r\n    border: none !important;\r\n}\r\n.post_info .plusclick {\n    display: flex;\n}\n.post_date_portrait {\r\n    background-color: inherit;\r\n}\r\n.postbody {\r\n    font-size: 0.8em;\r\n}\r\n.post_info {\n    position: static !important;\n    display: block !important;\n    width: 100% !important;\n    margin: 4px 0 0 !important;\n    padding-right: 8px;\n    box-sizing: border-box;\n    text-align: right;\n    /* Keep the expand icon on the same visual row as post-link and quote. */\n    transform: translateY(14px);\n}\n.post_info div {\n    float: inherit !important;\n    position: inherit !important;\n    margin-top: 0;\n}\n.forumline #post_row.post_row table#table3 tbody tr td a img {\n    width: 18px !important;\n    height: 14px !important;\n    padding: 0 !important;\n    vertical-align: middle;\n}\n.forumline #post_row.post_row table#table3 tbody tr td:has(.post_link_landscape) {\n    white-space: nowrap;\n}\n.forumline #post_row.post_row .post_link_landscape,\n.forumline #post_row.post_row .post_quote_landscape {\n    display: inline-flex !important;\n    align-items: center;\n    vertical-align: middle;\n    margin: 0 0 0 4px !important;\n    padding: 0 !important;\n    white-space: nowrap;\n}\n.forumline #post_row.post_row .post_quote_landscape {\n    margin-right: 12px !important;\n    transform: translateY(-3px);\n}\n.forumline #post_row.post_row .post_quote_landscape img {\n    transform: translateY(-2px);\n}\n.forumline #post_row.post_row .post_link_landscape {\n    transform: translateY(-3px);\n}\n.forumline tbody tr td.row1 form {\r\n    background: none !important;\r\n    width: auto !important;\r\n}\r\n\r\n.quote {\n    overflow: hidden;\n}\n\n@media (max-width: 1200px) {\n    /* Keep the post date beside its author instead of in the distant landscape action column. */\n    #pagebody .forumline > tbody > tr > td.name {\n        box-sizing: border-box;\n        width: 100% !important;\n        min-width: 0 !important;\n        max-width: 100% !important;\n    }\n\n    #pagebody .forumline .poster_info {\n        align-items: center;\n        background-color: #ECECFF;\n        border-bottom: 1px solid #D2D2EE;\n        box-sizing: border-box;\n        flex-wrap: wrap;\n        gap: 6px;\n        margin: 0;\n        padding: 6px 10px;\n        width: 100%;\n    }\n\n    #pagebody .forumline .poster_info > span:not(.plusclick):not(.report_conditions) {\n        flex: 0 1 auto;\n    }\n\n    #pagebody .forumline .poster_info .post_date_portrait {\n        background: transparent !important;\n        color: #7777AA !important;\n        display: flex !important;\n        font-size: 10px !important;\n        padding: 0 !important;\n    }\n\n    #pagebody .forumline .post_date_landscape {\n        display: none !important;\n    }\n\n    #pagebody .forumline .poster_info.snowmobile-enhanced {\n        align-items: start;\n        background: #fff;\n        border-bottom: 0;\n        column-gap: 8px;\n        display: grid !important;\n        grid-template-columns: auto minmax(0, 1fr);\n        padding: 10px 10px 0;\n    }\n\n    #pagebody .forumline .poster_info.snowmobile-enhanced .expand_poster_data {\n        grid-column: 1;\n        grid-row: 1 / 3;\n        margin: 2px 0 0;\n    }\n\n    #pagebody .forumline .poster_info.snowmobile-enhanced .snowmobile-author {\n        grid-column: 2;\n        min-width: 0;\n    }\n\n    #pagebody .forumline .poster_info.snowmobile-enhanced .snowmobile-author-name {\n        align-items: center;\n        display: flex;\n        flex-wrap: wrap;\n        gap: 7px;\n        line-height: 1.25;\n    }\n\n    #pagebody .forumline .poster_info.snowmobile-enhanced .snowmobile-author-name > span {\n        margin: 0 !important;\n        white-space: normal !important;\n    }\n\n    #pagebody .forumline .poster_info.snowmobile-enhanced .snowmobile-author-name a {\n        font-size: 16px;\n        font-weight: 600;\n    }\n\n    #pagebody .forumline .poster_info.snowmobile-enhanced .snowmobile-member-badge {\n        background: #f1f0ed;\n        border-radius: 5px;\n        color: #57534b;\n        font-size: 11px;\n        font-weight: 600;\n        line-height: 1;\n        padding: 5px 7px;\n    }\n\n    #pagebody .forumline .poster_info.snowmobile-enhanced .snowmobile-member-badge.is-snowhead {\n        background: #eaf2eb;\n        color: #3f6848;\n    }\n\n    #pagebody .forumline .poster_info.snowmobile-enhanced .snowmobile-member-badge.is-super-snowhead {\n        background: #fff0df;\n        color: #a65309;\n    }\n\n    #pagebody .forumline .poster_info.snowmobile-enhanced .snowmobile-relative-time {\n        color: #686868;\n        font-size: 12px;\n        white-space: nowrap !important;\n    }\n\n    #pagebody .forumline .poster_info.snowmobile-enhanced .snowmobile-author-details {\n        align-items: center;\n        color: #575757;\n        display: flex;\n        font-size: 13px;\n        flex-wrap: wrap;\n        gap: 7px;\n        line-height: 1.4;\n        margin-top: 3px;\n    }\n\n    #pagebody .forumline .poster_info.snowmobile-enhanced .post_date_portrait,\n    #pagebody .forumline .poster_info.snowmobile-enhanced .post_date_landscape {\n        display: none !important;\n    }\n}\n\n@media (max-width: 600px) {\n    /* The legacy header's right-hand link table forces the page wider than a phone. */\n    body > table:first-of-type > tbody > tr:first-child > td:nth-child(2) {\n        display: none !important;\n    }\n\n    #page_head_Xport img {\n        max-width: 100% !important;\n        height: auto !important;\n    }\n\n    /* Account for cell padding in the post table's 100% widths. */\n    #pagebody .forumline {\n        width: calc(100vw - 28px) !important;\n        max-width: calc(100vw - 28px) !important;\n        table-layout: fixed !important;\n    }\n\n    .forumline > tbody > tr > td {\n        box-sizing: border-box;\n    }\n\n    #pagebody .forumline #table3 .message_cell {\n        box-sizing: border-box !important;\n        width: 90vw !important;\n        max-width: 90vw !important;\n    }\n\n    .postbody,\n    .postbody * {\n        overflow-wrap: anywhere !important;\n        word-break: break-word !important;\n    }\n\n    /* Long quoted URLs otherwise get clipped by the existing .quote overflow rule. */\n    .quote,\n    .quote * {\n        overflow-wrap: anywhere !important;\n        word-break: break-word !important;\n    }\n}\n"};
  const pathname = window.location.pathname;
  const route = routes.find(({ exact, pattern }) =>
    exact ? exact.includes(pathname) : new RegExp(pattern).test(pathname),
  );
  const css = route ? styles[route.style] : null;

  if (!css) return;
  if (typeof GM_addStyle === "function") {
    GM_addStyle(css);
  } else if (typeof GM !== "undefined" && typeof GM.addStyle === "function") {
    GM.addStyle(css);
  } else {
    const style = document.createElement("style");
    style.textContent = css;
    (document.head || document.documentElement).appendChild(style);
  }

  if (route.script === "viewtopic") {
(() => {
  "use strict";

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

  function enhancePosts() {
    const postRows = [...document.querySelectorAll("#pagebody .forumline .post_row")];

    postRows.forEach((postRow) => {
      const posterInfo = postRow.closest("tr")?.querySelector(".poster_info");
      if (!posterInfo || posterInfo.classList.contains("snowmobile-enhanced")) return;

      const authorLink = posterInfo.querySelector('.menushell a[href*="profile.php?mode=viewprofile"]');
      const authorName = [...posterInfo.children].find((child) =>
        child.matches("span") &&
        !child.classList.contains("plusclick") &&
        !child.classList.contains("report_conditions"),
      );
      if (!authorLink || !authorName) return;

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

      if (memberBadge) details.append(memberBadge);
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

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", enhancePosts, { once: true });
  } else {
    enhancePosts();
  }
})();

}
})();
