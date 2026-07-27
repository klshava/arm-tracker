/* Sync — optional cross-device backend. When connected, the full Store dump
   lives at data/user-data.json in the GitHub repo, read/written via the
   Contents API using a personal access token kept only in this browser's
   localStorage. Writes are debounced so rapid local edits collapse into one
   commit instead of one per keystroke. */

const Sync = (() => {
  const PAT_KEY = "att_gh_pat";
  const OWNER = "klshava";
  const REPO = "arm-tracker";
  const PATH = "data/user-data.json";
  const BRANCH = "main";
  const FLUSH_DELAY_MS = 4000;

  let sha = null;
  let flushTimer = null;
  let syncing = false;

  function getToken() { return localStorage.getItem(PAT_KEY) || ""; }
  function setToken(t) { t ? localStorage.setItem(PAT_KEY, t) : localStorage.removeItem(PAT_KEY); }
  function isConnected() { return !!getToken(); }

  function b64Encode(str) {
    const bytes = new TextEncoder().encode(str);
    let binary = "";
    bytes.forEach(b => binary += String.fromCharCode(b));
    return btoa(binary);
  }
  function b64Decode(b64) {
    const binary = atob(b64.replace(/\n/g, ""));
    const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }

  function api(path, opts = {}) {
    return fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`, {
      ...opts,
      headers: {
        "Authorization": `Bearer ${getToken()}`,
        "Accept": "application/vnd.github+json",
        ...(opts.headers || {})
      }
    });
  }

  async function pull() {
    const res = await api(`${PATH}?ref=${BRANCH}`);
    if (res.status === 404) { sha = null; return null; }
    if (!res.ok) throw new Error(`Pull failed (${res.status})`);
    const json = await res.json();
    sha = json.sha;
    return JSON.parse(b64Decode(json.content));
  }

  async function push(data) {
    data._syncedAt = new Date().toISOString();
    const body = {
      message: `Sync ${data._syncedAt}`,
      content: b64Encode(JSON.stringify(data, null, 2)),
      branch: BRANCH
    };
    if (sha) body.sha = sha;
    let res = await api(PATH, { method: "PUT", body: JSON.stringify(body) });
    if (res.status === 409) {
      await pull();
      body.sha = sha;
      res = await api(PATH, { method: "PUT", body: JSON.stringify(body) });
    }
    if (!res.ok) throw new Error(`Push failed (${res.status})`);
    const json = await res.json();
    sha = json.content.sha;
  }

  // Photos are deliberately excluded — base64 images would blow past the
  // GitHub Contents API's ~1MB payload limit and bloat commit history.
  // They stay local-only (still included in manual Export/Import backups).
  function syncPayload() {
    const data = Store.exportAll();
    delete data[Store.KEYS.photoLog];
    return data;
  }

  async function flush() {
    if (!isConnected() || syncing) return;
    syncing = true;
    window.dispatchEvent(new CustomEvent("sync-start"));
    try {
      await push(syncPayload());
      window.dispatchEvent(new CustomEvent("sync-done"));
    } catch (e) {
      window.dispatchEvent(new CustomEvent("sync-error", { detail: e.message }));
    } finally {
      syncing = false;
    }
  }

  function scheduleFlush() {
    if (!isConnected()) return;
    clearTimeout(flushTimer);
    flushTimer = setTimeout(flush, FLUSH_DELAY_MS);
  }

  // Pulls remote data into the local store. Used on connect and app boot.
  async function loadFromRemote() {
    if (!isConnected()) return false;
    const remote = await pull();
    if (remote) Store.importAll(remote);
    return !!remote;
  }

  async function connect(token) {
    setToken(token);
    try {
      const remote = await pull();
      if (remote) {
        Store.importAll(remote);
      } else {
        await push(syncPayload()); // first-time: seed the remote file
      }
      return true;
    } catch (e) {
      setToken(null);
      throw e;
    }
  }

  function disconnect() {
    clearTimeout(flushTimer);
    setToken(null);
    sha = null;
  }

  // Best-effort immediate push when the tab is being hidden/closed.
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden" && flushTimer) {
      clearTimeout(flushTimer);
      flush();
    }
  });

  return { isConnected, getToken, connect, disconnect, scheduleFlush, flush, loadFromRemote };
})();
