// Runs at document_start, before Canvas paints. Styles that are on by default
// (snappy.css, polish.css) are only switched off here if the user disabled
// them, and the tree sidebar's layout class is set up front, so there's no
// flash of the stock layout on each page load.
chrome.storage.sync.get(
  { snappy: true, polish: true, sidebarTree: true, treeCollapsed: false },
  ({ snappy, polish, sidebarTree, treeCollapsed }) => {
    const cl = document.documentElement.classList;
    if (!snappy) cl.add("jv-no-snappy");
    if (!polish) cl.add("jv-no-polish");
    if (sidebarTree && !treeCollapsed) cl.add("jv-tree");
  }
);
