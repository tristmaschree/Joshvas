(async () => {
  // Skip frames (LTI tools, file previews) and non-HTML pages.
  if (window.top !== window || !document.body) return;

  const settings = await JV.loadSettings();
  const f = JV.features;
  const run = (name, fn) => Promise.resolve().then(fn).catch((e) => console.warn(`[Easel] ${name} failed`, e));

  run("preload", () => f.preload.init(settings));
  if (settings.sidebarCourses) run("sidebarCourses", () => f.sidebarCourses.init());
  if (settings.sidebarTree) run("sidebarTree", () => f.sidebarTree.init());
  if (settings.duePanel) run("duePanel", () => f.due.init(settings));
  if (settings.palette) run("palette", () => f.palette.init());
  if (settings.dashboardCards) run("dashboardCards", () => f.dashboardCards.init());

  // Snappy mode and polish can be toggled live; the rest apply on next page load.
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "sync") return;
    for (const key of ["snappy", "polish"]) {
      if (changes[key]) document.documentElement.classList.toggle(`jv-no-${key}`, !changes[key].newValue);
    }
  });
})();
