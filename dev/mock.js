// Stubs for chrome.* and the Canvas REST API, shaped like real responses.
(() => {
  const H = 3600e3, D = 24 * H, now = Date.now();
  const iso = (ms) => new Date(now + ms).toISOString();

  const courses = [
    { id: "101", name: "Data Structures and Programming Techniques", course_code: "CPSC 223 01 (FA26)", term: { name: "Fall 2026" } },
    { id: "102", name: "Linear Algebra", course_code: "MATH 225 02 (FA26)", term: { name: "Fall 2026" } },
    { id: "103", name: "Intro to Microeconomics", course_code: "ECON 110 01 (FA26)", term: { name: "Fall 2026" } },
    { id: "104", name: "Reading and Writing the Modern Essay", course_code: "ENGL 120 05 (FA26)", term: { name: "Fall 2026" } },
  ];
  const colors = { course_101: "#E71F63", course_102: "#0B874B", course_103: "#D97900", course_104: "#8F3E97" };

  const planner = [
    { plannable_type: "assignment", plannable_id: "1", course_id: "101", context_name: "CPSC 223", html_url: "/courses/101/assignments/1", plannable_date: iso(-2 * D), plannable: { title: "Problem Set 3", points_possible: 50 }, submissions: { submitted: false, missing: true }, planner_override: null },
    { plannable_type: "quiz", plannable_id: "2", course_id: "102", context_name: "MATH 225", html_url: "/courses/102/quizzes/2", plannable_date: iso(5 * H), plannable: { title: "Quiz 4: Eigenvalues", points_possible: 10 }, submissions: { submitted: false }, planner_override: null },
    { plannable_type: "assignment", plannable_id: "3", course_id: "103", context_name: "ECON 110", html_url: "/courses/103/assignments/3", plannable_date: iso(D + 3 * H), plannable: { title: "Problem Set 5: Elasticity", points_possible: 20 }, submissions: { submitted: true }, planner_override: null },
    { plannable_type: "discussion_topic", plannable_id: "4", course_id: "104", context_name: "ENGL 120", html_url: "/courses/104/discussion_topics/4", plannable_date: iso(3 * D), plannable: { title: "Response to Didion" }, submissions: { submitted: false }, planner_override: null },
    { plannable_type: "assignment", plannable_id: "5", course_id: "101", context_name: "CPSC 223", html_url: "/courses/101/assignments/5", plannable_date: iso(10 * D), plannable: { title: "Project 2: Hash Tables", points_possible: 100 }, submissions: { submitted: false }, planner_override: null },
    { plannable_type: "announcement", plannable_id: "6", course_id: "101", context_name: "CPSC 223", html_url: "/courses/101/discussion_topics/6", plannable_date: iso(-H), plannable: { title: "Office hours moved" } },
  ];

  const enrollments = [
    { course_id: "101", grades: { current_score: 91.35, current_grade: "A-" } },
    { course_id: "102", grades: { current_score: 87.2, current_grade: null } },
    { course_id: "103", grades: { current_score: null, current_grade: null } },
    { course_id: "104", grades: { current_score: 95, current_grade: "A" } },
  ];

  const perCourse = (id) => ({
    tabs: [
      { label: "Home", html_url: `/courses/${id}`, type: "internal" },
      { label: "Modules", html_url: `/courses/${id}/modules`, type: "internal" },
      { label: "Assignments", html_url: `/courses/${id}/assignments`, type: "internal" },
      { label: "Grades", html_url: `/courses/${id}/grades`, type: "internal" },
      { label: "Files", html_url: `/courses/${id}/files`, type: "internal", hidden: id === "104" },
      { label: "Gradescope", html_url: `/courses/${id}/external_tools/9`, type: "external" },
    ],
    assignments: [
      { name: `Problem Set 1 (${id})`, html_url: `/courses/${id}/assignments/11` },
      { name: `Midterm Review (${id})`, html_url: `/courses/${id}/assignments/12`, quiz_id: 5 },
    ],
    pages: [{ title: "Syllabus details", html_url: `/courses/${id}/pages/syllabus-details`, url: "syllabus-details" }],
    modules: [{ id: 7, name: "Week 3: Trees", items: [
      { type: "SubHeader", title: "Readings" },
      { type: "File", title: `Lecture 5 slides.pdf`, html_url: `/courses/${id}/modules/items/77` },
      { type: "Page", title: "Syllabus details", html_url: `/courses/${id}/modules/items/78` },
    ] }],
    files: [{ id: 900, display_name: "week3-notes.pdf" }],
  });

  const routes = [
    [/^\/api\/v1\/users\/self\/favorites\/courses/, () => courses],
    [/^\/api\/v1\/users\/self\/colors/, () => ({ custom_colors: colors })],
    [/^\/api\/v1\/planner\/items/, () => planner],
    [/^\/api\/v1\/users\/self\/enrollments/, () => enrollments],
    [/^\/api\/v1\/courses\/(\d+)\/(tabs|assignments|pages|modules|files)/, (m) => perCourse(m[1])[m[2]]],
    [/^\/api\/v1\/users\/self\/groups/, () => [{ id: "501", name: "PS4 Study Group" }]],
    [/^\/api\/v1\/groups\/(\d+)\/tabs/, (m) => [
      { label: "Home", html_url: `/groups/${m[1]}` },
      { label: "Discussions", html_url: `/groups/${m[1]}/discussion_topics` },
      { label: "Files", html_url: `/groups/${m[1]}/files` },
    ]],
    [/^\/api\/v1\/planner\/overrides/, (m, opts) => ({ id: "555", ...JSON.parse(opts.body || "{}") })],
  ];

  window.MOCK = { courses, colors, calls: [] };
  const realFetch = window.fetch;
  window.fetch = async (url, opts = {}) => {
    const path = new URL(url, location.origin).pathname;
    for (const [re, fn] of routes) {
      const m = path.match(re);
      if (m) {
        MOCK.calls.push(`${opts.method || "GET"} ${path}`);
        await new Promise((r) => setTimeout(r, 150));
        return new Response("while(1);" + JSON.stringify(fn(m, opts)), { status: 200, headers: { "Content-Type": "application/json" } });
      }
    }
    return realFetch(url, opts);
  };

  const areas = { sync: {}, local: {} };
  const listeners = [];
  const area = (name) => ({
    get(keys, cb) {
      const store = areas[name];
      let out = {};
      if (keys == null) out = { ...store };
      else if (typeof keys === "string") { if (keys in store) out[keys] = store[keys]; }
      else if (Array.isArray(keys)) keys.forEach((k) => k in store && (out[k] = store[k]));
      else for (const [k, def] of Object.entries(keys)) out[k] = k in store ? store[k] : def;
      out = structuredClone(out);
      if (cb) setTimeout(() => cb(out));
      return Promise.resolve(out);
    },
    set(obj) {
      const changes = {};
      for (const [k, v] of Object.entries(obj)) {
        changes[k] = { oldValue: areas[name][k], newValue: v };
        areas[name][k] = structuredClone(v);
      }
      listeners.forEach((l) => l(changes, name));
      return Promise.resolve();
    },
    remove(keys) {
      [].concat(keys).forEach((k) => delete areas[name][k]);
      return Promise.resolve();
    },
  });
  window.chrome = {
    storage: { sync: area("sync"), local: area("local"), onChanged: { addListener: (l) => listeners.push(l) } },
  };
  // Harness quirk: the page isn't in a frame, same as real Canvas.
})();
