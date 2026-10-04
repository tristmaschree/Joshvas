// Helpers for Canvas's left global navigation (#header / #menu).
// Canvas re-renders parts of the nav with React, so anything we insert is
// re-checked by `keep()` and put back if it gets removed.
JV.nav = (() => {
  const { util } = JV;

  function courseLink() {
    return (
      document.getElementById("global_nav_courses_link") ||
      document.querySelector("#header a[href='/courses'], nav a[href='/courses']")
    );
  }

  // The <li> (or equivalent wrapper) holding a nav link, directly inside the menu list.
  function itemFor(link) {
    if (!link) return null;
    return link.closest("li") || link.parentElement;
  }

  async function ready() {
    await util.waitFor("#global_nav_courses_link, #header a[href='/courses']", 15000);
    return itemFor(courseLink());
  }

  // Build a nav item that looks native by cloning an existing one's shell.
  function makeItem({ id, label, icon, onClick }) {
    const template =
      itemFor(document.getElementById("global_nav_calendar_link")) ||
      itemFor(document.getElementById("global_nav_dashboard_link")) ||
      itemFor(courseLink());
    const li = template.cloneNode(false);
    li.classList.remove("ic-app-header__menu-list-item--active");
    li.removeAttribute("id");
    const srcLink = template.querySelector("a");
    const a = util.h("a", {
      id,
      href: "#",
      class: (srcLink?.className || "ic-app-header__menu-list-link").replace(/\bactive\b/g, ""),
      role: "button",
      "aria-label": label,
    });
    const iconWrap = util.h("div", { class: "menu-item-icon-container", "aria-hidden": "true" }, util.svg(icon));
    const text = util.h("div", { class: "menu-item__text" }, label);
    a.append(iconWrap, text);
    a.addEventListener("click", (e) => {
      e.preventDefault();
      onClick(e);
    });
    li.append(a);
    return li;
  }

  // Insert `el` after `anchorFn()` and keep it there across React re-renders.
  function keep(el, anchorFn) {
    const place = () => {
      if (el.isConnected) return;
      const anchor = anchorFn();
      if (anchor?.parentNode) anchor.after(el);
    };
    place();
    const header = document.getElementById("header") || document.body;
    let queued = false;
    new MutationObserver(() => {
      if (queued || el.isConnected) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        place();
      });
    }).observe(header, { childList: true, subtree: true });
  }

  function headerRight() {
    const header = document.getElementById("header");
    return header ? header.getBoundingClientRect().right : 0;
  }

  // Instant tooltip to the right of the nav, matching Canvas's own nav tooltips.
  // (A fixed element on <body>, since the course list scrolls and would clip it.)
  let tip;
  function tooltip(el, text) {
    const show = () => {
      tip ||= document.body.appendChild(util.h("div", { class: "jv-tip", role: "tooltip" }));
      tip.textContent = text;
      const r = el.getBoundingClientRect();
      tip.style.left = `${headerRight() + 10}px`;
      tip.style.top = `${r.top + r.height / 2}px`;
      tip.hidden = false;
    };
    const hide = () => tip && (tip.hidden = true);
    el.addEventListener("mouseenter", show);
    el.addEventListener("focus", show);
    el.addEventListener("mouseleave", hide);
    el.addEventListener("blur", hide);
    el.addEventListener("click", hide);
  }

  return { courseLink, itemFor, ready, makeItem, keep, headerRight, tooltip };
})();
