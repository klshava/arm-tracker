/* ============ Small helpers ============ */
function toDateStr(d) { const y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,"0"), day=String(d.getDate()).padStart(2,"0"); return `${y}-${m}-${day}`; }
function todayStr() { return toDateStr(new Date()); }
function formatMoney(n) { return "$" + Number(n).toFixed(2); }
function escapeHtml(str) { const d = document.createElement("div"); d.textContent = str ?? ""; return d.innerHTML; }
function ringSvg(pct, color, size = 30) {
  const r = size / 2 - 3, c = 2 * Math.PI * r, offset = c * (1 - Math.min(Math.max(pct, 0), 1));
  return `<svg class="day-ring" viewBox="0 0 ${size} ${size}">
    <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="var(--fill)" stroke-width="4"/>
    <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${color}" stroke-width="4" stroke-linecap="round"
      stroke-dasharray="${c}" stroke-dashoffset="${offset}" transform="rotate(-90 ${size/2} ${size/2})"/>
  </svg>`;
}
let toastTimer;
function toast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg; el.classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add("hidden"), 2200);
}
function openSheet(title, bodyHtml) {
  const overlay = document.createElement("div");
  overlay.className = "sheet-overlay";
  overlay.innerHTML = `<div class="sheet"><div class="sheet-handle"></div><h2 class="sheet-title">${title}</h2>${bodyHtml}</div>`;
  overlay.addEventListener("click", (e) => { if (e.target === overlay) closeSheet(overlay); });
  document.body.appendChild(overlay);
  return overlay;
}
function closeSheet(overlay) { overlay.remove(); }

/* ============ Lock screen flow ============ */
document.addEventListener("DOMContentLoaded", initLock);

function initLock() {
  if (Auth.hasSecret() && Auth.isUnlockedThisSession()) {
    document.getElementById("lock-screen").classList.add("hidden");
    boot();
    return;
  }
  document.getElementById("lock-screen").classList.remove("hidden");
  Auth.hasSecret() ? showVerify() : showSetup();
}

function showSetup() {
  document.getElementById("lock-setup").classList.remove("hidden");
  document.getElementById("lock-verify").classList.add("hidden");
  const secret = Auth.generateSecret();
  document.getElementById("secret-display").textContent = secret;
  const qrEl = document.getElementById("qr-code");
  qrEl.innerHTML = "";
  if (window.QRCode) {
    const uri = `otpauth://totp/Arms%20Tracker?secret=${secret}&issuer=Arms%20Tracker&algorithm=SHA1&digits=6&period=30`;
    new QRCode(qrEl, { text: uri, width: 160, height: 160, correctLevel: QRCode.CorrectLevel.M });
  }
  document.getElementById("btn-copy-secret").addEventListener("click", () => {
    navigator.clipboard.writeText(secret).then(() => toast("Key copied"));
  });
  const errorEl = document.getElementById("setup-error");
  const check = async (code) => {
    const ok = await Auth.verify(secret, code);
    if (ok) {
      Auth.saveSecret(secret);
      Auth.markUnlocked();
      document.getElementById("lock-screen").classList.add("hidden");
      boot();
    } else {
      errorEl.textContent = "That code didn't match — check your phone's clock and try again.";
      Auth.clearOtpInputs(inputs);
    }
  };
  const inputs = Auth.buildOtpInputs(document.getElementById("setup-otp-inputs"), check);
  document.getElementById("btn-confirm-setup").addEventListener("click", () => check(inputs.map(i => i.value).join("")));
}

function showVerify() {
  document.getElementById("lock-setup").classList.add("hidden");
  document.getElementById("lock-verify").classList.remove("hidden");
  const secret = Auth.getSecret();
  const errorEl = document.getElementById("verify-error");
  const check = async (code) => {
    const ok = await Auth.verify(secret, code);
    if (ok) {
      Auth.markUnlocked();
      document.getElementById("lock-screen").classList.add("hidden");
      boot();
    } else {
      errorEl.textContent = "Incorrect code — try again.";
      Auth.clearOtpInputs(inputs);
    }
  };
  const inputs = Auth.buildOtpInputs(document.getElementById("verify-otp-inputs"), check);
  document.getElementById("btn-reset-lock").addEventListener("click", () => {
    if (confirm("This resets your lock so you can set up a new authenticator code. Your tracked data stays on this device. Continue?")) {
      Auth.resetSecret();
      location.reload();
    }
  });
}

/* ============ App boot & navigation ============ */
async function boot() {
  Store.ensureSeeded();
  if (Sync.isConnected()) {
    try { await Sync.loadFromRemote(); } catch (e) { toast("Sync: " + e.message); }
  }
  document.getElementById("app").classList.remove("hidden");
  document.querySelectorAll(".tab-btn").forEach(b => b.addEventListener("click", () => showView(b.dataset.view)));
  wireSettings();
  showView("groceries");
}

const VIEW_TITLES = { groceries: "Groceries", training: "Training", recipes: "Recipes", supplements: "Supplements", tracking: "Tracking", calendar: "Calendar" };
const VIEW_RENDERERS = {}; // populated below by each render function block

function showView(name) {
  document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
  document.getElementById("view-" + name).classList.add("active");
  document.querySelectorAll(".tab-btn").forEach(b => b.classList.toggle("active", b.dataset.view === name));
  document.getElementById("topbar-title").textContent = VIEW_TITLES[name];
  VIEW_RENDERERS[name]();
}

function wireSettings() {
  const sheet = document.getElementById("settings-sheet");
  document.getElementById("btn-settings").addEventListener("click", () => sheet.classList.remove("hidden"));
  document.getElementById("btn-close-settings").addEventListener("click", () => sheet.classList.add("hidden"));
  wireSync();
  document.getElementById("btn-export").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(Store.exportAll(), null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `arms-tracker-backup-${todayStr()}.json`;
    a.click();
    toast("Backup downloaded");
  });
  document.getElementById("import-file").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      Store.importAll(JSON.parse(await file.text()));
      toast("Data imported");
      sheet.classList.add("hidden");
      showView("groceries");
    } catch (err) { toast("Could not read that file"); }
  });
  document.getElementById("btn-clear-data").addEventListener("click", () => {
    if (confirm("This erases all tracked data on this device (groceries, training log, tracking entries, supplements log). This cannot be undone. Continue?")) {
      Store.clearAllData();
      toast("Data erased");
      sheet.classList.add("hidden");
      showView("groceries");
    }
  });
}

function wireSync() {
  const statusEl = document.getElementById("sync-status");
  const connectForm = document.getElementById("sync-connect-form");
  const connectedActions = document.getElementById("sync-connected-actions");
  const tokenInput = document.getElementById("gh-pat-input");

  function refreshUI(statusText) {
    const connected = Sync.isConnected();
    connectForm.classList.toggle("hidden", connected);
    connectedActions.classList.toggle("hidden", !connected);
    statusEl.textContent = statusText || (connected ? "Connected — synced across your devices." : "Not connected — data stays on this device only.");
  }
  refreshUI();

  window.addEventListener("sync-start", () => { statusEl.textContent = "Syncing…"; });
  window.addEventListener("sync-done", () => { statusEl.textContent = "Synced just now."; });
  window.addEventListener("sync-error", (e) => { statusEl.textContent = "Sync error: " + e.detail; });

  document.getElementById("btn-gh-connect").addEventListener("click", async () => {
    const token = tokenInput.value.trim();
    if (!token) return;
    statusEl.textContent = "Connecting…";
    try {
      await Sync.connect(token);
      tokenInput.value = "";
      refreshUI("Connected — synced across your devices.");
      toast("Cloud sync connected");
      showView(document.querySelector(".tab-btn.active")?.dataset.view || "groceries");
    } catch (e) {
      refreshUI("Connection failed: " + e.message);
    }
  });

  document.getElementById("btn-gh-sync-now").addEventListener("click", async () => {
    statusEl.textContent = "Syncing…";
    try {
      await Sync.loadFromRemote();
      await Sync.flush();
      refreshUI("Synced just now.");
      showView(document.querySelector(".tab-btn.active")?.dataset.view || "groceries");
    } catch (e) {
      refreshUI("Sync error: " + e.message);
    }
  });

  document.getElementById("btn-gh-disconnect").addEventListener("click", () => {
    if (confirm("Disconnects this device from cloud sync. Your data on GitHub stays put; this device keeps its local copy. Continue?")) {
      Sync.disconnect();
      refreshUI();
      toast("Disconnected");
    }
  });
}

/* ============ GROCERIES ============ */
VIEW_RENDERERS.groceries = function renderGroceries() {
  const el = document.getElementById("view-groceries");
  const items = Store.getGroceries();
  const stores = [...new Set(items.map(i => i.store))];
  let html = "";
  stores.forEach(store => {
    html += `<div class="section-label">${escapeHtml(store)}</div><div class="list-group">`;
    items.filter(i => i.store === store).forEach(i => {
      html += `<button class="list-row" data-log-price="${i.id}">
        <div class="list-row-main">
          <span class="name">${escapeHtml(i.name)}</span>
          <span class="list-row-sub">${escapeHtml(i.category)}${i.estimate ? " · estimate" : ""} · checked ${i.checkedOn}</span>
        </div>
        <span class="list-row-value">${formatMoney(i.price)}</span>
      </button>`;
    });
    html += `</div>`;
  });
  html += `<button class="btn btn-secondary" id="btn-add-grocery" style="margin-top:16px">+ Add item</button>`;
  el.innerHTML = html;
  el.querySelectorAll("[data-log-price]").forEach(btn => btn.addEventListener("click", () => openLogPriceSheet(btn.dataset.logPrice)));
  document.getElementById("btn-add-grocery").addEventListener("click", openAddGrocerySheet);
};

function openLogPriceSheet(id) {
  const item = Store.getGroceries().find(g => g.id === id);
  if (!item) return;
  const historyHtml = (item.history || []).slice(0, 5)
    .map(h => `<div class="list-row" style="cursor:default"><span>${h.date}</span><span class="list-row-value">${formatMoney(h.price)}</span></div>`)
    .join("");
  const body = `
    <p class="card-sub">${escapeHtml(item.name)} — currently ${formatMoney(item.price)} (checked ${item.checkedOn})</p>
    <div class="field"><label>New price</label><input type="number" step="0.01" id="lp-price" value="${item.price}"></div>
    <div class="field"><label>Date checked</label><input type="date" id="lp-date" value="${todayStr()}"></div>
    <button class="btn btn-primary" id="lp-save">Save price</button>
    ${historyHtml ? `<div class="section-label">Recent history</div><div class="list-group">${historyHtml}</div>` : ""}
  `;
  const sheet = openSheet("Log price", body);
  sheet.querySelector("#lp-save").addEventListener("click", () => {
    const price = parseFloat(sheet.querySelector("#lp-price").value);
    if (!price) { toast("Enter a valid price"); return; }
    Store.logPrice(id, price, sheet.querySelector("#lp-date").value || todayStr());
    closeSheet(sheet);
    VIEW_RENDERERS.groceries();
    toast("Price updated");
  });
}

function openAddGrocerySheet() {
  const body = `
    <div class="field"><label>Store</label><input type="text" id="ag-store" value="ALDI"></div>
    <div class="field"><label>Item name</label><input type="text" id="ag-name" placeholder="e.g. Pork Mince 500g"></div>
    <div class="field-row">
      <div class="field"><label>Category</label><input type="text" id="ag-cat" placeholder="Protein"></div>
      <div class="field"><label>Price</label><input type="number" step="0.01" id="ag-price" placeholder="0.00"></div>
    </div>
    <button class="btn btn-primary" id="ag-save">Add item</button>
  `;
  const sheet = openSheet("Add grocery item", body);
  sheet.querySelector("#ag-save").addEventListener("click", () => {
    const name = sheet.querySelector("#ag-name").value.trim();
    const price = parseFloat(sheet.querySelector("#ag-price").value);
    if (!name || !price) { toast("Add a name and price"); return; }
    Store.addGrocery({ store: sheet.querySelector("#ag-store").value.trim() || "Other", name, category: sheet.querySelector("#ag-cat").value.trim() || "Other", price, checkedOn: todayStr() });
    closeSheet(sheet);
    VIEW_RENDERERS.groceries();
    toast("Item added");
  });
}

/* ============ TRAINING ============ */
let trainingWeekOffset = 0;
const DOW_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
function getMonday(d) { const date = new Date(d); const day = (date.getDay() + 6) % 7; date.setDate(date.getDate() - day); date.setHours(0,0,0,0); return date; }

VIEW_RENDERERS.training = function renderTraining() {
  const el = document.getElementById("view-training");
  const monday = getMonday(new Date());
  monday.setDate(monday.getDate() + trainingWeekOffset * 7);
  const days = Array.from({length: 7}, (_, i) => { const d = new Date(monday); d.setDate(monday.getDate() + i); return d; });
  const weekLabel = `${days[0].toLocaleDateString("en-AU", {day:"numeric",month:"short"})} – ${days[6].toLocaleDateString("en-AU", {day:"numeric",month:"short"})}`;
  const log = Store.getTrainingLog();

  let html = `<div class="week-nav"><button id="week-prev">‹</button><span class="week-label">${weekLabel}</span><button id="week-next">›</button></div>`;

  days.forEach((d, i) => {
    const dateStr = toDateStr(d);
    const dow = DOW_NAMES[i];
    const program = TRAINING_PROGRAM[dow];
    const dayLog = log[dateStr] || { exercises: {} };
    const total = program.exercises.length;
    const done = program.exercises.filter(ex => dayLog.exercises[ex.id]).length;
    const isRest = total === 0;
    const pct = isRest ? 1 : (total ? done / total : 0);
    const isToday = dateStr === todayStr();

    html += `<div class="card day-card">
      <div class="day-card-head" data-toggle-day="${dateStr}">
        <div class="day-info">
          <div class="dow">${dow.toUpperCase()}${isToday ? " · TODAY" : ""} — ${d.toLocaleDateString("en-AU",{day:"numeric",month:"short"})}</div>
          <div class="workout">${program.title}</div>
        </div>
        ${ringSvg(pct, isRest ? "var(--label-3)" : "var(--green)")}
      </div>
      <div class="day-exercises${isToday ? " open" : ""}" id="ex-${dateStr}">
        ${isRest ? `<p class="card-sub">Rest day — light walk or stretch if you feel like it.</p>` :
          program.exercises.map(ex => {
            const loggedSet = dayLog.sets && dayLog.sets[ex.id];
            return `<div class="check-row">
            <div class="checkbox ${dayLog.exercises[ex.id] ? "checked" : ""}" data-toggle-ex="${dateStr}|${ex.id}">${dayLog.exercises[ex.id] ? "✓" : ""}</div>
            <div class="check-row-text ${dayLog.exercises[ex.id] ? "done" : ""}">${escapeHtml(ex.name)}<div class="sub">${ex.sets}${loggedSet ? ` · logged ${loggedSet.weight}kg × ${loggedSet.reps}` : ""}</div></div>
            <button class="guide-btn" type="button" data-guide="${escapeHtml(ex.name)}" data-guide-date="${dateStr}" data-guide-exid="${ex.id}" aria-label="How to do this exercise">ⓘ</button>
          </div>`;
          }).join("")}
      </div>
    </div>`;
  });
  el.innerHTML = html;

  document.getElementById("week-prev").addEventListener("click", () => { trainingWeekOffset--; VIEW_RENDERERS.training(); });
  document.getElementById("week-next").addEventListener("click", () => { trainingWeekOffset++; VIEW_RENDERERS.training(); });
  el.querySelectorAll("[data-toggle-day]").forEach(h => h.addEventListener("click", () => {
    document.getElementById("ex-" + h.dataset.toggleDay).classList.toggle("open");
  }));
  el.querySelectorAll("[data-toggle-ex]").forEach(cb => cb.addEventListener("click", (e) => {
    e.stopPropagation();
    const [dateStr, exId] = cb.dataset.toggleEx.split("|");
    Store.toggleExercise(dateStr, exId);
    VIEW_RENDERERS.training();
  }));
  el.querySelectorAll("[data-guide]").forEach(btn => btn.addEventListener("click", (e) => {
    e.stopPropagation();
    showExerciseGuide(btn.dataset.guide, btn.dataset.guideDate, btn.dataset.guideExid);
  }));
};

function formatShortDate(dateStr) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-AU", { day: "numeric", month: "short" });
}

function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 880;
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
    osc.onended = () => ctx.close();
  } catch (e) { /* Web Audio unavailable — silently skip the beep */ }
}

function showExerciseGuide(name, dateStr, exId) {
  const guide = EXERCISE_GUIDES[name];
  if (!guide) { toast("No guide for this one yet"); return; }
  const svg = PATTERN_SVGS[guide.pattern] || "";
  const hasLogContext = !!(dateStr && exId);
  const lastSet = hasLogContext ? Store.getLastExerciseSet(exId, dateStr) : null;
  const todaySet = hasLogContext ? (Store.getTrainingLog()[dateStr]?.sets || {})[exId] : null;

  const html = `
    <div class="guide-svg-wrap">${svg}</div>
    <p class="guide-muscles">${escapeHtml(guide.muscles)}</p>
    <div class="guide-block">
      <h3>Setup</h3>
      <p>${escapeHtml(guide.setup)}</p>
    </div>
    <div class="guide-block">
      <h3>How to do it</h3>
      <ul>${guide.cues.map(c => `<li>${escapeHtml(c)}</li>`).join("")}</ul>
    </div>
    <div class="guide-tip">💡 ${escapeHtml(guide.tip)}</div>
    ${hasLogContext ? `
    <div class="guide-block">
      <h3>Log today's set</h3>
      <p class="card-sub">${lastSet ? `Last time (${formatShortDate(lastSet.date)}): ${lastSet.weight}kg × ${lastSet.reps}` : "No previous log yet — this'll be your baseline."}</p>
      <div class="field-row">
        <div class="field"><label>Weight (kg)</label><input type="number" step="0.5" min="0" id="glog-weight" value="${todaySet ? todaySet.weight : ""}" placeholder="${lastSet ? lastSet.weight : "0"}"></div>
        <div class="field"><label>Reps</label><input type="number" step="1" min="0" id="glog-reps" value="${todaySet ? todaySet.reps : ""}" placeholder="${lastSet ? lastSet.reps : "0"}"></div>
      </div>
      <button class="btn btn-primary" id="btn-save-set">Save set</button>
    </div>` : ""}
    <div class="guide-block">
      <h3>Rest timer</h3>
      <div class="timer-display" id="timer-display">90</div>
      <div class="timer-presets">
        <button class="btn btn-secondary timer-preset" type="button" data-secs="60">60s</button>
        <button class="btn btn-secondary timer-preset active" type="button" data-secs="90">90s</button>
        <button class="btn btn-secondary timer-preset" type="button" data-secs="120">120s</button>
      </div>
      <button class="btn btn-primary" id="btn-timer-toggle" type="button">Start</button>
    </div>
    <button class="btn btn-secondary" id="btn-close-guide" style="margin-top:16px">Close</button>
  `;
  const sheet = openSheet(name, html);
  sheet.querySelector("#btn-close-guide").addEventListener("click", () => closeSheet(sheet));

  if (hasLogContext) {
    sheet.querySelector("#btn-save-set").addEventListener("click", () => {
      const weight = parseFloat(sheet.querySelector("#glog-weight").value);
      const reps = parseInt(sheet.querySelector("#glog-reps").value, 10);
      if (!weight || !reps) { toast("Enter weight and reps first"); return; }
      Store.logExerciseSet(dateStr, exId, weight, reps);
      Store.setExerciseDone(dateStr, exId, true);
      toast("Set logged");
      closeSheet(sheet);
      VIEW_RENDERERS.training();
    });
  }

  // ---- Rest timer ----
  let timerDuration = 90;
  let timerRemaining = 90;
  let timerRunning = false;
  let timerInterval = null;
  const display = sheet.querySelector("#timer-display");
  const toggleBtn = sheet.querySelector("#btn-timer-toggle");
  sheet.querySelectorAll(".timer-preset").forEach(btn => btn.addEventListener("click", () => {
    if (timerRunning) return;
    sheet.querySelectorAll(".timer-preset").forEach(b => b.classList.toggle("active", b === btn));
    timerDuration = timerRemaining = parseInt(btn.dataset.secs, 10);
    display.textContent = timerRemaining;
  }));
  toggleBtn.addEventListener("click", () => {
    if (timerRunning) {
      clearInterval(timerInterval);
      timerRunning = false;
      toggleBtn.textContent = "Start";
      return;
    }
    if (timerRemaining <= 0) timerRemaining = timerDuration;
    timerRunning = true;
    toggleBtn.textContent = "Pause";
    timerInterval = setInterval(() => {
      if (!document.body.contains(display)) { clearInterval(timerInterval); return; }
      timerRemaining--;
      display.textContent = timerRemaining;
      if (timerRemaining <= 0) {
        clearInterval(timerInterval);
        timerRunning = false;
        toggleBtn.textContent = "Start";
        playBeep();
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
        toast("Rest done — go again 💪");
      }
    }, 1000);
  });
}

/* ============ RECIPES ============ */
VIEW_RENDERERS.recipes = function renderRecipes() {
  const el = document.getElementById("view-recipes");
  const recipes = Store.getRecipes();
  let html = "";
  ["Breakfast", "Lunch", "Dinner", "Snack"].forEach(meal => {
    const items = recipes.filter(r => r.meal === meal);
    if (!items.length) return;
    html += `<div class="section-label">${meal}</div>`;
    items.forEach(r => {
      html += `<div class="card">
        <div class="card-title">${escapeHtml(r.name)}</div>
        <div class="card-sub">${r.kcal} kcal · ${r.protein}g protein</div>
        <div style="margin:8px 0">${r.tags.map(t => `<span class="badge">${t}</span>`).join("")}</div>
        <div style="font-size:14px;line-height:1.5">
          <strong>Ingredients:</strong> ${r.ingredients.map(escapeHtml).join(", ")}<br>
          <strong>Method:</strong> ${escapeHtml(r.method)}
        </div>
      </div>`;
    });
  });
  el.innerHTML = html;
};

/* ============ SUPPLEMENTS ============ */
VIEW_RENDERERS.supplements = function renderSupplements() {
  const el = document.getElementById("view-supplements");
  const sups = Store.getSupplements();
  const date = todayStr();
  const takenToday = new Set((Store.getSupplementLog()[date] || []));
  const streak = computeSupplementStreak();

  let html = `<div class="card" style="text-align:center">
      <div style="font-size:28px;font-weight:800">${streak}</div>
      <div class="card-sub" style="margin:0">day streak — all supplements taken</div>
    </div>
    <div class="section-label">Today — ${new Date().toLocaleDateString("en-AU",{weekday:"long",day:"numeric",month:"long"})}</div>
    <div class="list-group">`;
  sups.forEach(s => {
    const done = takenToday.has(s.id);
    html += `<div class="check-row">
      <div class="checkbox ${done ? "checked" : ""}" data-toggle-sup="${s.id}">${done ? "✓" : ""}</div>
      <div class="check-row-text ${done ? "done" : ""}">${escapeHtml(s.name)}<div class="sub">${escapeHtml(s.timing)}</div></div>
      <button class="guide-btn" type="button" data-manage-sup="${s.id}" aria-label="Edit or remove this supplement">⋯</button>
    </div>`;
  });
  html += `</div>
    <button class="btn btn-secondary" id="btn-add-supplement" style="margin-top:16px">+ Add supplement</button>`;
  el.innerHTML = html;
  el.querySelectorAll("[data-toggle-sup]").forEach(cb => cb.addEventListener("click", () => {
    Store.toggleSupplement(date, cb.dataset.toggleSup);
    VIEW_RENDERERS.supplements();
  }));
  el.querySelectorAll("[data-manage-sup]").forEach(btn => btn.addEventListener("click", (e) => {
    e.stopPropagation();
    openManageSupplementSheet(btn.dataset.manageSup);
  }));
  document.getElementById("btn-add-supplement").addEventListener("click", openAddSupplementSheet);
};

function openAddSupplementSheet() {
  const body = `
    <div class="field"><label>Name</label><input type="text" id="as-name" placeholder="e.g. Fish oil"></div>
    <div class="field"><label>Timing</label><input type="text" id="as-timing" placeholder="e.g. Evening, with food"></div>
    <div class="field"><label>Note (optional)</label><input type="text" id="as-note" placeholder="e.g. Helps joint recovery"></div>
    <button class="btn btn-primary" id="as-save">Add supplement</button>
  `;
  const sheet = openSheet("Add supplement", body);
  sheet.querySelector("#as-save").addEventListener("click", () => {
    const name = sheet.querySelector("#as-name").value.trim();
    const timing = sheet.querySelector("#as-timing").value.trim();
    if (!name || !timing) { toast("Add a name and timing"); return; }
    Store.addSupplement({ name, timing, note: sheet.querySelector("#as-note").value.trim() || "" });
    closeSheet(sheet);
    VIEW_RENDERERS.supplements();
    toast("Supplement added");
  });
}

function openManageSupplementSheet(id) {
  const sup = Store.getSupplements().find(s => s.id === id);
  if (!sup) return;
  const body = `
    <p class="card-sub">${escapeHtml(sup.timing)}${sup.note ? ` — ${escapeHtml(sup.note)}` : ""}</p>
    <button class="btn btn-secondary danger" id="ms-delete">Remove supplement</button>
    <button class="btn btn-secondary" id="ms-close" style="margin-top:10px">Close</button>
  `;
  const sheet = openSheet(sup.name, body);
  sheet.querySelector("#ms-close").addEventListener("click", () => closeSheet(sheet));
  sheet.querySelector("#ms-delete").addEventListener("click", () => {
    if (confirm(`Remove "${sup.name}" from your supplements? This also clears it from past days you logged it.`)) {
      Store.deleteSupplement(id);
      closeSheet(sheet);
      VIEW_RENDERERS.supplements();
      toast("Supplement removed");
    }
  });
}

function computeSupplementStreak() {
  const sups = Store.getSupplements();
  const log = Store.getSupplementLog();
  if (!sups.length) return 0;
  let streak = 0;
  const d = new Date();
  const todayDone = sups.every(s => (log[toDateStr(d)] || []).includes(s.id));
  if (!todayDone) d.setDate(d.getDate() - 1);
  while (true) {
    const entries = log[toDateStr(d)] || [];
    if (!sups.every(s => entries.includes(s.id))) break;
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

/* ============ TRACKING ============ */
let trackingChart = null;
VIEW_RENDERERS.tracking = function renderTracking() {
  const el = document.getElementById("view-tracking");
  const entries = Store.getTrackingEntries();
  el.innerHTML = `
    <div class="card">
      <div class="card-title">Log today's numbers</div>
      <div class="field"><label>Date</label><input type="date" id="tk-date" value="${todayStr()}"></div>
      <div class="field-row">
        <div class="field"><label>Weight (kg)</label><input type="number" step="0.1" id="tk-weight" placeholder="90.0"></div>
        <div class="field"><label>Waist (cm)</label><input type="number" step="0.1" id="tk-waist" placeholder="optional"></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Left bicep (cm)</label><input type="number" step="0.1" id="tk-bl" placeholder="flexed"></div>
        <div class="field"><label>Right bicep (cm)</label><input type="number" step="0.1" id="tk-br" placeholder="flexed"></div>
      </div>
      <div class="field"><label>Notes</label><textarea id="tk-notes" placeholder="How did today feel?"></textarea></div>
      <button class="btn btn-primary" id="btn-save-tracking">Save entry</button>
    </div>
    <div class="chart-wrap"><canvas id="tk-chart" height="220"></canvas></div>
    <div class="section-label">History</div>
    <div class="list-group" id="tk-history"></div>
    <div class="section-label">Progress photos</div>
    <p class="card-sub" style="margin:0 4px 10px">Stored on this device only — not part of cloud sync — but included in Export all data backups.</p>
    <input type="file" id="photo-input" accept="image/*" capture="environment" class="hidden">
    <div class="photo-grid" id="photo-grid"></div>
    <button class="btn btn-secondary" id="btn-add-photo" style="margin-top:10px">+ Add photo</button>
  `;
  document.getElementById("btn-save-tracking").addEventListener("click", () => {
    const weight = parseFloat(document.getElementById("tk-weight").value);
    if (!weight) { toast("Enter your weight to save an entry"); return; }
    Store.addTrackingEntry({
      date: document.getElementById("tk-date").value || todayStr(),
      weight,
      waist: parseFloat(document.getElementById("tk-waist").value) || null,
      bicepL: parseFloat(document.getElementById("tk-bl").value) || null,
      bicepR: parseFloat(document.getElementById("tk-br").value) || null,
      notes: document.getElementById("tk-notes").value || ""
    });
    toast("Entry saved");
    VIEW_RENDERERS.tracking();
  });
  renderTrackingHistory(entries);
  renderTrackingChart(entries);
  renderPhotoGrid();
  document.getElementById("btn-add-photo").addEventListener("click", () => {
    document.getElementById("photo-input").click();
  });
  document.getElementById("photo-input").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const dataUrl = await resizeImageFile(file);
      Store.addPhoto({ date: todayStr(), dataUrl, note: "" });
      toast("Photo added");
      renderPhotoGrid();
    } catch (err) {
      toast("Couldn't save that photo — try a smaller image");
    }
    e.target.value = "";
  });
};

function resizeImageFile(file, maxDim = 1000, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxDim) { height = Math.round(height * maxDim / width); width = maxDim; }
        else if (height > maxDim) { width = Math.round(width * maxDim / height); height = maxDim; }
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function renderPhotoGrid() {
  const grid = document.getElementById("photo-grid");
  const photos = Store.getPhotos();
  if (!photos.length) {
    grid.innerHTML = `<p class="card-sub" style="grid-column:1/-1">No progress photos yet.</p>`;
    return;
  }
  grid.innerHTML = photos.map(p => `<div class="photo-cell" data-photo-id="${p.id}" style="background-image:url('${p.dataUrl}')"><span class="photo-cell-date">${formatShortDate(p.date)}</span></div>`).join("");
  grid.querySelectorAll("[data-photo-id]").forEach(cell => cell.addEventListener("click", () => {
    const photo = photos.find(p => p.id === cell.dataset.photoId);
    openPhotoViewer(photo);
  }));
}

function openPhotoViewer(photo) {
  const html = `
    <img src="${photo.dataUrl}" style="width:100%;border-radius:var(--radius-md);margin-bottom:14px">
    <p class="card-sub">${formatShortDate(photo.date)}</p>
    <button class="btn btn-secondary danger" id="btn-delete-photo">Delete photo</button>
    <button class="btn btn-secondary" id="btn-close-photo" style="margin-top:10px">Close</button>
  `;
  const sheet = openSheet("Progress photo", html);
  sheet.querySelector("#btn-close-photo").addEventListener("click", () => closeSheet(sheet));
  sheet.querySelector("#btn-delete-photo").addEventListener("click", () => {
    if (confirm("Delete this photo? This cannot be undone.")) {
      Store.deletePhoto(photo.id);
      closeSheet(sheet);
      renderPhotoGrid();
    }
  });
}

function renderTrackingHistory(entries) {
  const wrap = document.getElementById("tk-history");
  if (!entries.length) {
    wrap.outerHTML = `<div class="empty-state" id="tk-history"><div class="icon">📈</div>No entries yet — log your first weigh-in above.</div>`;
    return;
  }
  wrap.innerHTML = entries.map(e => {
    const armAvg = (e.bicepL && e.bicepR) ? ((e.bicepL + e.bicepR) / 2).toFixed(1) : (e.bicepL || e.bicepR || null);
    return `<div class="list-row" style="cursor:default">
      <div class="list-row-main"><span class="name">${e.date}</span>
      <span class="list-row-sub">${armAvg ? `arms avg ${armAvg}cm` : ""}${e.waist ? ` · waist ${e.waist}cm` : ""}</span></div>
      <span class="list-row-value">${e.weight}kg</span>
    </div>`;
  }).join("");
}

function renderTrackingChart(entries) {
  const ctx = document.getElementById("tk-chart");
  const sorted = [...entries].sort((a, b) => a.date < b.date ? -1 : 1);
  if (trackingChart) trackingChart.destroy();
  trackingChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: sorted.map(e => e.date),
      datasets: [
        { label: "Weight (kg)", data: sorted.map(e => e.weight), borderColor: "#007AFF", backgroundColor: "#007AFF", yAxisID: "y", tension: .3, pointRadius: 3 },
        { label: "Avg bicep (cm)", data: sorted.map(e => (e.bicepL && e.bicepR) ? (e.bicepL + e.bicepR) / 2 : (e.bicepL || e.bicepR || null)), borderColor: "#34C759", backgroundColor: "#34C759", yAxisID: "y1", tension: .3, pointRadius: 3, spanGaps: true }
      ]
    },
    options: {
      responsive: true,
      interaction: { mode: "index", intersect: false },
      scales: {
        y: { position: "left", title: { display: true, text: "kg" } },
        y1: { position: "right", title: { display: true, text: "cm" }, grid: { drawOnChartArea: false } }
      },
      plugins: { legend: { position: "bottom" } }
    }
  });
}

/* ============ CALENDAR ============ */
let calendarMonthOffset = 0;
VIEW_RENDERERS.calendar = function renderCalendar() {
  const el = document.getElementById("view-calendar");
  const base = new Date(); base.setDate(1); base.setMonth(base.getMonth() + calendarMonthOffset);
  const year = base.getFullYear(), month = base.getMonth();
  const monthLabel = base.toLocaleDateString("en-AU", { month: "long", year: "numeric" });
  const firstDow = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells = [];
  for (let i = firstDow - 1; i >= 0; i--) cells.push({ date: new Date(year, month - 1, daysInPrevMonth - i), muted: true });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ date: new Date(year, month, d), muted: false });
  while (cells.length % 7 !== 0) { const nd = new Date(cells[cells.length - 1].date); nd.setDate(nd.getDate() + 1); cells.push({ date: nd, muted: true }); }

  const trainingLog = Store.getTrainingLog();
  const supLog = Store.getSupplementLog();
  const sups = Store.getSupplements();
  const trackingDates = new Set(Store.getTrackingEntries().map(e => e.date));

  let html = ringsSection();
  html += `<div class="week-nav"><button id="cal-prev">‹</button><span class="week-label">${monthLabel}</span><button id="cal-next">›</button></div>
  <div class="cal-grid">
    ${["M","T","W","T","F","S","S"].map(d => `<div class="cal-dow">${d}</div>`).join("")}
    ${cells.map(c => {
      const dateStr = toDateStr(c.date);
      const dow = DOW_NAMES[(c.date.getDay() + 6) % 7];
      const program = TRAINING_PROGRAM[dow];
      const isRest = program.exercises.length === 0;
      const dayLog = trainingLog[dateStr];
      const trained = dayLog && !isRest && program.exercises.every(ex => dayLog.exercises[ex.id]);
      const supsDone = sups.length > 0 && (supLog[dateStr] || []).length === sups.length;
      const tracked = trackingDates.has(dateStr);
      const isToday = dateStr === todayStr();
      let dots = "";
      if (!isRest) dots += `<span class="cal-dot" style="background:${trained ? "var(--green)" : "var(--blue)"}"></span>`;
      if (supsDone) dots += `<span class="cal-dot" style="background:var(--orange)"></span>`;
      if (tracked) dots += `<span class="cal-dot" style="background:var(--purple)"></span>`;
      return `<div class="cal-cell ${c.muted ? "muted" : ""} ${isToday ? "today" : ""}" data-day="${dateStr}">${c.date.getDate()}<div class="cal-dots">${dots}</div></div>`;
    }).join("")}
  </div>
  <div class="rings-legend" style="margin-top:16px">
    <div class="legend-item"><span class="legend-dot" style="background:var(--green)"></span>Training completed</div>
    <div class="legend-item"><span class="legend-dot" style="background:var(--blue)"></span>Training scheduled, not done</div>
    <div class="legend-item"><span class="legend-dot" style="background:var(--orange)"></span>All supplements taken</div>
    <div class="legend-item"><span class="legend-dot" style="background:var(--purple)"></span>Weigh-in logged</div>
  </div>`;
  el.innerHTML = html;

  document.getElementById("cal-prev").addEventListener("click", () => { calendarMonthOffset--; VIEW_RENDERERS.calendar(); });
  document.getElementById("cal-next").addEventListener("click", () => { calendarMonthOffset++; VIEW_RENDERERS.calendar(); });
  el.querySelectorAll("[data-day]").forEach(cell => cell.addEventListener("click", () => openDayDetail(cell.dataset.day)));
};

function ringsSection() {
  const date = todayStr();
  const dow = DOW_NAMES[(new Date().getDay() + 6) % 7];
  const program = TRAINING_PROGRAM[dow];
  const trainingLog = Store.getTrainingLog()[date] || { exercises: {} };
  const total = program.exercises.length;
  const done = program.exercises.filter(ex => trainingLog.exercises[ex.id]).length;
  const trainPct = total === 0 ? 1 : done / total;
  const sups = Store.getSupplements();
  const supLog = Store.getSupplementLog()[date] || [];
  const supPct = sups.length ? supLog.length / sups.length : 0;
  const trackedToday = Store.getTrackingEntries().some(e => e.date === date) ? 1 : 0;

  return `<div class="card">
    <div class="card-title">Today</div>
    <div class="rings-wrap">
      ${bigRingsSvg([{ pct: trainPct, color: "#34C759" }, { pct: supPct, color: "#FF9500" }, { pct: trackedToday, color: "#AF52DE" }])}
      <div class="rings-legend">
        <div class="legend-item"><span class="legend-dot" style="background:#34C759"></span>Training ${total === 0 ? "(rest day)" : `${done}/${total}`}</div>
        <div class="legend-item"><span class="legend-dot" style="background:#FF9500"></span>Supplements ${supLog.length}/${sups.length}</div>
        <div class="legend-item"><span class="legend-dot" style="background:#AF52DE"></span>Weigh-in ${trackedToday ? "logged" : "not yet"}</div>
      </div>
    </div>
  </div>`;
}

function bigRingsSvg(rings) {
  let inner = "";
  rings.forEach((r, i) => {
    const radius = 42 - i * 13, c = 2 * Math.PI * radius, offset = c * (1 - Math.min(r.pct, 1));
    inner += `<circle cx="50" cy="50" r="${radius}" fill="none" stroke="var(--fill)" stroke-width="9"/>
      <circle cx="50" cy="50" r="${radius}" fill="none" stroke="${r.color}" stroke-width="9" stroke-linecap="round"
        stroke-dasharray="${c}" stroke-dashoffset="${offset}" transform="rotate(-90 50 50)"/>`;
  });
  return `<svg width="100" height="100" viewBox="0 0 100 100" style="flex-shrink:0">${inner}</svg>`;
}

function openDayDetail(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  const dow = DOW_NAMES[(d.getDay() + 6) % 7];
  const program = TRAINING_PROGRAM[dow];
  const trainingLog = Store.getTrainingLog()[dateStr] || { exercises: {} };
  const supLog = Store.getSupplementLog()[dateStr] || [];
  const sups = Store.getSupplements();
  const entry = Store.getTrackingEntries().find(e => e.date === dateStr);

  const body = `
    <p class="card-sub">${d.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" })}</p>
    <div class="card"><div class="card-title">${program.title}</div>
      ${program.exercises.length ? `<div class="card-sub">${program.exercises.filter(ex => trainingLog.exercises[ex.id]).length}/${program.exercises.length} exercises done</div>` : ""}</div>
    <div class="card"><div class="card-title">Supplements</div><div class="card-sub">${supLog.length}/${sups.length} taken</div></div>
    <div class="card"><div class="card-title">Tracking</div><div class="card-sub">${entry ? `${entry.weight}kg${entry.bicepL ? ` · L bicep ${entry.bicepL}cm` : ""}${entry.bicepR ? ` · R bicep ${entry.bicepR}cm` : ""}` : "No entry logged"}</div></div>
    <button class="btn btn-secondary" id="btn-close-day">Close</button>
  `;
  const sheet = openSheet("Day detail", body);
  sheet.querySelector("#btn-close-day").addEventListener("click", () => closeSheet(sheet));
}
