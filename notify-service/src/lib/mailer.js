import nodemailer from "nodemailer";
import config from "../config.js";
import { parseMailbox } from "./mailbox.js";

const BREVO_URL = "https://api.brevo.com/v3/smtp/email";
const BREVO_TIMEOUT_MS = 10_000;

const useBrevo = config.email.enabled && Boolean(config.email.brevoApiKey);
const sender = parseMailbox(config.email.from);

// SMTP for local dev; production on Render's free tier uses Brevo because SMTP ports are blocked.
const smtpTransport =
  config.email.enabled && !useBrevo
    ? nodemailer.createTransport({
        host: config.email.host,
        port: config.email.port,
        secure: config.email.secure,
        auth: { user: config.email.user, pass: config.email.pass },
      })
    : null;

/** Name of the active transport, for the startup log. */
export const mailTransportName = !config.email.enabled
  ? "OFF — previews only"
  : useBrevo
    ? "Brevo API"
    : `SMTP ${config.email.host}:${config.email.port}`;

async function sendWithBrevo({ to, subject, text, html }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), BREVO_TIMEOUT_MS);
  try {
    const response = await fetch(BREVO_URL, {
      method: "POST",
      headers: {
        "api-key": config.email.brevoApiKey,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sender: { name: sender.name || "CarePal Support", email: sender.email },
        to: [{ email: to }],
        subject,
        htmlContent: html,
        textContent: text,
      }),
      signal: controller.signal,
    });
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      console.error(`Brevo rejected the email (HTTP ${response.status}): ${body.slice(0, 500)}`);
      throw new Error(`Brevo HTTP ${response.status}`);
    }
  } catch (error) {
    if (error.name === "AbortError") throw new Error("Brevo request timed out after 10 s");
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

/** Sends the email, or with EMAIL_ENABLED=false only logs a preview. Returns true if sent. */
export async function sendEmail({ to, subject, text, html }) {
  if (!config.email.enabled) {
    console.log(
      [
        "──── Email preview (EMAIL_ENABLED=false, not sent) ────",
        `To: ${to}`,
        `Subject: ${subject}`,
        "",
        text,
        "───────────────────────────────────────────────────────",
      ].join("\n"),
    );
    return false;
  }
  if (useBrevo) {
    await sendWithBrevo({ to, subject, text, html });
  } else {
    await smtpTransport.sendMail({ from: config.email.from, to, subject, text, html });
  }
  return true;
}
