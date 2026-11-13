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
