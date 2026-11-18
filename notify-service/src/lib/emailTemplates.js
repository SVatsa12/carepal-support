export const SNIPPET_MAX = 300;

const HTML_ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

export function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
}

/** First `max` characters (whole code points, so emoji aren't cut in half), plus "…". */
export function snippet(text, max = SNIPPET_MAX) {
  const chars = Array.from(String(text ?? "").trim());
  return chars.length > max ? `${chars.slice(0, max).join("").trimEnd()}…` : chars.join("");
}

function oneLine(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * "New reply" email in HTML and plain text.
 * @param {{ ticketNo: string, ticketSubject: string, senderName: string, recipientName?: string,
 *   text: string, link: string }} input
 */
export function buildReplyEmail({ ticketNo, ticketSubject, senderName, recipientName, text, link }) {
  const subject = `New reply on ${oneLine(ticketNo)}: ${oneLine(ticketSubject)}`;
  const sender = oneLine(senderName) || "CarePal Support";
  const greeting = recipientName ? `Hi ${oneLine(recipientName)},` : "Hi,";
  const body = snippet(text);

  const plain = [
    greeting,
    "",
    `${sender} replied on ${ticketNo} (${oneLine(ticketSubject)}):`,
    "",
    body,
    "",
    `Open conversation: ${link}`,
    "",
    "— CarePal Support",
  ].join("\n");

  const html = `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:24px;background:#f8fafc;font-family:Inter,Segoe UI,Arial,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;">
      <tr>
        <td style="padding:24px;">
          <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#0f766e;">CarePal Support</p>
          <h1 style="margin:0 0 16px;font-size:18px;line-height:1.4;">${escapeHtml(subject)}</h1>
          <p style="margin:0 0 12px;font-size:15px;">${escapeHtml(greeting)}</p>
          <p style="margin:0 0 8px;font-size:15px;"><strong>${escapeHtml(sender)}</strong> wrote:</p>
          <blockquote style="margin:0 0 20px;padding:12px 16px;background:#f1f5f9;border-left:4px solid #14b8a6;border-radius:8px;font-size:15px;line-height:1.5;white-space:pre-wrap;">${escapeHtml(body)}</blockquote>
          <a href="${escapeHtml(link)}" style="display:inline-block;padding:12px 20px;background:#0d9488;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:600;font-size:15px;">Open conversation</a>
          <p style="margin:20px 0 0;font-size:12px;color:#64748b;">You're getting this because you have an open ticket with CarePal Support. Reply in the app, not to this email.</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject, text: plain, html };
}
