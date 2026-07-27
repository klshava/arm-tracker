/* Store — thin wrapper over localStorage. Every real device change lives here. */

const Store = (() => {
  const KEYS = {
    groceries: "att_groceries",
    recipes: "att_recipes",
    supplements: "att_supplements",
    supplementLog: "att_supplement_log",   // { "YYYY-MM-DD": ["s1","s4",...] }
    trainingLog: "att_training_log",       // { "YYYY-MM-DD": { exercises: {id:true}, dayDone: true } }
    trackingEntries: "att_tracking_entries", // [ {id,date,weight,bicepL,bicepR,waist,notes} ]
    photoLog: "att_photo_log"               // [ {id,date,dataUrl,note} ] — local-only, see note on addPhoto
  };

  let suppressSync = false;

  function get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }
  function set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
    if (!suppressSync && window.Sync) Sync.scheduleFlush();
  }

  function ensureSeeded() {
    if (!localStorage.getItem(KEYS.groceries)) set(KEYS.groceries, SEED_GROCERIES);
    if (!localStorage.getItem(KEYS.recipes)) set(KEYS.recipes, SEED_RECIPES);
    if (!localStorage.getItem(KEYS.supplements)) set(KEYS.supplements, SEED_SUPPLEMENTS);
    if (!localStorage.getItem(KEYS.supplementLog)) set(KEYS.supplementLog, {});
    if (!localStorage.getItem(KEYS.trainingLog)) set(KEYS.trainingLog, {});
    if (!localStorage.getItem(KEYS.trackingEntries)) set(KEYS.trackingEntries, []);
    if (!localStorage.getItem(KEYS.photoLog)) set(KEYS.photoLog, []);
  }

  // ---- Groceries ----
  const getGroceries = () => get(KEYS.groceries, []);
  const saveGroceries = (list) => set(KEYS.groceries, list);
  function addGrocery(item) {
    const list = getGroceries();
    item.id = "g" + Date.now();
    item.history = [];
    list.push(item);
    saveGroceries(list);
    return item;
  }
  function logPrice(id, newPrice, date) {
    const list = getGroceries();
    const item = list.find(g => g.id === id);
    if (!item) return;
    item.history = item.history || [];
    item.history.unshift({ price: item.price, date: item.checkedOn });
    item.price = newPrice;
    item.checkedOn = date;
    saveGroceries(list);
  }
  function deleteGrocery(id) {
    saveGroceries(getGroceries().filter(g => g.id !== id));
  }

  // ---- Recipes ----
  const getRecipes = () => get(KEYS.recipes, []);

  // ---- Supplements ----
  const getSupplements = () => get(KEYS.supplements, []);
  const getSupplementLog = () => get(KEYS.supplementLog, {});
  function toggleSupplement(dateStr, supId) {
    const log = getSupplementLog();
    const todays = new Set(log[dateStr] || []);
    if (todays.has(supId)) todays.delete(supId); else todays.add(supId);
    log[dateStr] = Array.from(todays);
    set(KEYS.supplementLog, log);
    return log[dateStr];
  }
  function addSupplement(sup) {
    const list = getSupplements();
    sup.id = "s" + Date.now();
    list.push(sup);
    set(KEYS.supplements, list);
    return sup;
  }
  function deleteSupplement(id) {
    set(KEYS.supplements, getSupplements().filter(s => s.id !== id));
    // Also drop it from any day's log so old entries don't reference a deleted supplement.
    const log = getSupplementLog();
    Object.keys(log).forEach(date => { log[date] = log[date].filter(sid => sid !== id); });
    set(KEYS.supplementLog, log);
  }

  // ---- Training ----
  const getTrainingLog = () => get(KEYS.trainingLog, {});
  function toggleExercise(dateStr, exId) {
    const log = getTrainingLog();
    log[dateStr] = log[dateStr] || { exercises: {}, dayDone: false };
    log[dateStr].exercises[exId] = !log[dateStr].exercises[exId];
    set(KEYS.trainingLog, log);
    return log[dateStr];
  }
  function setDayDone(dateStr, done) {
    const log = getTrainingLog();
    log[dateStr] = log[dateStr] || { exercises: {}, dayDone: false };
    log[dateStr].dayDone = done;
    set(KEYS.trainingLog, log);
  }
  function setExerciseDone(dateStr, exId, done) {
    const log = getTrainingLog();
    log[dateStr] = log[dateStr] || { exercises: {}, dayDone: false };
    log[dateStr].exercises[exId] = done;
    set(KEYS.trainingLog, log);
  }
  // Logs the working weight/reps used for an exercise on a given day —
  // one entry per exercise per day (the top set), not a full per-set log.
  function logExerciseSet(dateStr, exId, weight, reps) {
    const log = getTrainingLog();
    log[dateStr] = log[dateStr] || { exercises: {}, dayDone: false };
    log[dateStr].sets = log[dateStr].sets || {};
    log[dateStr].sets[exId] = { weight, reps };
    set(KEYS.trainingLog, log);
  }
  // Most recent logged weight/reps for this exercise before (not on) the given date.
  function getLastExerciseSet(exId, beforeDateStr) {
    const log = getTrainingLog();
    const dates = Object.keys(log)
      .filter(d => d < beforeDateStr && log[d].sets && log[d].sets[exId])
      .sort();
    if (!dates.length) return null;
    const last = dates[dates.length - 1];
    return { date: last, ...log[last].sets[exId] };
  }

  // ---- Tracking ----
  const getTrackingEntries = () => get(KEYS.trackingEntries, []).sort((a,b) => a.date < b.date ? 1 : -1);
  function addTrackingEntry(entry) {
    const list = get(KEYS.trackingEntries, []);
    entry.id = "t" + Date.now();
    // replace existing entry for same date if present
    const idx = list.findIndex(e => e.date === entry.date);
    if (idx >= 0) list[idx] = entry; else list.push(entry);
    set(KEYS.trackingEntries, list);
  }
  function deleteTrackingEntry(id) {
    set(KEYS.trackingEntries, get(KEYS.trackingEntries, []).filter(e => e.id !== id));
  }

  // ---- Progress photos ----
  // Deliberately excluded from cloud sync (see js/sync.js) — base64 photos would
  // blow past the GitHub Contents API's ~1MB payload limit and bloat commit
  // history. They're local-only, but included in manual Export/Import backups.
  const getPhotos = () => get(KEYS.photoLog, []).sort((a, b) => a.date < b.date ? 1 : -1);
  function addPhoto(photo) {
    suppressSync = true;
    const list = get(KEYS.photoLog, []);
    photo.id = "p" + Date.now();
    list.push(photo);
    set(KEYS.photoLog, list);
    suppressSync = false;
  }
  function deletePhoto(id) {
    suppressSync = true;
    set(KEYS.photoLog, get(KEYS.photoLog, []).filter(p => p.id !== id));
    suppressSync = false;
  }

  // ---- Export / Import ----
  function exportAll() {
    const dump = {};
    Object.values(KEYS).forEach(k => dump[k] = get(k, null));
    dump._exportedAt = new Date().toISOString();
    return dump;
  }
  function importAll(obj) {
    suppressSync = true;
    Object.values(KEYS).forEach(k => {
      if (obj[k] !== undefined) set(k, obj[k]);
    });
    suppressSync = false;
  }
  function clearAllData() {
    Object.values(KEYS).forEach(k => localStorage.removeItem(k));
    ensureSeeded();
  }

  return {
    KEYS, ensureSeeded,
    getGroceries, saveGroceries, addGrocery, logPrice, deleteGrocery,
    getRecipes,
    getSupplements, getSupplementLog, toggleSupplement, addSupplement, deleteSupplement,
    getTrainingLog, toggleExercise, setDayDone, setExerciseDone, logExerciseSet, getLastExerciseSet,
    getTrackingEntries, addTrackingEntry, deleteTrackingEntry,
    getPhotos, addPhoto, deletePhoto,
    exportAll, importAll, clearAllData
  };
})();
