// Adds current grade and the next due item to each dashboard course card.
JV.features.dashboardCards = (() => {
  const { h, fmtDue, relTime } = JV.util;
  let grades = {};
  let nextDue = {};

  function computeNextDue(items) {
    const now = Date.now();
    const out = {};
    for (const it of items || []) {
      if (it.done || !it.courseId || new Date(it.due) < now) continue;
      const cur = out[it.courseId];
      if (!cur || new Date(it.due) < new Date(cur.due)) out[it.courseId] = it;
    }
    return out;
  }

  function courseIdOf(card) {
    const a = card.querySelector("a[href*='/courses/']");
    return a?.getAttribute("href").match(/\/courses\/(\d+)/)?.[1] || null;
  }

  function decorate(card) {
    const id = courseIdOf(card);
    if (!id) return;
    const g = grades[id];
    const due = nextDue[id];

    const gradeText =
      g && g.score != null ? `${Math.round(g.score * 10) / 10}%${g.grade && !/^\d/.test(g.grade) ? ` · ${g.grade}` : ""}` : null;

    const extra = h(
      "div",
      { class: "jv-card-extra" },
      gradeText ? h("span", { class: "jv-card-grade", title: "Current grade" }, gradeText) : null,
      due
        ? h(
            "a",
            { class: "jv-card-due", href: due.url, title: `${due.title} — ${fmtDue(new Date(due.due))}` },
            h("span", { class: "jv-card-due__title" }, due.title),
            h("span", { class: "jv-card-due__when" }, relTime(new Date(due.due)))
          )
        : h("span", { class: "jv-card-due jv-card-due--none" }, "Nothing due soon")
    );

    const existing = card.querySelector(".jv-card-extra");
    if (existing) existing.replaceWith(extra);
    else {
      const actions = card.querySelector(".ic-DashboardCard__action-container");
      actions ? actions.before(extra) : card.append(extra);
    }
  }

  function decorateAll() {
    document.querySelectorAll(".ic-DashboardCard").forEach(decorate);
  }

  async function init() {
    // Only the dashboard (/) shows course cards.
    if (location.pathname !== "/") return;
    // Canvas first renders empty placeholder cards (no links); wait for real ones.
    // In List View the cards never appear and this simply times out.
    const card = await JV.util.waitFor(".ic-DashboardCard a[href*='/courses/']", 15000);
    if (!card) return;

    const [g, items] = await Promise.all([
      JV.data.grades((fresh) => { grades = fresh; decorateAll(); }).catch(() => ({})),
      JV.data.plannerItems((fresh) => { nextDue = computeNextDue(fresh); decorateAll(); }).catch(() => []),
    ]);
    grades = g || {};
    nextDue = computeNextDue(items);
    decorateAll();

    // Canvas re-renders cards (e.g. switching dashboard views); re-apply as needed.
    let queued = false;
    new MutationObserver(() => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        document.querySelectorAll(".ic-DashboardCard").forEach((card) => {
          if (!card.querySelector(".jv-card-extra")) decorate(card);
        });
      });
    }).observe(document.getElementById("content") || document.body, { childList: true, subtree: true });
  }

  return { init };
})();
