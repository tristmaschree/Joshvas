# Joshvas

A Chrome extension that makes Canvas (`*.instructure.com`) faster and nicer to use.

## Features

| Feature | What it does |
| --- | --- |
| **Snappy mode** | Collapses Canvas/InstUI animations and transitions so trays and menus open instantly. |
| **Preload on hover** | Prerenders course sections, dashboard, calendar, grades and inbox when you hover a link, so the click feels instant. Individual assignments, pages, discussions, module items, LTI tools and downloads are never preloaded — Canvas would count that as a view. |
| **Tree sidebar** | Canvas's icon strip and the per-course menu merged into one wide, VS Code-style sidebar: Courses and Groups are folders, each course expands to its sections. The arrow at the bottom collapses it back to the icon strip. |
| **Courses in sidebar** | Your dashboard courses, in their colors, always visible in the left nav with a count of items due in the next 48h. Cached, so it shows immediately. |
| **Due panel** | A "Due" nav item listing everything due across all courses — overdue, today, tomorrow, next 7 days, later — with countdowns, status chips and mark-as-done (syncs with Canvas's planner). |
| **Command palette** | <kbd>⌘K</kbd> / <kbd>Ctrl+K</kbd> to fuzzy-jump to any course, section, assignment, page, module item, file or upcoming due item. |
| **Dashboard card extras** | Current grade and next due item on each course card. |

Each feature can be toggled from the toolbar popup.

> Built and tested on Yale's Canvas (`yale.instructure.com`) as a student. It should work on other `*.instructure.com` schools, but layouts and course-code formats vary — if something looks off, switch that feature off in the popup.

## Install (unpacked)

1. Open `chrome://extensions` and turn on **Developer mode**.
2. Click **Load unpacked** and pick this folder.
3. Reload any open Canvas tabs.

After editing code, click the reload icon on the extension's card, then reload Canvas.

## Layout

```
manifest.json
src/boot.js            document_start: applies snappy mode without a flash
src/core/              settings, API client, SWR cache, shared data, nav helpers
src/features/          one file per feature
src/styles/            snappy.css (animations), polish.css (Canvas restyling),
                       tree.css (tree sidebar layout), content.css (injected UI)
popup/                 settings popup
dev/                   mock Canvas harness (python3 dev/serve.py → /dev/harness.html)
```

Data comes from the Canvas REST API using your existing session, cached in `chrome.storage.local` and refreshed in the background (stale-while-revalidate).
