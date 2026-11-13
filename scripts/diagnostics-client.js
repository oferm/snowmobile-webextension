// Run in the page by the dev userscript loader via new Function("send", source).
const rect = (el) => {
  const b = el.getBoundingClientRect();
  return [Math.round(b.left), Math.round(b.right), Math.round(b.top + scrollY), Math.round(b.height)];
};
const selectorOf = (el) =>
  el.tagName.toLowerCase() +
  (el.id ? "#" + el.id : "") +
  (el.className && typeof el.className === "string" ? "." + el.className.trim().split(/\s+/).join(".") : "");
const describe = (el) => {
  const cs = getComputedStyle(el);
  return {
    el: selectorOf(el),
    rect: rect(el),
    bg: cs.backgroundColor,
    pad: cs.paddingLeft + "/" + cs.paddingRight,
    margin: cs.marginLeft + "/" + cs.marginRight,
    display: cs.display,
    position: cs.position,
    inline: el.getAttribute("style") || undefined,
  };
};
const props = ["background-color", "background", "padding", "padding-left", "margin", "margin-left", "left", "width", "display", "position"];
const rulesFor = (el) => {
  const found = [];
  for (const sheet of document.styleSheets) {
    let rules;
    try { rules = sheet.cssRules; } catch { continue; }
    const walk = (list, media) => {
      for (const rule of list) {
        if (rule.cssRules && rule.media) {
          if (matchMedia(rule.media.mediaText).matches) walk(rule.cssRules, rule.media.mediaText);
        } else if (rule.selectorText && rule.style) {
          let hit = false;
          try { hit = el.matches(rule.selectorText); } catch {}
          if (!hit) continue;
          const decl = props.filter((p) => rule.style.getPropertyValue(p)).map((p) => p + ":" + rule.style.getPropertyValue(p) + (rule.style.getPropertyPriority(p) ? "!" : ""));
          if (decl.length) found.push({ sel: rule.selectorText.slice(0, 120), decl, sheet: sheet.href ? "site:" + sheet.href.split("/").pop() : (sheet.ownerNode && sheet.ownerNode.tagName === "STYLE" ? "style" : "?"), media });
        }
      }
    };
    walk(rules, null);
  }
  return found;
};

function collect() {
  const wide = [...document.querySelectorAll("body *")].filter((el) => el.getBoundingClientRect().right > innerWidth + 1);
  const overflow = wide
    .filter((el) => !wide.some((o) => o !== el && el.contains(o)))
    .slice(0, 15)
    .map((el) => {
      const path = [];
      for (let e = el; e && e !== document.body; e = e.parentElement) path.push(selectorOf(e));
      return { ...describe(el), attrs: el.outerHTML.slice(0, 200), rules: rulesFor(el), path: path.slice(0, 8).join(" < ") };
    });

  const report = {
    url: location.href,
    ua: navigator.userAgent,
    innerWidth,
    dpr: devicePixelRatio,
    scrollWidth: document.documentElement.scrollWidth,
    enhanced: document.querySelectorAll(".snowmobile-enhanced").length,
    overflow,
  };
  let mismatch = false;

  if (location.pathname.endsWith("/viewtopic.php")) {
    const rows = [...document.querySelectorAll("#pagebody .forumline > tbody > tr")].filter((tr) => tr.querySelector(".message_cell"));
    report.posts = rows.map((tr, i) => {
      const tds = [...tr.children].map((td) => ({ ...describe(td), rules: rulesFor(td) }));
      return { index: i, tr: describe(tr), tds };
    });
    const sig = (parity) =>
      new Set(
        report.posts
          .filter((p) => p.index % 2 === parity)
          .map((p) => p.tds.map((t) => t.bg + "|" + t.rect[0] + "|" + t.rect[1]).join(",")),
      );
    const odd = sig(1);
    const even = sig(0);
    mismatch = odd.size > 0 && even.size > 0 && [...odd].join(";") !== [...even].join(";");
  }

  report.problem = report.scrollWidth > report.innerWidth + 8 || mismatch;
  return report;
}

setTimeout(() => {
  try {
    send(collect());
  } catch (error) {
    console.warn("[SnowMobile local] Diagnostics failed", error);
  }
}, 1500);
