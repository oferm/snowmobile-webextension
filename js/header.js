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
