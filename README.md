# Arms Tracker

A mobile-first, iOS-styled personal tracker for your training program: Groceries, Training, Recipes, Supplements, Tracking, and Calendar — plus a Telegram bot that reminds you when to eat and when to train.

---

## 1. How this actually works (read this first)

Two honest things worth knowing before you deploy:

**Data storage.** GitHub Pages only serves static files — there's no database. By default, everything you log (weight, prices, checkboxes) is saved in your phone/browser's local storage:
- It's fast and needs no setup.
- It does **not** sync between devices on its own (e.g. logging on your phone won't show up on a laptop) — it's per-browser.
- Clearing your browser's site data would erase it. **Use Settings → Export all data** every so often to download a backup JSON file, and **Import** it if you ever switch devices or browsers.

**Cross-device sync (optional).** Settings → Cloud sync lets you connect the app to a `data/user-data.json` file stored right in this GitHub repo, read and written through the GitHub API. Once connected on a device, every change there is pushed (debounced ~4s after your last edit) and pulled on load, so your phone and laptop see the same log. To turn it on:
1. Go to [github.com/settings/personal-access-tokens/new](https://github.com/settings/personal-access-tokens/new).
2. Under **Repository access**, choose "Only select repositories" → this repo (`arm-tracker`).
3. Under **Permissions → Repository permissions**, set **Contents** to **Read and write**. Leave everything else as-is.
4. Generate the token, copy it, and paste it into Settings → Cloud sync → Connect in the app. Repeat on each device you want synced.
5. The token is stored only in that browser's local storage — it's never written into the code or the repo, same as the lock screen's secret.

This is last-write-wins: if you edit on two devices while offline at the same time, whichever syncs last overwrites the other. Fine for one person on 1-2 devices; not built for concurrent multi-user editing.

**The lock screen.** This is real TOTP (the same rotating-code system as Google Authenticator), verified with the Web Crypto API. The secret key is generated in your browser on first run and saved only to that browser's local storage — it's never written into the code or the repo. That means nothing sensitive shows up if someone views the page source. What it can't do is stop someone who's determined enough to read the app's logic and try to reverse-engineer it — no fully static, public site can promise that. What it does do is exactly what you asked for: stop someone who stumbles on the link from seeing anything.

---

## 2. Deploy to GitHub Pages

1. Create a new **public** GitHub repository (Pages on a personal/free plan requires the repo to be public — the lock screen is what keeps casual visitors out).
2. Push all these files to it.
3. In the repo, go to **Settings → Pages** → set **Source** to "Deploy from a branch" → branch `main`, folder `/ (root)`. Save.
4. Your app will be live at `https://<your-username>.github.io/<repo-name>/` within a minute or two.
5. Open it on your iPhone, go through the lock setup (see below), then **Share → Add to Home Screen** for a full-screen, app-like icon.

---

## 3. Set up your lock

The first time you open the site, it generates a random key and shows it on screen.

1. Open Google Authenticator, Authy, Raivo, or any TOTP app.
2. Choose **Enter a setup key manually** (not "scan QR" — this build doesn't generate a QR code to keep things simple; happy to add one later).
3. Enter the key shown, with: Type = Time-based, Algorithm = SHA1, Digits = 6, Period = 30s.
4. Type the 6-digit code your authenticator now shows into the app to confirm.

From then on, opening the site asks for the current code from your app. If you ever lose access to your authenticator, use **"Lost your authenticator? Reset lock"** on the verify screen — this clears only the lock, your tracked data stays put, and you'll go through setup again.

---

## 4. Set up the Telegram bot

1. In Telegram, message **@BotFather** → `/newbot` → follow the prompts → it gives you a **bot token** (looks like `123456789:AAExampleTokenHere`).
2. Message your new bot anything (e.g. "hi") so it can see your chat.
3. Get your **chat ID**: visit `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates` in a browser right after messaging it, and look for `"chat":{"id": ...}` in the response.
4. In your GitHub repo: **Settings → Secrets and variables → Actions → New repository secret**. Add:
   - `TELEGRAM_BOT_TOKEN` → your bot token
   - `TELEGRAM_CHAT_ID` → your chat ID
5. That's it — the workflow in `.github/workflows/telegram-reminders.yml` runs every 10 minutes and messages you at the times in `data/schedule.json`.
6. To test immediately rather than waiting: go to the **Actions** tab in your repo → **Telegram reminders** → **Run workflow**.

**To change what/when it reminds you:** edit `data/schedule.json` directly (times are 24-hour, in your timezone as set by the `timezone` field) and commit. This file is intentionally separate from your day-to-day tracked data — it's your recurring weekly plan, not your log.

---

## 5. Project structure

```
index.html                          — app shell + lock screen markup
css/styles.css                      — iOS-style design system
js/data.js                          — seed content: groceries, recipes, supplements, training program
js/store.js                         — localStorage data layer + export/import
js/sync.js                          — optional GitHub-backed cross-device sync
js/auth.js                          — TOTP lock implementation
js/app.js                           — navigation + all six views
data/schedule.json                  — recurring weekly schedule read by the Telegram bot
scripts/send-reminders.js           — sends due Telegram reminders
.github/workflows/telegram-reminders.yml — runs the script every 10 minutes
```

No build step, no dependencies to install for the web app itself — it's plain HTML/CSS/JS. Edit and push; GitHub Pages picks it up automatically.

---

## 6. Ideas for next features

Since you mentioned wanting to build this out further, a few natural next steps, roughly in order of how much they'd unlock:

- **QR code for lock setup** — faster than typing the key manually.
- **Editable training program** from within the app, instead of editing `js/data.js` by hand.
- **Telegram two-way commands** — e.g. text the bot "done" to tick off today's workout, or "weight 89.4" to log a weigh-in, instead of only receiving reminders.
- **Grocery price history chart** — you're already logging price history per item; plotting it over time is a small addition once you've got a few weeks of data.
- **Photo log** for the monthly progress photos mentioned in your original plan.

Tell me which of these you want next and I'll build it.
