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

  function enhanceHomeHeader() {
    const header = document.querySelector("#topCorner");
    if (!header || header.querySelector(".snowmobile-home-toolbar")) return;

    const toolbar = document.createElement("div");
    toolbar.className = "snowmobile-home-toolbar";

    const menuButton = document.createElement("button");
    menuButton.className = "snowmobile-icon-control snowmobile-menu-toggle";
    menuButton.type = "button";
    menuButton.textContent = "Menu";
    menuButton.setAttribute("aria-label", "Open menu");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-controls", "snowmobile-home-menu");
    toolbar.append(menuButton);

    const menu = document.createElement("nav");
    menu.className = "snowmobile-home-menu";
    menu.id = "snowmobile-home-menu";
    menu.setAttribute("aria-label", "Site menu");
    menu.hidden = true;

    const addMenuSection = (label, source) => {
      const links = [...(source?.querySelectorAll(":scope > a") || [])];
      if (!links.length) return;
      const heading = document.createElement("div");
      heading.className = "snowmobile-menu-heading";
      heading.textContent = label;
      menu.append(heading, ...links);
    };

    addMenuSection("User Facilities", document.querySelector("#UFmenushell"));
    addMenuSection("snowBase", document.querySelector("#SBmenushell"));

    const logoutLink = document.querySelector('#menu_container a[href*="logout=true"]');
    if (logoutLink) {
      logoutLink.textContent = "Log out";
      const heading = document.createElement("div");
      heading.className = "snowmobile-menu-heading";
      heading.textContent = "Account";
      menu.append(heading, logoutLink);
    }

    menuButton.addEventListener("click", () => {
      const opening = menu.hidden;
      menu.hidden = !opening;
      menuButton.setAttribute("aria-expanded", String(opening));
      menuButton.setAttribute("aria-label", opening ? "Close menu" : "Open menu");
    });
    menu.addEventListener("click", (event) => {
      if (event.target.closest("a")) {
        menu.hidden = true;
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "Open menu");
      }
    });

    toolbar.append(menu);

    const searchLink = document.querySelector("#SEmenushell a[href]");
    if (searchLink) {
      searchLink.classList.add("snowmobile-icon-control", "snowmobile-search-control");
      searchLink.setAttribute("aria-label", "Search");
      searchLink.title = "Search";
      toolbar.insertBefore(searchLink, menu);
    }

    const messagesLink = document.querySelector('#menu_container a[href*="privmsg.php"]');
    if (messagesLink) {
      messagesLink.classList.add("snowmobile-icon-control", "snowmobile-messages-control");
      messagesLink.setAttribute("aria-label", "Messages");
      messagesLink.title = "Send and read messages";
      toolbar.insertBefore(messagesLink, menu);
    }

    const accountLink = document.querySelector('#menu_container a[href*="payments.php"]');
    if (accountLink) {
      accountLink.classList.add("snowmobile-icon-control", "snowmobile-account-control");
      accountLink.setAttribute("aria-label", "snowAccount");
      accountLink.title = "snowAccount";
      accountLink.replaceChildren();
      const label = document.createElement("span");
      label.className = "snowmobile-visually-hidden";
      label.textContent = "snowAccount";
      accountLink.append(label);
      toolbar.insertBefore(accountLink, menu);
    }

    header.append(toolbar);
    document.addEventListener("pointerdown", (event) => {
      if (!toolbar.contains(event.target) && !menu.hidden) {
        menu.hidden = true;
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "Open menu");
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !menu.hidden) {
        menu.hidden = true;
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "Open menu");
        menuButton.focus();
      }
    });
  }

  function enhanceHome() {
    enhanceHomeHeader();
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
