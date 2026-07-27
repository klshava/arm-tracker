// Runs on the same GitHub Actions schedule as send-reminders.js. Polls Telegram
// for new messages and handles two commands:
//   "weight 89.4"  -> logs today's weigh-in
//   "done"         -> marks every exercise in today's program as done
//
// Writes go straight to data/user-data.json via the GitHub Contents API — the
// same file and the same mechanism js/sync.js uses from the browser — so a
// command sent from Telegram shows up next time the app syncs. That file is
// deliberately NOT tracked by local git (see .gitignore) to avoid clashing
// with normal code commits; this script respects that by never using git
// commit/push, only the API. The processed-message offset is persisted the
// same way, in data/telegram-offset.json.

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const REPO_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = "klshava";
const REPO = "arm-tracker";
const BRANCH = "main";

if (!BOT_TOKEN || !CHAT_ID || !REPO_TOKEN) {
  console.error("Missing TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, or GITHUB_TOKEN.");
  process.exit(1);
}

function b64Encode(str) { return Buffer.from(str, "utf8").toString("base64"); }
function b64Decode(str) { return Buffer.from(str, "base64").toString("utf8"); }

function ghApi(filePath, opts = {}) {
  return fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${filePath}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${REPO_TOKEN}`,
      Accept: "application/vnd.github+json",
      ...(opts.headers || {})
    }
  });
}

async function readJsonFile(filePath, fallback) {
  const res = await ghApi(`${filePath}?ref=${BRANCH}`);
  if (res.status === 404) return { data: fallback, sha: null };
  if (!res.ok) throw new Error(`Read ${filePath} failed: ${res.status}`);
  const json = await res.json();
  return { data: JSON.parse(b64Decode(json.content)), sha: json.sha };
}

async function writeJsonFile(filePath, data, sha, message) {
  const body = { message, content: b64Encode(JSON.stringify(data, null, 2)), branch: BRANCH };
  if (sha) body.sha = sha;
  let res = await ghApi(filePath, { method: "PUT", body: JSON.stringify(body) });
  if (res.status === 409) {
    const fresh = await readJsonFile(filePath, data);
    body.sha = fresh.sha;
    res = await ghApi(filePath, { method: "PUT", body: JSON.stringify(body) });
  }
  if (!res.ok) throw new Error(`Write ${filePath} failed: ${res.status} ${await res.text()}`);
}

async function sendMessage(text) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: "HTML" })
  });
}

function todayInTimezone(tz) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit", weekday: "long" }).formatToParts(new Date());
  const get = t => parts.find(p => p.type === t).value;
  return { dateStr: `${get("year")}-${get("month")}-${get("day")}`, weekday: get("weekday") };
}

// data.js is written for the browser (plain `const X = ...`), not CommonJS —
// evaluate it in a sandbox to pull out TRAINING_PROGRAM without duplicating it here.
function loadTrainingProgram() {
  const src = fs.readFileSync(path.join(__dirname, "..", "js", "data.js"), "utf8");
  const sandbox = {};
  vm.createContext(sandbox);
  // `const` bindings at script top-level don't attach to the sandbox object
  // (a Node vm quirk) — appending a trailing expression returns it directly instead.
  return vm.runInContext(src + "\nTRAINING_PROGRAM;", sandbox);
}

async function main() {
  const schedule = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "schedule.json"), "utf8"));
  const { dateStr: today, weekday } = todayInTimezone(schedule.timezone);

  const { data: offsetFile, sha: offsetSha } = await readJsonFile("data/telegram-offset.json", { offset: 0 });
  const offset = offsetFile.offset || 0;

  const updRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=${offset}&timeout=0`);
  const updJson = await updRes.json();
  if (!updJson.ok) { console.error("getUpdates failed:", JSON.stringify(updJson)); return; }
  if (!updJson.result.length) { console.log("No new messages."); return; }

  let maxUpdateId = offset - 1;
  let userData = null; // { data, sha } — loaded lazily, once, only if a command matches

  for (const upd of updJson.result) {
    maxUpdateId = Math.max(maxUpdateId, upd.update_id);
    const msg = upd.message;
    if (!msg || !msg.text) continue;
    if (String(msg.chat.id) !== String(CHAT_ID)) continue; // ignore anyone but the owner
    const text = msg.text.trim();

    const weightMatch = text.match(/^weight\s+(\d+(?:\.\d+)?)$/i);
    const isDone = /^done$/i.test(text);
    if (!weightMatch && !isDone) continue; // ignore anything that isn't a known command

    if (!userData) userData = await readJsonFile("data/user-data.json", {});

    if (weightMatch) {
      const weight = parseFloat(weightMatch[1]);
      const entries = userData.data.att_tracking_entries || [];
      const idx = entries.findIndex(e => e.date === today);
      const entry = idx >= 0 ? entries[idx] : { id: "t" + Date.now(), date: today, weight: null, waist: null, bicepL: null, bicepR: null, notes: "" };
      entry.weight = weight;
      if (idx >= 0) entries[idx] = entry; else entries.push(entry);
      userData.data.att_tracking_entries = entries;
      console.log(`Logged weight ${weight}kg for ${today}`);
      await sendMessage(`✅ Logged today's weight: ${weight}kg`);
    }

    if (isDone) {
      const program = loadTrainingProgram()[weekday];
      const log = userData.data.att_training_log || {};
      log[today] = log[today] || { exercises: {}, dayDone: false };
      (program?.exercises || []).forEach(ex => { log[today].exercises[ex.id] = true; });
      log[today].dayDone = true;
      userData.data.att_training_log = log;
      console.log(`Marked ${weekday}'s workout done`);
      await sendMessage(program && program.exercises.length ? `✅ Marked today's workout done — ${program.title}` : `✅ Marked today done (rest day)`);
    }
  }

  if (userData) {
    userData.data._syncedAt = new Date().toISOString();
    await writeJsonFile("data/user-data.json", userData.data, userData.sha, `Telegram command ${new Date().toISOString()}`);
  }

  await writeJsonFile("data/telegram-offset.json", { offset: maxUpdateId + 1 }, offsetSha, `Advance Telegram offset to ${maxUpdateId + 1}`);
}

main().catch(err => { console.error(err); process.exit(1); });
