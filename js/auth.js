/* Auth — a real TOTP (RFC 6238) implementation, verified entirely client-side
   with the Web Crypto API. The secret is generated in the browser on first run
   and stored only in this device's localStorage — it is never written to the
   repo, so nothing sensitive appears in view-source or git history.

   Honest limitation: this is a public static site. A technically determined
   visitor could still read this file's logic. What this genuinely stops is a
   casual visitor stumbling on the link and poking around, which is what a
   fully static host can realistically offer. */

const Auth = (() => {
  const SECRET_KEY = "att_totp_secret";
  const UNLOCK_KEY = "att_unlocked"; // sessionStorage — re-enter code each new browser session
  const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

  function base32Encode(bytes) {
    let bits = "", output = "";
    for (const b of bytes) bits += b.toString(2).padStart(8, "0");
    for (let i = 0; i + 5 <= bits.length; i += 5) {
      output += BASE32_ALPHABET[parseInt(bits.substr(i, 5), 2)];
    }
    const rem = bits.length % 5;
    if (rem) output += BASE32_ALPHABET[parseInt(bits.slice(-rem).padEnd(5, "0"), 2)];
    return output;
  }

  function base32Decode(str) {
    str = str.replace(/=+$/, "").toUpperCase().replace(/\s/g, "");
    let bits = "";
    for (const ch of str) {
      const idx = BASE32_ALPHABET.indexOf(ch);
      if (idx === -1) continue;
      bits += idx.toString(2).padStart(5, "0");
    }
    const bytes = [];
    for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(parseInt(bits.substr(i, 8), 2));
    return new Uint8Array(bytes);
  }

  function generateSecret() {
    const bytes = new Uint8Array(20);
    crypto.getRandomValues(bytes);
    return base32Encode(bytes);
  }

  function counterToBuffer(counter) {
    const buf = new ArrayBuffer(8);
    const view = new DataView(buf);
    // JS numbers are safe up to 2^53; counter never gets remotely that large
    view.setUint32(4, counter >>> 0);
    view.setUint32(0, Math.floor(counter / 2 ** 32));
    return buf;
  }

  async function hotp(secretBase32, counter) {
    const keyBytes = base32Decode(secretBase32);
    const key = await crypto.subtle.importKey(
      "raw", keyBytes, { name: "HMAC", hash: "SHA-1" }, false, ["sign"]
    );
    const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, counterToBuffer(counter)));
    const offset = sig[19] & 0x0f;
    const binary = ((sig[offset] & 0x7f) << 24) | ((sig[offset + 1] & 0xff) << 16) |
                   ((sig[offset + 2] & 0xff) << 8) | (sig[offset + 3] & 0xff);
    return String(binary % 1_000_000).padStart(6, "0");
  }

  async function verify(secretBase32, code, step = 30, window = 1) {
    const counter = Math.floor(Date.now() / 1000 / step);
    for (let w = -window; w <= window; w++) {
      if (await hotp(secretBase32, counter + w) === code) return true;
    }
    return false;
  }

  function hasSecret() { return !!localStorage.getItem(SECRET_KEY); }
  function saveSecret(secret) { localStorage.setItem(SECRET_KEY, secret); }
  function getSecret() { return localStorage.getItem(SECRET_KEY); }
  function resetSecret() { localStorage.removeItem(SECRET_KEY); sessionStorage.removeItem(UNLOCK_KEY); }

  function isUnlockedThisSession() { return sessionStorage.getItem(UNLOCK_KEY) === "1"; }
  function markUnlocked() { sessionStorage.setItem(UNLOCK_KEY, "1"); }

  // ---- Shared 6-box OTP input builder ----
  function buildOtpInputs(container, onFilled) {
    container.innerHTML = "";
    const inputs = [];
    for (let i = 0; i < 6; i++) {
      const inp = document.createElement("input");
      inp.type = "tel"; inp.inputMode = "numeric"; inp.maxLength = 1;
      inp.addEventListener("input", () => {
        inp.value = inp.value.replace(/[^0-9]/g, "");
        if (inp.value && i < 5) inputs[i + 1].focus();
        const code = inputs.map(x => x.value).join("");
        if (code.length === 6) onFilled(code);
      });
      inp.addEventListener("keydown", (e) => {
        if (e.key === "Backspace" && !inp.value && i > 0) inputs[i - 1].focus();
      });
      inputs.push(inp);
      container.appendChild(inp);
    }
    inputs[0].focus();
    return inputs;
  }
  function clearOtpInputs(inputs) { inputs.forEach(i => i.value = ""); inputs[0].focus(); }

  return {
    generateSecret, verify, hasSecret, saveSecret, getSecret, resetSecret,
    isUnlockedThisSession, markUnlocked, buildOtpInputs, clearOtpInputs
  };
})();
