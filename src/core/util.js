JV.util = (() => {
  // Tiny element builder: h("div", { class: "x", onclick: fn }, child, "text")
  function h(tag, attrs, ...children) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
      else if (k === "style" && typeof v === "object") {
        for (const [p, val] of Object.entries(v)) {
          if (val != null) el.style.setProperty(p.replace(/[A-Z]/g, "-$&").toLowerCase(), val);
        }
      } else el.setAttribute(k, v === true ? "" : v);
    }
    for (const c of children.flat()) {
      if (c == null || c === false) continue;
      el.append(c instanceof Node ? c : String(c));
    }
    return el;
  }

  function svg(markup) {
    const t = document.createElement("template");
    t.innerHTML = markup.trim();
    return t.content.firstChild;
  }

  // Resolves once `selector` exists, or null after `timeout` ms.
  function waitFor(selector, timeout = 10000, root = document) {
    const found = root.querySelector(selector);
    if (found) return Promise.resolve(found);
    return new Promise((resolve) => {
      const obs = new MutationObserver(() => {
        const el = root.querySelector(selector);
        if (el) {
          obs.disconnect();
          resolve(el);
        }
      });
      obs.observe(root === document ? document.documentElement : root, {
        childList: true,
        subtree: true,
      });
      setTimeout(() => {
        obs.disconnect();
        resolve(null);
      }, timeout);
    });
  }

  function currentCourseId() {
    const m = location.pathname.match(/^\/courses\/(\d+)/);
    return m ? m[1] : null;
  }

  const COURSE_NUMBER = /\b([A-Z&]{2,6})\s*[-_ ]?\s*(\d{3,4}[A-Z]?)\b/;

  // Whether a course code looks like a real class ("CPSC 2010 01") rather than
  // an org site ("Course Placement 2026", "Yale 101").
  function isClassCode(code) {
    return COURSE_NUMBER.test(code || "");
  }

  // "CPSC 2010 01 (FA26): Intro to CS" -> "CPSC 2010"
  function shortCode(code) {
    if (!code) return "";
    const m = code.match(COURSE_NUMBER);
    if (m) return `${m[1]} ${m[2]}`;
    return code.split(/[:(]/)[0].trim(); // CSS clamps long labels to two lines
  }

  const MIN = 60e3, HOUR = 60 * MIN, DAY = 24 * HOUR;

  function relTime(date, now = Date.now()) {
    const diff = date - now;
    const abs = Math.abs(diff);
    let s;
    if (abs < HOUR) s = `${Math.max(1, Math.round(abs / MIN))}m`;
    else if (abs < 2 * DAY) s = `${Math.round(abs / HOUR)}h`;
    else s = `${Math.round(abs / DAY)}d`;
    return diff >= 0 ? `in ${s}` : `${s} ago`;
  }

  function fmtDue(date) {
    const today = startOfDay(new Date());
    const d = startOfDay(date);
    const days = Math.round((d - today) / DAY);
    const time = date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    if (days === 0) return `Today ${time}`;
    if (days === 1) return `Tomorrow ${time}`;
    if (days === -1) return `Yesterday ${time}`;
    if (days > 1 && days < 7)
      return `${date.toLocaleDateString([], { weekday: "short" })} ${time}`;
    return `${date.toLocaleDateString([], { month: "short", day: "numeric" })} ${time}`;
  }

  function startOfDay(d) {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  }

  // Run async tasks with at most `limit` in flight.
  async function pool(items, limit, fn) {
    const results = new Array(items.length);
    let i = 0;
    const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (i < items.length) {
        const idx = i++;
        try {
          results[idx] = await fn(items[idx], idx);
        } catch (e) {
          results[idx] = undefined;
        }
      }
    });
    await Promise.all(workers);
    return results;
  }

  function stripHtml(s) {
    return (s || "").replace(/<[^>]*>/g, "").trim();
  }

  return { h, svg, waitFor, currentCourseId, isClassCode, shortCode, relTime, fmtDue, startOfDay, pool, stripHtml, MIN, HOUR, DAY };
})();
