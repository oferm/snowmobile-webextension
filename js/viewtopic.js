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
