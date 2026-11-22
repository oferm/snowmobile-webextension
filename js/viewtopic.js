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
