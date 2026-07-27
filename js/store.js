/* Store — thin wrapper over localStorage. Every real device change lives here. */

const Store = (() => {
  const KEYS = {
    groceries: "att_groceries",
    recipes: "att_recipes",
    supplements: "att_supplements",
    supplementLog: "att_supplement_log",   // { "YYYY-MM-DD": ["s1","s4",...] }
    trainingLog: "att_training_log",       // { "YYYY-MM-DD": { exercises: {id:true}, dayDone: true } }
    trackingEntries: "att_tracking_entries" // [ {id,date,weight,bicepL,bicepR,waist,notes} ]
  };

  function get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }
  function set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function ensureSeeded() {
    if (!localStorage.getItem(KEYS.groceries)) set(KEYS.groceries, SEED_GROCERIES);
    if (!localStorage.getItem(KEYS.recipes)) set(KEYS.recipes, SEED_RECIPES);
    if (!localStorage.getItem(KEYS.supplements)) set(KEYS.supplements, SEED_SUPPLEMENTS);
    if (!localStorage.getItem(KEYS.supplementLog)) set(KEYS.supplementLog, {});
    if (!localStorage.getItem(KEYS.trainingLog)) set(KEYS.trainingLog, {});
    if (!localStorage.getItem(KEYS.trackingEntries)) set(KEYS.trackingEntries, []);
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

  // ---- Export / Import ----
  function exportAll() {
    const dump = {};
    Object.values(KEYS).forEach(k => dump[k] = get(k, null));
    dump._exportedAt = new Date().toISOString();
    return dump;
  }
  function importAll(obj) {
    Object.values(KEYS).forEach(k => {
      if (obj[k] !== undefined) set(k, obj[k]);
    });
  }
  function clearAllData() {
    Object.values(KEYS).forEach(k => localStorage.removeItem(k));
    ensureSeeded();
  }

  return {
    KEYS, ensureSeeded,
    getGroceries, saveGroceries, addGrocery, logPrice, deleteGrocery,
    getRecipes,
    getSupplements, getSupplementLog, toggleSupplement,
    getTrainingLog, toggleExercise, setDayDone,
    getTrackingEntries, addTrackingEntry, deleteTrackingEntry,
    exportAll, importAll, clearAllData
  };
})();
