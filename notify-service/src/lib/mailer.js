import nodemailer from "nodemailer";
import config from "../config.js";

const transport = config.email.enabled
  ? nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: { user: config.email.user, pass: config.email.pass },
    })
  : null;

/** Sends the email, or with EMAIL_ENABLED=false only logs a preview. Returns true if sent. */
export async function sendEmail({ to, subject, text, html }) {
  if (!transport) {
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
  await transport.sendMail({ from: config.email.from, to, subject, text, html });
  return true;
}
