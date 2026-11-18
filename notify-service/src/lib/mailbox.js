const EMAIL = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;

/**
 * Splits a From address into name and email: "CarePal Support <a@b.com>" → { name, email };
 * a bare "a@b.com" → { name: "", email }. Returns null when there is no valid email.
 */
export function parseMailbox(value) {
  const text = String(value ?? "").trim();
  const match = /^(.*?)\s*<([^<>]+)>$/.exec(text);
  const name = match ? match[1].trim().replace(/^"(.*)"$/, "$1").trim() : "";
  const email = (match ? match[2] : text).trim();
  return EMAIL.test(email) ? { name, email } : null;
}
