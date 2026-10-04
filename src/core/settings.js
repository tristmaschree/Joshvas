globalThis.JV = globalThis.JV || {};
JV.features = {};

JV.DEFAULTS = {
  snappy: true,
  polish: true,
  preload: "prerender", // "prerender" | "prefetch" | "off"
  sidebarCourses: true,
  sidebarTree: true,
  treeCollapsed: false, // set by the collapse arrow at the bottom of the nav
  palette: true,
  duePanel: true,
  dashboardCards: true,
  showCompleted: false,
};

JV.loadSettings = () =>
  new Promise((resolve) => chrome.storage.sync.get(JV.DEFAULTS, resolve));

JV.saveSetting = (key, value) => chrome.storage.sync.set({ [key]: value });
