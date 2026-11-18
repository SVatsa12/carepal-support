import dotenv from "dotenv";
import { parseMailbox } from "./lib/mailbox.js";

dotenv.config({ quiet: true });

const env = process.env;
const problems = [];

function list(value) {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function integer(name, fallback, { min = 0 } = {}) {
  const raw = env[name];
  if (raw === undefined || raw === "") return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < min) {
    problems.push(`${name} must be a whole number ≥ ${min} (got "${raw}").`);
    return fallback;
  }
  return value;
}

function url(name, fallback) {
  const value = (env[name] || fallback).replace(/\/+$/, "");
  try {
    new URL(value);
  } catch {
    problems.push(`${name} must be a full URL such as http://localhost:5173.`);
  }
  return value;
}

const emailEnabled = env.EMAIL_ENABLED === "true";
const smtpPort = integer("SMTP_PORT", 465, { min: 1 });

const config = {
  port: integer("PORT", 8080, { min: 1 }),
  allowedOrigins: list(env.ALLOWED_ORIGINS || "http://localhost:5173"),
  appUrl: url("APP_URL", "http://localhost:5173"),
  // Number of reverse proxies in front of the service (e.g. 1 on Render), so rate limiting
  // sees the real client IP. 0 locally: X-Forwarded-For is then ignored and can't be spoofed.
  trustProxy: integer("TRUST_PROXY", 0),
  serviceAccountBase64: env.FIREBASE_SERVICE_ACCOUNT_BASE64 || "",
  credentialsPath: env.GOOGLE_APPLICATION_CREDENTIALS || "",
  throttleMinutes: integer("THROTTLE_MINUTES", 10),
  supportInboxEmail: (env.SUPPORT_INBOX_EMAIL || "").trim(),
  email: {
    enabled: emailEnabled,
    host: env.SMTP_HOST || "smtp.gmail.com",
    port: smtpPort,
    secure: smtpPort === 465,
    user: env.SMTP_USER || "",
    pass: env.SMTP_PASS || "",
    from: env.MAIL_FROM || "",
    // Brevo's HTTPS API, used instead of SMTP when set (Render's free tier blocks SMTP ports).
    brevoApiKey: (env.BREVO_API_KEY || "").trim(),
  },
};

if (!config.serviceAccountBase64 && !config.credentialsPath) {
  problems.push(
    "Set FIREBASE_SERVICE_ACCOUNT_BASE64 (deploys) or GOOGLE_APPLICATION_CREDENTIALS (path to a service account JSON file).",
  );
}
if (config.allowedOrigins.length === 0) {
  problems.push("ALLOWED_ORIGINS needs at least one origin, e.g. http://localhost:5173.");
}
if (emailEnabled) {
  const required = config.email.brevoApiKey ? ["MAIL_FROM"] : ["SMTP_USER", "SMTP_PASS", "MAIL_FROM"];
  for (const key of required) {
    if (!env[key]) problems.push(`${key} is required when EMAIL_ENABLED=true.`);
  }
  if (env.MAIL_FROM && !parseMailbox(env.MAIL_FROM)) {
    problems.push('MAIL_FROM must look like "CarePal Support <you@gmail.com>" or you@gmail.com.');
  }
}

if (problems.length > 0) {
  console.error(
    `notify-service: invalid configuration\n  - ${problems.join("\n  - ")}\n` +
      "Copy notify-service/.env.example to notify-service/.env and fill it in.",
  );
  process.exit(1);
}

export default config;
