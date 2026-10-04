// Preload Canvas "index" pages when you hover a link, using Chrome's
// Speculation Rules API. With prerender, the page (JS included) is fully
// rendered in the background, so clicking swaps it in instantly.
//
// Only navigation/index pages are allowlisted. Individual pages, assignments,
// discussions, module items, LTI tools and file downloads are NOT preloaded,
// because Canvas records a view (marking "must view" module requirements done,
// marking discussions read, consuming LTI launch tokens) the moment the server
// sees the request — hovering shouldn't do that.
JV.features.preload = (() => {
  const TABS = "assignments|modules|grades|pages|files|announcements|discussion_topics|quizzes|users|outcomes|collaborations";
  const ALLOW = [
    "/",
    "/courses",
    "/calendar",
    "/grades",
    "/conversations",
    "/courses/:id(\\d+)",
    `/courses/:id(\\d+)/:tab(${TABS})`,
    "/courses/:id(\\d+)/assignments/syllabus",
  ];

  function speculationRules(action) {
    return {
      [action]: [
        {
          source: "document",
          where: {
            and: [
              { or: ALLOW.map((p) => ({ href_matches: p })) },
              { not: { selector_matches: "[data-method], [download], [target=_blank], [href*='download']" } },
            ],
          },
          eagerness: "moderate", // ~200ms hover or pointerdown
        },
      ],
    };
  }

  // Manual fallback if the page's CSP blocks inline speculation rules.
  function hoverPrefetch() {
    const patterns = ALLOW.map((p) => new URLPattern({ pathname: p, baseURL: location.origin }));
    const done = new Set();
    let timer;
    document.addEventListener("mouseover", (e) => {
      const a = e.target.closest?.("a[href]");
      if (!a || a.target === "_blank" || a.hasAttribute("download") || a.dataset.method) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || done.has(url.href)) return;
      if (!patterns.some((p) => p.test(url.href))) return;
      clearTimeout(timer);
      timer = setTimeout(() => {
        done.add(url.href);
        document.head.append(JV.util.h("link", { rel: "prefetch", href: url.href }));
      }, 120);
    });
  }

  function init(settings) {
    if (settings.preload === "off") return;
    if (!HTMLScriptElement.supports?.("speculationrules")) return hoverPrefetch();

    const script = document.createElement("script");
    script.type = "speculationrules";
    script.textContent = JSON.stringify(speculationRules(settings.preload));

    let blocked = false;
    const onViolation = (e) => {
      if (!blocked && e.violatedDirective?.startsWith("script-src")) {
        blocked = true;
        hoverPrefetch();
      }
    };
    document.addEventListener("securitypolicyviolation", onViolation);
    setTimeout(() => document.removeEventListener("securitypolicyviolation", onViolation), 3000);
    document.head.append(script);
  }

  return { init };
})();
