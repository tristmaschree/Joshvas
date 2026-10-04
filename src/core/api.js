// Canvas REST API, called same-origin so the user's session cookie is used.
JV.api = (() => {
  function parse(text) {
    // Canvas prefixes some JSON responses with "while(1);" as XSSI protection.
    return JSON.parse(text.replace(/^while\(1\);/, "") || "null");
  }

  function nextLink(res) {
    const link = res.headers.get("Link") || "";
    const m = link.split(",").find((p) => /rel="next"/.test(p));
    return m ? m.match(/<([^>]+)>/)[1] : null;
  }

  async function request(url, opts = {}) {
    const res = await fetch(url, {
      credentials: "same-origin",
      ...opts,
      // string-ids: Canvas IDs can exceed Number.MAX_SAFE_INTEGER on sharded instances.
      headers: { Accept: "application/json+canvas-string-ids, application/json", ...(opts.headers || {}) },
    });
    if (!res.ok) {
      const err = new Error(`Canvas API ${res.status} for ${url}`);
      err.status = res.status;
      throw err;
    }
    return res;
  }

  // GET; follows pagination when `all` is set (capped at `maxPages`).
  async function get(path, { all = false, maxPages = 10 } = {}) {
    let url = path.startsWith("http") ? path : `/api/v1${path}`;
    const res = await request(url);
    let data = parse(await res.text());
    if (!all || !Array.isArray(data)) return data;
    let next = nextLink(res);
    for (let page = 1; next && page < maxPages; page++) {
      const r = await request(next);
      data = data.concat(parse(await r.text()));
      next = nextLink(r);
    }
    return data;
  }

  function csrfToken() {
    const m = document.cookie.match(/(?:^|;\s*)_csrf_token=([^;]+)/);
    return m ? decodeURIComponent(m[1]) : "";
  }

  async function send(method, path, body) {
    const res = await request(`/api/v1${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken(),
      },
      body: JSON.stringify(body),
    });
    return parse(await res.text());
  }

  return { get, send };
})();
