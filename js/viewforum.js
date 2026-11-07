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
