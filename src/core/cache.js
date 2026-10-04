// Stale-while-revalidate cache backed by chrome.storage.local.
// Cached data is returned immediately (that's what makes things feel instant);
// stale entries are refreshed in the background and handed to `onFresh`.
JV.cache = (() => {
  const inflight = new Map();
  const k = (key) => `jv:${location.host}:${key}`;

  async function read(key) {
    const full = k(key);
    const got = await chrome.storage.local.get(full);
    return got[full] || null;
  }

  async function write(key, data) {
    await chrome.storage.local.set({ [k(key)]: { t: Date.now(), data } });
  }

  function refresh(key, fetcher) {
    if (inflight.has(key)) return inflight.get(key);
    const p = (async () => {
      try {
        const data = await fetcher();
        await write(key, data);
        return data;
      } finally {
        inflight.delete(key);
      }
    })();
    inflight.set(key, p);
    return p;
  }

  async function swr(key, maxAge, fetcher, onFresh) {
    const entry = await read(key);
    if (!entry) return refresh(key, fetcher);
    if (Date.now() - entry.t > maxAge) {
      refresh(key, fetcher)
        .then((fresh) => onFresh && onFresh(fresh))
        .catch((e) => console.warn("[Joshvas] refresh failed", key, e));
    }
    return entry.data;
  }

  // Always fetch; used after writes (e.g. marking an item done).
  const reload = refresh;

  async function patch(key, fn) {
    const entry = await read(key);
    if (entry) await write(key, fn(entry.data));
  }

  return { swr, reload, patch };
})();
