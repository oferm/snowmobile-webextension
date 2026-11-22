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
