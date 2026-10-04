const form = document.getElementById("settings");
const status = document.getElementById("status");

if (!/Mac/.test(navigator.platform)) document.getElementById("mod").textContent = "Ctrl";

JV.loadSettings().then((s) => {
  for (const el of form.elements) {
    if (!(el.name in s)) continue;
    if (el.type === "checkbox") el.checked = s[el.name];
    else el.value = s[el.name];
  }
});

form.addEventListener("change", (e) => {
  const el = e.target;
  JV.saveSetting(el.name, el.type === "checkbox" ? el.checked : el.value);
  status.textContent = el.name === "snappy" || el.name === "polish" ? "Applied." : "Saved. Reload Canvas to apply.";
});

document.getElementById("clear").addEventListener("click", async () => {
  const all = await chrome.storage.local.get(null);
  const keys = Object.keys(all).filter((k) => k.startsWith("jv:") && !k.endsWith(":recents"));
  await chrome.storage.local.remove(keys);
  status.textContent = `Cleared ${keys.length} cached item${keys.length === 1 ? "" : "s"}.`;
});
