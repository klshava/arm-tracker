// Runs on a GitHub Actions schedule. Reads data/schedule.json, checks whether
// it's currently meal time or training time in your timezone, and messages
// you on Telegram if so. Needs Node 18+ (built-in fetch) — the workflow pins Node 20.

const fs = require("fs");
const path = require("path");

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (!BOT_TOKEN || !CHAT_ID) {
  console.error("Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID repo secrets.");
  process.exit(1);
}

const schedule = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "schedule.json"), "utf8"));

function nowInTimezone(tz) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: tz, hour12: false, weekday: "long", hour: "2-digit", minute: "2-digit"
  }).formatToParts(new Date());
  const get = (type) => parts.find(p => p.type === type).value;
  return { weekday: get("weekday"), hhmm: `${get("hour")}:${get("minute")}` };
}

function toMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

// The workflow runs every 10 minutes. A reminder fires once, in the 10-minute
// window starting at its scheduled time — this absorbs GitHub Actions' typical
// scheduling jitter without double-sending.
function isDue(targetHHMM, nowMinutes) {
  const diff = nowMinutes - toMinutes(targetHHMM);
  return diff >= 0 && diff < 10;
}

async function sendMessage(text) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: "HTML" })
  });
  if (!res.ok) console.error("Telegram send failed:", await res.text());
  else console.log("Sent:", text.split("\n")[0]);
}

async function main() {
  const { weekday, hhmm } = nowInTimezone(schedule.timezone);
  const nowMinutes = toMinutes(hhmm);

  for (const meal of schedule.meals) {
    if (isDue(meal.time, nowMinutes)) {
      await sendMessage(`🍽 <b>${meal.label} time</b>\n${meal.detail}`);
    }
  }

  if (isDue(schedule.trainingTime, nowMinutes)) {
    const workout = schedule.training[weekday];
    if (workout && !/rest/i.test(workout)) {
      await sendMessage(`💪 <b>Training time</b>\n${workout}`);
    }
  }
}

main().catch(err => { console.error(err); process.exit(1); });
