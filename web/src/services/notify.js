import { auth } from "../firebase";

const NOTIFY_URL = (import.meta.env.VITE_NOTIFY_URL ?? "").replace(/\/+$/, "");
const TIMEOUT_MS = 5000;

/**
 * Asks the notify-service to email the other side about a new message. Fire-and-forget:
 * it never throws and never delays the chat; failures only log a warning.
 */
export async function notifyNewMessage({ ticketId, messageId }) {
  if (!NOTIFY_URL) return;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const token = await auth.currentUser?.getIdToken();
    if (!token) return;
    const response = await fetch(`${NOTIFY_URL}/api/notify`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ticketId, messageId }),
      signal: controller.signal,
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      console.warn(`Email notification failed (${response.status}):`, body.error ?? "");
    }
  } catch (error) {
    console.warn("Email notification failed:", error.name === "AbortError" ? "timed out" : error);
  } finally {
    clearTimeout(timer);
  }
}
