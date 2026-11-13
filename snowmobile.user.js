// ==UserScript==
// @name         SnowMobile
// @namespace    https://github.com/oferm/snowmobile-webextension
// @version      1.3.0.32
// @description  Make the Snowheads.com forum mobile-friendly
// @match        *://snowheads.com/*
// @match        *://www.snowheads.com/*
// @updateURL    https://raw.githubusercontent.com/oferm/snowmobile-webextension/userscript/snowmobile.meta.js
// @downloadURL  https://raw.githubusercontent.com/oferm/snowmobile-webextension/userscript/snowmobile.user.js
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(() => {
  const routes = [{"style":"start","exact":["/","/index.php","/mx/index.php"],"script":"start"},{"style":"viewforum","pattern":"^/ski-forum/(?:viewforum|snow_reports)\\.php$","script":"viewforum"},{"style":"forumlist","exact":["/ski-forum/","/ski-forum/index.php"]},{"style":"viewtopic","exact":["/ski-forum/viewtopic.php"],"script":"viewtopic"}];
  const styles = {"start":"/* CSS for index.php and mx/index.php */\n/* regex: http:\\/\\/(www\\.)?snowheads.com\\/(mx\\/index.php)?((\\?.*)?)?; */\nbody > table:nth-child(3) > tbody:nth-child(1) > tr:nth-child(3) > td:nth-child(1) > div:nth-child(1) {\n    /* The top login box */\n    margin: inherit !important;\n}\n\nbody {\n    background: #f2f4f7 !important;\n    color: #263442;\n    font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif !important;\n}\n\n.snowmobile-home-root {\n    box-sizing: border-box;\n    max-width: 100%;\n    width: 100%;\n}\n\n.snowmobile-home-root > .snowmobile-home-inner {\n    box-sizing: border-box;\n    max-width: 100%;\n    padding: 0 !important;\n    width: 100% !important;\n}\n\n.snowmobile-home-root .forumline {\n    background-color: #fff;\n    box-sizing: border-box;\n    max-width: 100%;\n    border: 0 !important;\n    border-radius: 14px;\n    box-shadow: 0 2px 12px rgba(28, 44, 60, 0.08);\n    margin-bottom: 12px;\n    overflow: hidden;\n    width: 100% !important;\n}\n\n.snowmobile-home-layout {\n    border-spacing: 0 !important;\n    display: block;\n    max-width: 100% !important;\n    table-layout: fixed !important;\n    width: 100% !important;\n}\n\n.snowmobile-home-layout > tbody {\n    display: block;\n    width: 100%;\n}\n\n.snowmobile-home-layout > tbody > tr {\n    display: flex !important;\n    flex-direction: column;\n    width: 100%;\n}\n\n.snowmobile-home-layout > tbody > tr > td {\n    box-sizing: border-box;\n    display: flex !important;\n    flex-direction: column;\n    max-width: 100% !important;\n    min-width: 0;\n    padding: 0 8px;\n    width: 100% !important;\n}\n\n.snowmobile-home-layout > tbody > tr > td:first-child {\n    order: 2;\n}\n\n.snowmobile-home-layout > tbody > tr > td:nth-child(2) {\n    order: 1;\n}\n\n.snowmobile-home-layout > tbody > tr > td:nth-child(3) {\n    order: 3;\n}\n\n.snowmobile-home-layout .forumline .row1,\n.snowmobile-home-layout .forumline .row2 {\n    background-color: #fff !important;\n    margin-top: 0;\n}\n\n.snowmobile-home-layout .forumline td {\n    background-color: #fff !important;\n}\n\n.snowmobile-home-layout .forumline .genmed {\n    border: none !important;\n}\n\n.snowmobile-home-layout .forumline .btnhov,\n.snowmobile-home-layout .forumline .btnunhov {\n    background-color: #fff;\n    color: inherit;\n    margin-top: 0;\n}\n\n.snowmobile-home-layout .genmed img {\n    margin-right: 5px;\n}\n\n.snowmobile-home-layout .thHead .cattitle {\n    color: #263442 !important;\n    font-weight: 650;\n}\n\n.snowmobile-home-layout .forumline > tbody > tr > th,\n.snowmobile-home-layout .forumline > tbody > tr:first-child > th {\n    background: #fff !important;\n    background-image: none !important;\n    border: 0 !important;\n    border-bottom: 1px solid #e3e8ed !important;\n    color: #263442 !important;\n    font-size: 16px;\n    font-weight: 650;\n    padding: 9px 10px !important;\n    text-align: left !important;\n}\n\n.snowmobile-home-layout .forumline th a.cattitle {\n    color: #263442 !important;\n    font-size: inherit;\n    font-weight: inherit;\n    text-decoration: none;\n}\n\n.snowmobile-home-layout .snowmobile-recent-posts {\n    order: 1;\n}\n\n.snowmobile-home-layout .snowmobile-welcome {\n    order: 2;\n}\n\n.snowmobile-home-layout .snowmobile-online {\n    order: 3;\n}\n\n.snowmobile-home-layout .snowmobile-market-posts {\n    order: 2;\n}\n\n.snowmobile-home-layout .snowmobile-recent-posts tr:nth-child(n + 17),\n.snowmobile-home-layout .snowmobile-market-posts tr:nth-child(n + 12) {\n    display: none !important;\n}\n\n.snowmobile-home-layout .snowmobile-online .gensmall {\n    color: #44445A;\n    display: inline-block;\n    font-size: 13px;\n    line-height: 1.5;\n    overflow-wrap: anywhere;\n}\n\n.snowmobile-home-layout .snowmobile-online .gensmall a {\n    font-size: 12px;\n}\n\n.snowmobile-home-layout .snowmobile-recent-posts td.row1,\n.snowmobile-home-layout .snowmobile-recent-posts td.row2 {\n    border-bottom: 1px solid #e3e8ed !important;\n    padding: 12px 10px !important;\n}\n\n.snowmobile-home-layout .snowmobile-recent-posts tr:last-child > td {\n    border-bottom: 0 !important;\n}\n\n.snowmobile-home-layout .snowmobile-recent-posts td.row1 > div,\n.snowmobile-home-layout .snowmobile-recent-posts td.row2 > div {\n    display: flex !important;\n    flex-direction: column;\n    gap: 4px;\n    margin: 0 !important;\n    width: 100% !important;\n}\n\n.snowmobile-home-layout .snowmobile-recent-posts td.row1 > div > div:first-child,\n.snowmobile-home-layout .snowmobile-recent-posts td.row2 > div > div:first-child {\n    display: flex !important;\n    flex-direction: column;\n    float: none !important;\n    width: 100%;\n}\n\n.snowmobile-home-layout .snowmobile-recent-posts td.row1 > div > div:first-child b,\n.snowmobile-home-layout .snowmobile-recent-posts td.row2 > div > div:first-child b {\n    display: block;\n    line-height: 1.3;\n}\n\n.snowmobile-home-layout .snowmobile-recent-posts td.row1 > div > div:first-child b a,\n.snowmobile-home-layout .snowmobile-recent-posts td.row2 > div > div:first-child b a {\n    color: #006699 !important;\n    font-size: 14px;\n    font-weight: 600;\n}\n\n.snowmobile-home-layout .snowmobile-recent-posts td.row1 > div > div:first-child > span,\n.snowmobile-home-layout .snowmobile-recent-posts td.row2 > div > div:first-child > span {\n    display: none;\n}\n\n.snowmobile-home-layout .snowmobile-recent-meta {\n    align-items: center;\n    color: #59636f;\n    display: flex;\n    flex-wrap: wrap;\n    font-size: 12px;\n    gap: 6px;\n    line-height: 1.4;\n}\n\n.snowmobile-home-layout .snowmobile-recent-meta a {\n    color: #59636f;\n    font-size: 12px;\n}\n\n.snowmobile-home-layout .snowmobile-recent-meta time {\n    color: #59636f;\n    white-space: nowrap;\n}\n\n.snowmobile-home-layout .snowmobile-recent-meta.has-forum time::before {\n    color: #8a929b;\n    content: \"·\";\n    margin-right: 6px;\n}\n\n.snowmobile-home-layout .snowmobile-recent-posts td br,\n.snowmobile-home-layout .snowmobile-market-posts td br {\n    display: none !important;\n}\n\n.snowmobile-home-layout .snowmobile-market-posts td.row1,\n.snowmobile-home-layout .snowmobile-market-posts td.row2 {\n    border-bottom: 1px solid #e3e8ed !important;\n    padding: 12px 10px !important;\n}\n\n.snowmobile-home-layout .snowmobile-market-posts tr:last-child > td {\n    border-bottom: 0 !important;\n}\n\n.snowmobile-home-layout .snowmobile-market-posts td.row1 > div,\n.snowmobile-home-layout .snowmobile-market-posts td.row2 > div {\n    display: flex !important;\n    flex-direction: column;\n    gap: 4px;\n    width: 100% !important;\n}\n\n.snowmobile-home-layout .snowmobile-market-posts td.row1 > div > div:first-child,\n.snowmobile-home-layout .snowmobile-market-posts td.row2 > div > div:first-child {\n    float: none !important;\n    line-height: 1.3;\n    margin: 0 !important;\n    width: 100%;\n}\n\n.snowmobile-home-layout .snowmobile-market-posts td.row1 > div > div:first-child b a,\n.snowmobile-home-layout .snowmobile-market-posts td.row2 > div > div:first-child b a {\n    color: #006699 !important;\n    font-size: 14px;\n    font-weight: 600;\n}\n\n.snowmobile-home-layout .snowmobile-market-posts td.row1 > div > div:nth-child(2),\n.snowmobile-home-layout .snowmobile-market-posts td.row2 > div > div:nth-child(2) {\n    color: #59636f;\n    float: none !important;\n    font-size: 12px;\n    margin: 0 !important;\n    text-align: left !important;\n}\n\n.snowmobile-home-layout .snowmobile-market-posts .gensmall {\n    color: #59636f !important;\n    font-size: 12px;\n}\n\n.snowmobile-home-layout .snowmobile-aside-column > table {\n    max-width: 100% !important;\n    width: 100% !important;\n}\n\n.snowmobile-home-layout .snowmobile-aside-column img {\n    display: block;\n    height: auto !important;\n    margin-left: auto;\n    margin-right: auto;\n    max-width: min(100%, 220px) !important;\n}\n\n.snowmobile-home-layout .snowmobile-aside-column td {\n    box-sizing: border-box;\n    max-width: 100%;\n    overflow-wrap: anywhere;\n}\n","forumlist":"/* CSS for ski-forum/index.php */\r\n/* regex: http:\\/\\/(www\\.)?snowheads.com\\/ski-forum\\/(index.php(\\?.*)?)? */\r\nbody > div:nth-last-of-type(3) table table tr:first-child {\r\n\tdisplay: none;\r\n}\r\n\r\nbody > div:nth-last-of-type(3) table table tr td:nth-child(n+3) {\r\n\tdisplay: none;\r\n}\r\n\r\nbody > div:nth-last-of-type(3) table table tr td {\r\n    border-radius: 0 !important;\r\n}\r\n\r\nbody > table:nth-child(3) > tbody:nth-child(1) > tr:nth-child(3) > td:nth-child(1) > div:nth-child(1) {\r\n    /* The top login box */\r\n    margin: inherit !important;\r\n}\r\n\r\n.ycattitle {\r\n    display: flex;\r\n    justify-content: center;\r\n}\r\n\r\ntable .forum_block {\n    border: 0;\n    box-sizing: border-box;\n    display: flex;\n    flex-direction: column;\n    gap: 4px;\n    padding: 10px 12px;\n}\n\n@media (max-width: 600px) {\n    #menu_container {\n        max-width: 100vw !important;\n        right: 0 !important;\n    }\n\n    #menu_container > table {\n        height: 84px !important;\n        margin: 0 !important;\n        max-width: 100vw !important;\n    }\n\n    #menu_container > table > tbody > tr > td:last-child {\n        box-sizing: border-box;\n        padding: 4px 6px !important;\n    }\n\n    #menu_container > table > tbody > tr > td:last-child > div[style*=\"width:200px\"] {\n        display: block !important;\n        left: auto !important;\n        width: 200px !important;\n    }\n\n    #menu_container > table > tbody > tr > td:last-child > div[style*=\"width:200px\"] > a {\n        box-sizing: border-box;\n        display: block !important;\n        line-height: 1.2;\n        margin: 1px 0;\n        min-height: 26px;\n        overflow-wrap: anywhere;\n        padding: 2px 4px;\n        white-space: normal !important;\n    }\n\n    #menu_container > table > tbody > tr > td:last-child > div:first-child > a {\n        display: block;\n        min-height: 24px;\n    }\n\n    #menu_container .menuitem {\n        font-size: 12px !important;\n        line-height: 1.2;\n        padding: 3px 4px;\n    }\n}\n\r\ntable .forum_block:hover {\r\n    background-color: inherit;\r\n    color: inherit;\r\n    border: 0;\r\n    padding: 10px 12px;\n}\n\ntable .forum_block h1 {\n    align-items: center;\n    display: flex !important;\n    line-height: 1.3;\n    margin: 0 !important;\n    min-width: 0;\n    padding: 0 !important;\n}\n\ntable .forum_block h1 img {\n    height: 16px !important;\n    margin-right: 8px;\n    position: static !important;\n    width: 16px;\n}\n\ntable .forum_block h1 a {\n    min-width: 0;\n}\n\ntable .forum_block .forumlink {\n    font-size: 18px !important;\n    font-weight: 600;\n}\n\ntable .forum_block h2 {\n    display: block !important;\n    line-height: 1.35;\n    margin: 0 !important;\n    min-width: 0;\n}\n\ntable .forum_block .fdesc {\n    color: #66667A !important;\n    display: -webkit-box;\n    font-size: 14px;\n    line-height: 1.35;\n    overflow: hidden;\n    -webkit-box-orient: vertical;\n    -webkit-line-clamp: 2;\n}\n\ntable .forum_block h2 marquee {\n    display: none;\n}\n\n@media (max-width: 600px) {\n    body > table:first-of-type {\n        margin-left: -8px !important;\n        max-width: 100vw !important;\n        table-layout: fixed !important;\n        width: 100vw !important;\n    }\n\n    body > table:first-of-type > tbody > tr:first-child > td {\n        box-sizing: border-box;\n        max-width: 100%;\n        overflow: hidden;\n        vertical-align: middle;\n    }\n\n    body > table:first-of-type > tbody > tr:first-child > td:first-child {\n        width: 70% !important;\n    }\n\n    body > table:first-of-type > tbody > tr:first-child > td:nth-child(2) {\n        text-align: right;\n        white-space: normal;\n        width: 30% !important;\n    }\n\n    body > table:first-of-type > tbody > tr:first-child > td:nth-child(2) a {\n        align-items: center;\n        display: inline-flex;\n        font-size: 12px;\n        line-height: 1.2;\n        margin-left: 3px;\n        min-height: 30px;\n        padding: 2px;\n        white-space: normal;\n    }\n\n    body > table:first-of-type > tbody > tr:first-child > td:first-child img {\n        height: auto !important;\n        max-width: 100% !important;\n    }\n\n    table .forum_block {\n        background: #F5F5FF;\n        border-bottom: 3px solid #fff;\n        min-height: 64px;\n    }\n}\n","viewforum":"/* CSS for viewforum.php and snow_reports.php */\r\n/* regex:Ö http:\\/\\/(www\\.)?snowheads.com\\/ski-forum\\/((viewforum.php|snow_reports.php)(\\?.*)?)?; */\r\nbody > table:nth-child(3) > tbody:nth-child(1) > tr:nth-child(3) > td:nth-child(1) > div:nth-child(1) {\r\n    /* The top login box */\r\n    margin: inherit !important;\r\n}\r\n\r\nbody > div:nth-last-of-type(3) .forumline {\r\n    display: flex;\r\n    flex-direction: column;\r\n    padding: 0 5px;\r\n}\r\n\r\nbody > div:nth-last-of-type(3) .forumline tr {\r\n    display: flex;\r\n    flex-wrap: wrap;\r\n    padding-top: 5px;\r\n}\r\n\r\nbody > div:nth-last-of-type(3) .forumline .gensmall {\r\n    display: none;\r\n}\r\n\r\nbody > div:nth-last-of-type(3) .forumline tr .row1,\r\nbody > div:nth-last-of-type(3) .forumline tr .row2,\r\nbody > div:nth-last-of-type(3) .forumline tr .row3Right {\r\n    background-color: #F5F5FF;\r\n    display: flex;\r\n    flex-grow: 1;\r\n}\r\n\r\nbody > div:nth-last-of-type(3) .forumline tr .row2 {\r\n    display: flex;\r\n    justify-content: flex-end;\r\n    order: 4;\r\n    flex-grow: 1;\r\n}\r\n\r\nbody > div:nth-last-of-type(3) .forumline tr:first-child th:nth-child(n + 2) {\r\n    display: none;\r\n}\r\n\r\nbody > div:nth-last-of-type(3) .forumline th.thCornerL {\r\n    border-width: 0;\r\n}\r\n\r\nbody > div:nth-last-of-type(3) .forumline .row2 .postdetails {\r\n    /* View count should not be visible */\r\n    color: #F5F5FF;\r\n    font-size: 0;\r\n}\r\n\r\nbody > div:nth-last-of-type(3) .forumline .row2 .postdetails b {\r\n    /* But post count should be visible! */\r\n    color: #7777AA;\r\n    display: flex;\r\n    font-size: 9px;\r\n}\r\n\r\nbody > div:nth-last-of-type(3) .forumline .row3Right .postdetails {\r\n    color: #F5F5FF;\r\n    font-size: 0;\r\n}\r\nbody > div:nth-last-of-type(3) .forumline .row3Right .postdetails div:first-child {\r\n\t/* Post Creator */\r\n    display: none !important;\r\n}\r\nbody > div:nth-last-of-type(3) .forumline .row3Right .postdetails div {\r\n    color: #7777AA;\r\n    font-size: 9px;\r\n}\r\n\r\nbody > div:nth-last-of-type(3) .forumline .row3Right .postdetails div:nth-child(2)::after {\r\n\t/* Last poster */\r\n    font-size: 9px;\r\n    color: #7777AA;\r\n    content: \",\";\r\n}   \r\n\r\nbody > div:nth-last-of-type(3) .forumline .row2 .postdetails b::after {\r\n    display: flex;\r\n    margin-left: 5px;\r\n    width: 15px;\r\n    height: 15px;\r\n    content: \"\";\r\n\tbackground-image: url(\"data:image/svg+xml;charset=utf8,%3C?xml version='1.0' encoding='UTF-8'?%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3Csvg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' version='1.1' width='15' height='15' viewBox='0 0 24 24'%3E%3Cpath d='M20,2H4A2,2 0 0,0 2,4V22L6,18H20A2,2 0 0,0 22,16V4A2,2 0 0,0 20,2M6,9H18V11H6M14,14H6V12H14M18,8H6V6H18' /%3E%3C/svg%3E\");\r\n\r\n}\r\n\r\nbody > div:nth-last-of-type(3) .nav {\r\n    display: flex;\r\n    flex-direction: column;\r\n}\r\n\r\nbody > div:nth-last-of-type(3) > table:nth-child(3) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(2) > table:nth-child(2) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(2) > div:nth-child(2) > span:nth-child(1) {\r\n    /* Page 1, 2, 3 at the bottom */\r\n    flex-direction: row;\r\n}\r\n\r\nbody > div:nth-last-of-type(3) .forumline tr:nth-child(n + 2) td:first-child {\r\n    display: none;\r\n}\r\nbody > div:nth-last-of-type(3) table:nth-child(3) tr:nth-child(2) td:first-child {\n    display: none;\n}\n\n@media (max-width: 600px) {\n    #menu_container {\n        max-width: 100vw !important;\n        right: 0 !important;\n    }\n\n    #menu_container > table {\n        height: 84px !important;\n        margin: 0 !important;\n        max-width: 100vw !important;\n    }\n\n    #menu_container > table > tbody > tr > td:last-child {\n        box-sizing: border-box;\n        padding: 4px 6px !important;\n    }\n\n    #menu_container > table > tbody > tr > td:last-child > div[style*=\"width:200px\"] {\n        display: block !important;\n        left: auto !important;\n        width: 200px !important;\n    }\n\n    #menu_container > table > tbody > tr > td:last-child > div[style*=\"width:200px\"] > a {\n        box-sizing: border-box;\n        display: block !important;\n        line-height: 1.2;\n        margin: 1px 0;\n        min-height: 26px;\n        overflow-wrap: anywhere;\n        padding: 2px 4px;\n        white-space: normal !important;\n    }\n\n    #menu_container > table > tbody > tr > td:last-child > div:first-child > a {\n        display: block;\n        min-height: 24px;\n    }\n\n    #menu_container .menuitem {\n        font-size: 12px !important;\n        line-height: 1.2;\n        padding: 3px 4px;\n    }\n}\n\n/* Turn each legacy topic row into a compact, readable mobile card. */\nbody > div:nth-last-of-type(3) .forumline tr.snowmobile-topic-row {\n    background: #fff;\n    border-bottom: 5px solid #ECECFF;\n    box-sizing: border-box;\n    display: block !important;\n    padding: 0;\n}\n\nbody > div:nth-last-of-type(3) .forumline tr.snowmobile-topic-row > td {\n    background: #fff !important;\n    box-sizing: border-box;\n    display: block !important;\n    width: 100% !important;\n}\n\nbody > div:nth-last-of-type(3) .forumline tr.snowmobile-topic-row > td:first-child,\nbody > div:nth-last-of-type(3) .forumline tr.snowmobile-topic-row > td:nth-child(n + 3) {\n    display: none !important;\n}\n\nbody > div:nth-last-of-type(3) .forumline tr.snowmobile-topic-row > td:nth-child(2) {\n    padding: 10px 12px 9px;\n}\n\nbody > div:nth-last-of-type(3) .forumline .snowmobile-topic-row .topictitle {\n    align-items: flex-start;\n    display: flex;\n    font-size: 16px;\n    font-weight: 600;\n    gap: 6px;\n    line-height: 1.3;\n    min-width: 0;\n}\n\nbody > div:nth-last-of-type(3) .forumline .snowmobile-topic-row .topictitle > a {\n    flex: 1 1 auto;\n    min-width: 0;\n}\n\nbody > div:nth-last-of-type(3) .forumline .snowmobile-topic-row .topic_type_alert,\nbody > div:nth-last-of-type(3) .forumline .snowmobile-topic-row .topic_type_sticky {\n    flex: 0 0 auto;\n    margin: 1px 0 0 !important;\n}\n\nbody > div:nth-last-of-type(3) .forumline .snowmobile-topic-row .snowmobile-topic-meta {\n    align-items: center;\n    color: #6A6A7A;\n    display: flex;\n    flex-wrap: wrap;\n    font-size: 12px;\n    gap: 0;\n    line-height: 1.4;\n    margin-top: 6px;\n    min-height: 36px;\n    padding-right: 42px;\n    position: relative;\n}\n\nbody > div:nth-last-of-type(3) .forumline .snowmobile-topic-row .snowmobile-topic-meta > :not(:first-child):not(.snowmobile-latest-post)::before {\n    color: #A2A2B3;\n    content: \"·\";\n    margin: 0 6px;\n}\n\nbody > div:nth-last-of-type(3) .forumline .snowmobile-topic-row .snowmobile-latest-post {\n    align-items: center;\n    background: #F1F1FA;\n    border-radius: 50%;\n    display: flex;\n    height: 40px;\n    justify-content: center;\n    position: absolute;\n    right: -6px;\n    top: 50%;\n    transform: translateY(-50%);\n    width: 40px;\n}\n\nbody > div:nth-last-of-type(3) .forumline .snowmobile-topic-row .snowmobile-latest-post img {\n    display: none;\n}\n\nbody > div:nth-last-of-type(3) .forumline .snowmobile-topic-row .snowmobile-latest-post::before {\n    color: #176D99;\n    content: \"↘\";\n    font-size: 20px;\n    line-height: 1;\n}\n\nbody > div:nth-last-of-type(3) .forumline .snowmobile-topic-row .page_links {\n    color: #7777AA;\n    display: flex;\n    float: none !important;\n    flex-wrap: wrap;\n    font-size: 11px;\n    line-height: 1.5;\n    margin-top: 3px;\n    width: 100%;\n}\n\nbody > div:nth-last-of-type(3) .forumline .snowmobile-topic-row .page_links a {\n    display: inline-flex;\n    margin-right: 4px;\n    min-height: 24px;\n    min-width: 24px;\n}\n\n@media (max-width: 600px) {\n    /* Match the compact phone header used on topic pages and prevent the\n       legacy header table's fixed navigation cell from widening the viewport. */\n    body > table:first-of-type {\n        margin-left: -8px !important;\n        max-width: 100vw !important;\n        table-layout: fixed !important;\n        width: 100vw !important;\n    }\n\n    body > table:first-of-type > tbody > tr:first-child > td {\n        box-sizing: border-box;\n        max-width: 100%;\n        overflow: hidden;\n        vertical-align: middle;\n    }\n\n    body > table:first-of-type > tbody > tr:first-child > td:first-child {\n        width: 70% !important;\n    }\n\n    body > table:first-of-type > tbody > tr:first-child > td:nth-child(2) {\n        text-align: right;\n        white-space: normal;\n        width: 30% !important;\n    }\n\n    body > table:first-of-type > tbody > tr:first-child > td:nth-child(2) a {\n        align-items: center;\n        display: inline-flex;\n        font-size: 12px;\n        line-height: 1.2;\n        margin-left: 3px;\n        min-height: 30px;\n        padding: 2px;\n        white-space: normal;\n    }\n\n    body > table:first-of-type > tbody > tr:first-child > td:first-child img {\n        height: auto !important;\n        max-width: 100% !important;\n    }\n}\n","viewtopic":"/* CSS for viewtopic.php */\n/* regex: http:\\/\\/(www\\.)?snowheads.com\\/ski-forum\\/(viewtopic.php(\\?.*)?); */\nbody > table:nth-child(3) > tbody:nth-child(1) > tr:nth-child(3) > td:nth-child(1) > div:nth-child(1) {\n    /* The top login box */\n    margin: inherit !important;\n}\n\nbody > table:nth-child(3) > tbody:nth-child(1) > tr:nth-child(3) > td:nth-child(1) > div:nth-child(1) {\n \n    margin: inherit !important;\n}\n\n#table3 .message_cell {\n    max-width: 90vw;\n}\n\n.forumline > tbody > tr > td {\n    display: block;\n    width: 100%;\n}\n\n@media (max-width: 600px) {\n    #menu_container {\n        max-width: 100vw !important;\n        right: 0 !important;\n    }\n\n    #menu_container > table {\n        height: 84px !important;\n        margin: 0 !important;\n        max-width: 100vw !important;\n    }\n\n    #menu_container > table > tbody > tr > td:last-child {\n        box-sizing: border-box;\n        padding: 4px 6px !important;\n    }\n\n    #menu_container > table > tbody > tr > td:last-child > div[style*=\"width:200px\"] {\n        display: block !important;\n        left: auto !important;\n        width: 200px !important;\n    }\n\n    #menu_container > table > tbody > tr > td:last-child > div[style*=\"width:200px\"] > a {\n        box-sizing: border-box;\n        display: block !important;\n        line-height: 1.2;\n        margin: 1px 0;\n        min-height: 26px;\n        overflow-wrap: anywhere;\n        padding: 2px 4px;\n        white-space: normal !important;\n    }\n\n    #menu_container > table > tbody > tr > td:last-child > div:first-child > a {\n        display: block;\n        min-height: 24px;\n    }\n\n    #menu_container .menuitem {\n        font-size: 12px !important;\n        line-height: 1.2;\n        padding: 3px 4px;\n    }\n}\n\n/* The post cells have a legacy height=\"3\" attribute. With the block-cell\n   mobile layout, height:100% collapses each table row to its poster height,\n   letting later posts overlap the previous post's content. */\n.forumline > tbody > tr > td:not(.name) {\n    height: auto !important;\n}\n\n.forumline .row1,\n.forumline .row2 {\n    height: 100%;\n}\n.forumline .poster_info {\n    display: flex !important;\n    padding-bottom: 10px;\n    padding-top: 5px;\n    margin-left: 10px;\n}\n.forumline .poster_info .plusclick {\n    margin-right: 5px;\n}\n.forumline .poster_info span {\n    display: flex;\n}\n.forumline .poster_info font {\n    display: flex;\n}\n.forumline .poster_info .report_conditions:not(.post_date_portrait) {\n    display: none;\n}\n.forumline .poster_info .report_conditionsRed {\n    /* e.g. freerider, user, super-snowhead */\n    \n    display: none;\n}\n.forumline .poster_info .report_conditions.post_date_portrait {\n    display: flex;\n    \n    /* remove bold HH:MM */\n    font-weight: normal !important;\n    padding-right: 5px;\n}\n.forumline .poster_info .report_conditions.post_date_portrait br {\n    display: none;\n}\n\n.forumline .post_row #table3 > tbody > tr > td:not(.quote) {\n    border-left: none !important;\n    position: inherit !important;\n    display: block;\n    width: 100% !important;\n    max-width: 100% !important;\n}\n\n#pagebody .forumline {\n    table-layout: fixed;\n    width: 100%;\n}\n\n.forumline .postbody {\n    overflow-wrap: anywhere;\n}\n\n.forumline .postbody .imagepadleft,\n.forumline .postbody .imagepadright {\n    box-sizing: border-box;\n    float: none;\n    margin: 8px 0;\n    max-width: 100%;\n    width: fit-content;\n}\n\n.forumline .postbody img {\n    box-sizing: border-box;\n    height: auto;\n    max-width: 100% !important;\n}\n\n.forumline td.row1,\n.forumline td.row2 {\n    background-color: #F5F5FF;\n}\n#table2 .forumline .row1,\n#table2 .forumline .row2 {\n    /* Aligns the poster_info and the post */\n    \n    border: none !important;\n}\n.post_info .plusclick {\n    display: flex;\n}\n.post_date_portrait {\n    background-color: inherit;\n}\n.postbody {\n    font-size: 1em;\n    line-height: 1.5;\n}\n.post_info {\n    position: static !important;\n    display: block !important;\n    width: 100% !important;\n    margin: 4px 0 0 !important;\n    padding-right: 8px;\n    box-sizing: border-box;\n    text-align: right;\n    /* Keep the expand icon on the same visual row as post-link and quote. */\n    transform: translateY(14px);\n}\n.post_info div {\n    float: inherit !important;\n    position: inherit !important;\n    margin-top: 0;\n}\n.forumline #post_row.post_row table#table3 tbody tr td a img {\n    width: 18px !important;\n    height: 14px !important;\n    padding: 0 !important;\n    vertical-align: middle;\n}\n.forumline #post_row.post_row table#table3 tbody tr td:has(.post_link_landscape) {\n    white-space: nowrap;\n}\n.forumline #post_row.post_row .post_link_landscape,\n.forumline #post_row.post_row .post_quote_landscape {\n    display: inline-flex !important;\n    align-items: center;\n    vertical-align: middle;\n    margin: 0 0 0 4px !important;\n    padding: 0 !important;\n    white-space: nowrap;\n}\n.forumline #post_row.post_row .post_quote_landscape {\n    margin-right: 12px !important;\n    transform: translateY(-3px);\n}\n.forumline #post_row.post_row .post_quote_landscape img {\n    transform: translateY(-2px);\n}\n.forumline #post_row.post_row .post_link_landscape {\n    transform: translateY(-3px);\n}\n.forumline tbody tr td.row1 form {\n    background: none !important;\n    width: auto !important;\n}\n\n.quote {\n    background: #F1F1FA;\n    border-left: 3px solid #7777AA;\n    border-radius: 0 8px 8px 0;\n    box-sizing: border-box;\n    overflow: hidden;\n    padding: 10px 12px;\n}\n\n@media (max-width: 1200px) {\n    /* Keep the post date beside its author instead of in the distant landscape action column. */\n    #pagebody .forumline > tbody > tr > td.name {\n        box-sizing: border-box;\n        width: 100% !important;\n        min-width: 0 !important;\n        max-width: 100% !important;\n    }\n\n    #pagebody .forumline .poster_info {\n        align-items: center;\n        background-color: #ECECFF;\n        border-bottom: 1px solid #D2D2EE;\n        box-sizing: border-box;\n        flex-wrap: wrap;\n        gap: 6px;\n        margin: 0;\n        padding: 6px 10px;\n        width: 100%;\n    }\n\n    #pagebody .forumline .poster_info > span:not(.plusclick):not(.report_conditions) {\n        flex: 0 1 auto;\n    }\n\n    #pagebody .forumline .poster_info .post_date_portrait {\n        background: transparent !important;\n        color: #7777AA !important;\n        display: flex !important;\n        font-size: 10px !important;\n        padding: 0 !important;\n    }\n\n    #pagebody .forumline .post_date_landscape {\n        display: none !important;\n    }\n\n    #pagebody .forumline .poster_info.snowmobile-enhanced {\n        align-items: start;\n        background: #fff;\n        border-bottom: 0;\n        column-gap: 8px;\n        display: grid !important;\n        grid-template-columns: auto minmax(0, 1fr);\n        padding: 10px 10px 0;\n    }\n\n    #pagebody .forumline .poster_info.snowmobile-enhanced .expand_poster_data {\n        grid-column: 1;\n        grid-row: 1 / 3;\n        margin: 2px 0 0;\n    }\n\n    #pagebody .forumline .poster_info.snowmobile-enhanced .snowmobile-author {\n        grid-column: 2;\n        min-width: 0;\n    }\n\n    #pagebody .forumline .poster_info.snowmobile-enhanced .snowmobile-author-name {\n        align-items: center;\n        display: flex;\n        flex-wrap: wrap;\n        gap: 7px;\n        line-height: 1.25;\n    }\n\n    #pagebody .forumline .poster_info.snowmobile-enhanced .snowmobile-author-name > span {\n        margin: 0 !important;\n        white-space: normal !important;\n    }\n\n    #pagebody .forumline .poster_info.snowmobile-enhanced .snowmobile-author-name a {\n        font-size: 16px;\n        font-weight: 600;\n    }\n\n    #pagebody .forumline .poster_info.snowmobile-enhanced .snowmobile-member-badge {\n        background: #f1f0ed;\n        border-radius: 5px;\n        color: #57534b;\n        font-size: 11px;\n        font-weight: 600;\n        line-height: 1;\n        padding: 5px 7px;\n    }\n\n    #pagebody .forumline .poster_info.snowmobile-enhanced .snowmobile-member-badge.is-snowhead {\n        background: #eaf2eb;\n        color: #3f6848;\n    }\n\n    #pagebody .forumline .poster_info.snowmobile-enhanced .snowmobile-member-badge.is-super-snowhead {\n        background: #fff0df;\n        color: #a65309;\n    }\n\n    #pagebody .forumline .poster_info.snowmobile-enhanced .snowmobile-relative-time {\n        color: #686868;\n        font-size: 12px;\n        white-space: nowrap !important;\n    }\n\n    #pagebody .forumline .poster_info.snowmobile-enhanced .snowmobile-author-details {\n        align-items: center;\n        color: #575757;\n        display: flex;\n        font-size: 13px;\n        flex-wrap: wrap;\n        gap: 7px;\n        line-height: 1.4;\n        margin-top: 3px;\n    }\n\n    #pagebody .forumline .poster_info.snowmobile-enhanced .post_date_portrait,\n    #pagebody .forumline .poster_info.snowmobile-enhanced .post_date_landscape {\n        display: none !important;\n    }\n\n    #pagebody .forumline .poster_info.snowmobile-enhanced .expand_poster_data {\n        align-items: center;\n        background: #F1F1FA;\n        border-radius: 50%;\n        display: flex;\n        height: 40px;\n        justify-content: center;\n        margin: 0;\n        width: 40px;\n    }\n\n    #pagebody .forumline .poster_info.snowmobile-enhanced .expand_poster_data img {\n        height: 16px;\n        width: 16px;\n    }\n\n    #pagebody .forumline #post_row.post_row table#table3 tbody tr td:has(.post_link_landscape) {\n        align-items: center;\n        border-left: 0 !important;\n        display: flex !important;\n        gap: 4px;\n        justify-content: flex-end;\n        min-height: 48px;\n        padding: 2px 8px;\n        width: 100% !important;\n    }\n\n    #pagebody .forumline #post_row.post_row table#table3 tbody tr td > a:has(> .post_link_landscape),\n    #pagebody .forumline #post_row.post_row table#table3 tbody tr td .post_quote_landscape > a {\n        align-items: center;\n        background: #F1F1FA;\n        border-radius: 20px;\n        display: inline-flex !important;\n        height: 40px;\n        justify-content: center;\n        margin: 0 !important;\n        transform: none !important;\n        width: 40px;\n    }\n\n    #pagebody .forumline #post_row.post_row table#table3 tbody tr td .post_link_landscape,\n    #pagebody .forumline #post_row.post_row table#table3 tbody tr td .post_quote_landscape {\n        margin: 0 !important;\n        transform: none !important;\n    }\n\n    #pagebody .forumline #post_row.post_row table#table3 tbody tr td .post_quote_landscape {\n        display: inline-flex !important;\n    }\n\n    #pagebody .forumline #post_row.post_row table#table3 tbody tr td .post_link_landscape img,\n    #pagebody .forumline #post_row.post_row table#table3 tbody tr td .post_quote_landscape img {\n        height: 18px !important;\n        width: 18px !important;\n    }\n\n    #pagebody .forumline #post_row.post_row table#table3 .post_info.snowmobile-post-menu {\n        box-sizing: border-box;\n        display: flex !important;\n        margin: 0 !important;\n        padding: 0 !important;\n        position: relative !important;\n        transform: none !important;\n        width: auto !important;\n    }\n\n    #pagebody .forumline #post_row.post_row table#table3 .snowmobile-post-menu > div:first-child {\n        display: flex !important;\n        float: none !important;\n        position: relative !important;\n        top: auto !important;\n    }\n\n    #pagebody .forumline #post_row.post_row table#table3 .snowmobile-post-menu .expand_post_data {\n        align-items: center;\n        background: #F1F1FA;\n        border-radius: 50%;\n        display: flex;\n        height: 40px;\n        justify-content: center;\n        margin: 0 !important;\n        width: 40px;\n    }\n\n    #pagebody .forumline #post_row.post_row table#table3 .snowmobile-post-menu .expand_post_data img {\n        height: 16px;\n        width: 16px;\n    }\n\n    #pagebody .forumline .message_cell .postbody {\n        font-size: 16px;\n        line-height: 1.5;\n    }\n\n    #qr_form #quick_reply_text {\n        box-sizing: border-box !important;\n        height: 96px !important;\n        min-height: 96px !important;\n        width: 100% !important;\n    }\n\n    #qr_form .snowmobile-smilies-toggle {\n        background: #ECECFF;\n        border: 1px solid #C6C6E4;\n        border-radius: 7px;\n        color: #33336B;\n        font: inherit;\n        margin: 6px 0;\n        min-height: 40px;\n        padding: 7px 12px;\n    }\n\n    #qr_form .snowmobile-smilies:not(.is-expanded) {\n        display: none !important;\n    }\n}\n\n@media (max-width: 600px) {\n    /* Keep the branded header and account links inside the phone viewport. */\n    body > table:first-of-type {\n        margin-left: -8px !important;\n        max-width: 100vw !important;\n        table-layout: fixed !important;\n        width: 100vw !important;\n    }\n\n    body > table:first-of-type > tbody > tr:first-child > td {\n        box-sizing: border-box;\n        max-width: 100%;\n        overflow: hidden;\n        vertical-align: middle;\n    }\n\n    body > table:first-of-type > tbody > tr:first-child > td:first-child {\n        width: 70% !important;\n    }\n\n    body > table:first-of-type > tbody > tr:first-child > td:nth-child(2) {\n        text-align: right;\n        white-space: normal;\n        width: 30% !important;\n    }\n\n    body > table:first-of-type > tbody > tr:first-child > td:nth-child(2) a {\n        align-items: center;\n        display: inline-flex;\n        font-size: 12px;\n        line-height: 1.2;\n        margin-left: 3px;\n        min-height: 30px;\n        padding: 2px;\n        white-space: normal;\n    }\n\n    body > table:first-of-type > tbody > tr:first-child > td:first-child img {\n        height: auto !important;\n        max-width: 100% !important;\n    }\n\n    #page_head_Xport img {\n        max-width: 100% !important;\n        height: auto !important;\n    }\n\n    /* Keep the post table centred; its cells should fill the same 12px gutters. */\n    #pagebody .forumline {\n        margin-left: auto !important;\n        margin-right: auto !important;\n        width: calc(100vw - 24px) !important;\n        max-width: calc(100vw - 24px) !important;\n        table-layout: fixed !important;\n    }\n\n    #navzone {\n        box-sizing: border-box;\n        width: 100% !important;\n    }\n\n    .forumline > tbody > tr > td {\n        box-sizing: border-box;\n    }\n\n    #pagebody .forumline #table3 .message_cell {\n        box-sizing: border-box !important;\n        width: 100% !important;\n        max-width: 100% !important;\n    }\n\n    .postbody,\n    .postbody * {\n        overflow-wrap: anywhere !important;\n        word-break: break-word !important;\n    }\n\n    /* Long quoted URLs otherwise get clipped by the existing .quote overflow rule. */\n    .quote,\n    .quote * {\n        overflow-wrap: anywhere !important;\n        word-break: break-word !important;\n    }\n\n    body {\n        background: #f2f4f7 !important;\n        color: #263442;\n        font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif !important;\n    }\n\n    /* The forum repeats #pagebody on an inner div with an inline lavender fill. */\n    #pagebody {\n        background: #f2f4f7 !important;\n    }\n\n    #pagebody h1 {\n        box-sizing: border-box;\n        color: #263442;\n        display: block !important;\n        font-size: 25px;\n        line-height: 1.2;\n        margin: 4px 12px 8px !important;\n        padding: 0 !important;\n    }\n\n    #navzone {\n        display: flex;\n        flex-direction: column;\n        gap: 5px;\n        padding: 0 12px 8px;\n    }\n\n    #topic_header {\n        float: none !important;\n        font-size: 13px;\n        line-height: 1.35;\n        margin: 0 !important;\n        width: 100%;\n    }\n\n    #topic_header h3 {\n        font-size: inherit;\n        line-height: inherit;\n        margin: 0;\n    }\n\n    #navzone > div:last-child {\n        float: none !important;\n        text-align: right;\n        width: 100%;\n    }\n\n    #navzone .nav {\n        align-items: center;\n        display: inline-flex;\n        gap: 6px;\n        line-height: 1.2;\n    }\n\n    #navzone .nav a {\n        align-items: center;\n        background: #fff;\n        border: 1px solid #d8e0e7;\n        border-radius: 9px;\n        box-sizing: border-box;\n        color: #173b59 !important;\n        display: inline-flex;\n        font-size: 14px;\n        justify-content: center;\n        min-height: 40px;\n        padding: 0 11px;\n        text-decoration: none;\n    }\n\n    #pagebody .forumline {\n        background: transparent !important;\n        border: 0 !important;\n        border-collapse: separate;\n        border-spacing: 0 5px;\n        overflow: visible;\n    }\n\n    #pagebody .forumline > tbody > tr:has(.post_row) {\n        background: #fff;\n        border-radius: 14px;\n        box-shadow: 0 2px 12px rgba(28, 44, 60, 0.08);\n        display: block;\n        margin: 0;\n        overflow: hidden;\n    }\n\n    #pagebody .forumline > tbody > tr:has(.post_row) > td {\n        background: #fff !important;\n        border: 0 !important;\n        box-sizing: border-box;\n        width: 100% !important;\n    }\n\n    #pagebody .forumline > tbody > tr:has(.post_row) > td.name {\n        border-radius: 14px 14px 0 0;\n    }\n\n    #pagebody .forumline .poster_info.snowmobile-enhanced {\n        padding: 10px 12px 8px;\n    }\n\n    #pagebody .forumline .post_row {\n        background: #fff;\n        box-sizing: border-box;\n        max-width: 100% !important;\n        margin: 0 !important;\n        padding: 0 12px;\n        width: 100% !important;\n    }\n\n    #pagebody .forumline #post_row.post_row table#table3 {\n        background: #fff;\n        border-collapse: separate;\n        border-spacing: 0;\n        box-sizing: border-box;\n        width: 100% !important;\n    }\n\n    #pagebody .forumline .message_cell {\n        background: #fff !important;\n        border-right: 0 !important;\n        padding: 8px 0 12px !important;\n    }\n\n    #pagebody .forumline .message_cell .postbody {\n        color: #263442;\n        font-size: 16px;\n        line-height: 1.55;\n    }\n\n    #pagebody .forumline #post_row.post_row table#table3 tbody tr td:has(.post_link_landscape) {\n        background: #fff !important;\n        border-radius: 0 0 14px 14px;\n        border-top: 1px solid #edf0f3 !important;\n        min-height: 48px;\n        padding: 4px 0;\n    }\n\n    #pagebody .forumline #post_row.post_row table#table3 tbody tr td > a:has(> .post_link_landscape),\n    #pagebody .forumline #post_row.post_row table#table3 tbody tr td .post_quote_landscape > a,\n    #pagebody .forumline #post_row.post_row table#table3 .snowmobile-post-menu .expand_post_data {\n        background: #f2f4f7;\n        border: 1px solid #e3e8ed;\n        border-radius: 50%;\n        height: 40px;\n        width: 40px;\n    }\n\n    #qr_form {\n        background: #fff !important;\n        border: 1px solid #e3e8ed !important;\n        border-radius: 14px !important;\n        box-shadow: 0 2px 12px rgba(28, 44, 60, 0.08);\n        box-sizing: border-box !important;\n        margin: 10px auto 16px !important;\n        padding: 12px !important;\n        text-align: left !important;\n        width: calc(100vw - 24px) !important;\n    }\n\n    #qr_form #quick_reply_text {\n        background: #fff !important;\n        border: 1px solid #d8e0e7 !important;\n        border-radius: 10px !important;\n        box-sizing: border-box !important;\n        color: #263442;\n        font: inherit;\n        padding: 10px !important;\n        width: 100% !important;\n    }\n\n    #qr_form input[type=\"button\"],\n    #qr_form input[type=\"submit\"] {\n        appearance: none;\n        background: #173b59 !important;\n        border: 1px solid #173b59 !important;\n        border-radius: 9px !important;\n        color: #fff !important;\n        font: inherit;\n        font-size: 14px;\n        margin: 5px 4px 5px 0 !important;\n        min-height: 40px;\n        padding: 0 12px !important;\n    }\n\n    #qr_form .snowmobile-smilies-toggle {\n        background: #f2f4f7;\n        border: 1px solid #d8e0e7;\n        color: #173b59;\n    }\n}\n\n@media (min-width: 1201px) {\n    /* Smileys stay visible on wide layouts, so their mobile toggle is redundant. */\n    #qr_form .snowmobile-smilies-toggle {\n        display: none !important;\n    }\n}\n"};
  const pathname = window.location.pathname;
  const route = routes.find(({ exact, pattern }) =>
    exact ? exact.includes(pathname) : new RegExp(pattern).test(pathname),
  );
  // GM.addStyle injects a user-origin stylesheet in Safari, which the site's own
  // (author) CSS beats regardless of specificity. A <style> element is author-origin.
  const style = document.createElement("style");
  style.textContent = "/* Shared site header. Hidden on desktop widths. */\n.snowmobile-bar {\n    display: none;\n}\n\n@media (max-width: 600px) {\n    div[name=\"page_header\"] {\n        background: #173b59 !important;\n        box-sizing: border-box;\n        padding-top: env(safe-area-inset-top);\n        position: relative !important;\n    }\n\n    #topCorner {\n        background: #173b59 !important;\n        box-sizing: border-box;\n        border-bottom: 1px solid rgba(255, 255, 255, 0.12);\n        height: 52px !important;\n        left: 0 !important;\n        position: relative !important;\n        top: 0 !important;\n        width: 100% !important;\n    }\n\n    #snowimage_Land,\n    #menu_dummy,\n    [id=\"fay kaydee\"] > div[style*=\"background-color:#FFF\"] {\n        display: none !important;\n    }\n\n    #snowimage_Port {\n        border: 0 !important;\n        box-sizing: border-box;\n        height: 52px !important;\n        left: 12px !important;\n        top: 0 !important;\n        width: 84px !important;\n        z-index: 20 !important;\n    }\n\n    #snowimage_Port > a {\n        display: block;\n        height: 100%;\n        width: 100%;\n    }\n\n    #snowimage_Port table,\n    #snowimage_Port tbody,\n    #snowimage_Port tr,\n    #snowimage_Port td {\n        border: 0 !important;\n        display: block;\n        height: 100%;\n        margin: 0 !important;\n        padding: 0 !important;\n        width: 100% !important;\n    }\n\n    #snowimage_Port td:first-child,\n    #snowimage_Port td:last-child {\n        display: none !important;\n    }\n\n    #snowimage_Port img {\n        box-sizing: border-box;\n        height: 48px !important;\n        max-height: 48px !important;\n        max-width: 82px !important;\n        min-width: 0 !important;\n        object-fit: contain;\n        object-position: left center;\n        position: static !important;\n        width: 82px !important;\n    }\n\n    [id=\"fay kaydee\"] {\n        height: 52px !important;\n        left: 0 !important;\n        position: absolute !important;\n        top: 0 !important;\n        width: 100% !important;\n        z-index: 30 !important;\n    }\n\n    [id=\"fay kaydee\"] > table {\n        border: 0 !important;\n        box-sizing: border-box;\n        display: block !important;\n        height: 52px !important;\n        left: 88px !important;\n        position: absolute !important;\n        top: 0 !important;\n        width: calc(100% - 92px) !important;\n    }\n\n    [id=\"fay kaydee\"] > table > tbody,\n    [id=\"fay kaydee\"] > table > tbody > tr,\n    [id=\"fay kaydee\"] > table > tbody > tr > td {\n        display: block;\n        height: 52px !important;\n        margin: 0 !important;\n        padding: 0 !important;\n        width: 100% !important;\n    }\n\n    #menu_container {\n        display: none !important;\n    }\n\n    .snowmobile-legacy-header {\n        display: none !important;\n    }\n\n    .snowmobile-bar {\n        align-items: center;\n        background: #173b59;\n        border-bottom: 1px solid rgba(255, 255, 255, 0.12);\n        box-sizing: border-box;\n        display: flex;\n        height: 52px;\n        justify-content: space-between;\n        padding: 0 12px;\n        position: relative;\n        width: 100%;\n        z-index: 14000;\n    }\n\n    .snowmobile-wordmark {\n        color: #fff !important;\n        font-size: 17px;\n        font-weight: 700;\n        text-decoration: none;\n    }\n\n    .snowmobile-bar .snowmobile-toolbar {\n        position: static;\n    }\n\n    #fay\\ kaydee > table,\n    #left_menus_table {\n        display: none !important;\n    }\n\n    .snowmobile-toolbar {\n        align-items: center;\n        display: flex;\n        gap: 8px;\n        position: absolute;\n        right: 12px;\n        top: 4px;\n        z-index: 14000;\n    }\n\n    .snowmobile-toolbar .snowmobile-icon-control {\n        align-items: center;\n        background-color: #244d6d !important;\n        border: 1px solid rgba(255, 255, 255, 0.25);\n        border-radius: 10px;\n        box-sizing: border-box;\n        color: #fff !important;\n        display: block;\n        flex: 0 0 44px;\n        height: 44px;\n        margin: 0 !important;\n        overflow: hidden;\n        position: relative;\n        text-indent: -9999px;\n        width: 44px;\n    }\n\n    .snowmobile-toolbar .snowmobile-icon-control:active {\n        background-color: #416483 !important;\n    }\n\n    .snowmobile-toolbar .snowmobile-icon-control::before,\n    .snowmobile-toolbar .snowmobile-icon-control::after {\n        content: \"\";\n        left: 50%;\n        position: absolute;\n        text-indent: 0;\n        top: 50%;\n        transform: translate(-50%, -50%);\n    }\n\n    .snowmobile-toolbar .snowmobile-icon-control > .menuitem {\n        background: none !important;\n        background-image: none !important;\n        clip: rect(0, 0, 0, 0);\n        clip-path: inset(50%);\n        height: 1px;\n        overflow: hidden;\n        position: absolute;\n        white-space: nowrap;\n        width: 1px;\n    }\n\n    .snowmobile-toolbar .snowmobile-visually-hidden {\n        clip: rect(0, 0, 0, 0);\n        clip-path: inset(50%);\n        height: 1px;\n        overflow: hidden;\n        position: absolute;\n        white-space: nowrap;\n        width: 1px;\n    }\n\n    .snowmobile-toolbar .snowmobile-menu-toggle::before {\n        background: linear-gradient(#fff, #fff) 0 0 / 18px 2px no-repeat,\n            linear-gradient(#fff, #fff) 0 7px / 18px 2px no-repeat,\n            linear-gradient(#fff, #fff) 0 14px / 18px 2px no-repeat;\n        height: 16px;\n        width: 18px;\n    }\n\n    .snowmobile-toolbar .snowmobile-search-control::before {\n        border: 2px solid #fff;\n        border-radius: 50%;\n        height: 13px;\n        left: calc(50% - 2px);\n        top: calc(50% - 2px);\n        width: 13px;\n    }\n\n    .snowmobile-toolbar .snowmobile-search-control::after {\n        background: #fff;\n        border-radius: 2px;\n        height: 2px;\n        left: calc(50% + 7px);\n        top: calc(50% + 7px);\n        transform: rotate(45deg);\n        width: 8px;\n    }\n\n    .snowmobile-toolbar .snowmobile-messages-control::before {\n        border: 2px solid #fff;\n        border-radius: 5px;\n        height: 14px;\n        left: 50%;\n        top: 48%;\n        width: 19px;\n    }\n\n    .snowmobile-toolbar .snowmobile-messages-control::after {\n        border-bottom: 2px solid #fff;\n        border-left: 2px solid #fff;\n        height: 6px;\n        left: calc(50% - 7px);\n        top: calc(50% + 7px);\n        transform: skewY(-35deg);\n        width: 6px;\n    }\n\n    .snowmobile-toolbar .snowmobile-account-control::before {\n        background: #fff;\n        border-radius: 50%;\n        height: 8px;\n        left: 50%;\n        top: 14px;\n        transform: translate(-50%, -50%);\n        width: 8px;\n    }\n\n    .snowmobile-toolbar .snowmobile-account-control::after {\n        border: 2px solid #fff;\n        border-bottom: 0;\n        border-radius: 12px 12px 0 0;\n        height: 10px;\n        left: 50%;\n        top: 28px;\n        transform: translate(-50%, -50%);\n        width: 20px;\n    }\n\n    .snowmobile-menu[hidden] {\n        display: none !important;\n    }\n\n    .snowmobile-menu {\n        background: #fff;\n        border: 1px solid #d8e0e7;\n        border-radius: 12px;\n        box-shadow: 0 8px 24px rgba(20, 38, 55, 0.24);\n        box-sizing: border-box;\n        color: #263442;\n        max-height: calc(100vh - 64px);\n        max-width: calc(100vw - 24px);\n        min-width: min(280px, calc(100vw - 24px));\n        overflow-y: auto;\n        padding: 7px;\n        position: absolute;\n        right: 0;\n        top: calc(100% + 4px);\n        width: 310px;\n        z-index: 14001;\n    }\n\n    .snowmobile-menu .snowmobile-menu-heading {\n        color: #596573;\n        font-size: 11px;\n        font-weight: 700;\n        letter-spacing: 0.04em;\n        line-height: 1.2;\n        padding: 4px 10px 0;\n        text-transform: uppercase;\n    }\n\n    .snowmobile-menu a {\n        align-items: center;\n        background: none !important;\n        background-image: none !important;\n        border-radius: 8px;\n        box-sizing: border-box;\n        color: #173b59 !important;\n        display: flex;\n        font-size: 15px;\n        min-height: 44px;\n        padding: 0 10px;\n        text-decoration: none;\n        white-space: normal;\n    }\n\n    .snowmobile-menu a > .menuitem {\n        margin: 0 !important;\n        padding: 0 !important;\n    }\n\n    .snowmobile-menu a * {\n        background: none !important;\n        background-image: none !important;\n        color: #173b59 !important;\n        font-family: inherit !important;\n        font-size: 15px !important;\n        font-weight: 500 !important;\n    }\n\n    .snowmobile-menu a:active {\n        background: #edf3f7 !important;\n    }\n}\n" + (route ? styles[route.style] : "");
  (document.head || document.documentElement).appendChild(style);

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

  function enhanceHeader() {
    if (document.querySelector(".snowmobile-toolbar")) return;

    const corner = document.querySelector("#topCorner");
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
      return;
    }

    const bar = document.createElement("div");
    bar.className = "snowmobile-bar";
    const wordmark = anchor("/ski-forum/", "snowHeads");
    wordmark.className = "snowmobile-wordmark";
    bar.append(wordmark, toolbar);

    if (legacy) {
      legacy.classList.add("snowmobile-legacy-header");
      legacy.before(bar);
    } else {
      document.body.prepend(bar);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", enhanceHeader, { once: true });
  } else {
    enhanceHeader();
  }
})();

  }
  if (route.script === "start") {
(() => {
  "use strict";

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
    table.querySelectorAll("tr").forEach((row) => {
      const cell = row.querySelector("td.row1, td.row2");
      if (!cell || cell.querySelector(".snowmobile-recent-meta")) return;

      const forumLink = cell.querySelector('a.gensmall[href*="viewforum.php"], a.gensmall[href*="snow_reports.php"]');
      const timeLabel = [...cell.querySelectorAll("span.gensmall")].find((span) =>
        !span.querySelector("a") &&
        /(?:ago|^today\b|^yesterday\b|\d{1,2}-\d{1,2}-\d{2,4})/i.test(span.textContent.trim()),
      );
      if (!forumLink && !timeLabel) return;

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
        timeLabel.parentElement.remove();
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
if (route.script === "viewforum") {
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

  function enhanceTopics() {
    document.querySelectorAll("body > div:nth-last-of-type(3) .forumline tr").forEach((row) => {
      const cells = row.querySelectorAll(":scope > td");
      if (cells.length < 3 || row.classList.contains("snowmobile-topic-row")) return;

      const topicCell = cells[1];
      const title = topicCell.querySelector("a.topictitle");
      const lastPostCell = cells[cells.length - 1];
      const author = lastPostCell.querySelector('.postdetails a[href*="profile.php?mode=viewprofile"]');
      const authorName = author?.textContent.trim() ||
        lastPostCell.querySelector(".postdetails > div:first-child")?.textContent.trim();
      const replyCount = cells.length > 3
        ? cells[2].querySelector(".postdetails b")?.textContent.trim()
        : "";
      const lastPostBlock = lastPostCell.querySelector(".postdetails > div:last-child");
      const dateText = lastPostBlock?.firstChild?.textContent.trim() || "";
      const timeText = lastPostBlock?.querySelector("b")?.textContent.trim() || "";
      const latestPostLink = lastPostBlock?.querySelector('a[href*="viewtopic.php?p="]');
      if (!title || !authorName) return;

      const meta = document.createElement("div");
      meta.className = "snowmobile-topic-meta";
      const authorLabel = document.createElement("span");
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
      if (pageLinks) topicCell.append(pageLinks);
      if (latestPostLink) {
        const latestIcon = latestPostLink.querySelector("img")?.cloneNode(true);
        if (latestIcon) latestPostLink.replaceChildren(latestIcon);
        latestPostLink.classList.add("snowmobile-latest-post");
        latestPostLink.setAttribute("aria-label", "Go to latest post");
        latestPostLink.title = "Go to latest post";
        meta.append(latestPostLink);
      }
      row.classList.add("snowmobile-topic-row");
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", enhanceTopics, { once: true });
  } else {
    enhanceTopics();
  }
})();

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

      const postInfo = postRow.querySelector(".post_info");
      const actionCell = postRow.querySelector("#table3 td:has(.post_link_landscape)");
      if (postInfo && actionCell && !actionCell.contains(postInfo)) {
        postInfo.classList.add("snowmobile-post-menu");
        actionCell.append(postInfo);
      }

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

  function enhanceQuickReply() {
    const form = document.querySelector("#qr_form");
    const smileys = form?.querySelector('#wide_box > div:has(img[onclick*="insertAtCaret"])');
    if (!form || !smileys || form.querySelector(".snowmobile-smilies-toggle")) return;

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

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      enhancePosts();
      enhanceQuickReply();
    }, { once: true });
  } else {
    enhancePosts();
    enhanceQuickReply();
  }
})();

}
})();
