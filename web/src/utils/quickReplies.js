// Pure helpers for quick replies: validation (mirrors firestore.rules) and picker ranking.

import { CATEGORIES, QUICK_REPLY_LIMITS } from "../constants";

const VALID_CATEGORIES = new Set([...CATEGORIES.map((item) => item.value), "any"]);

/** Trims the editable fields. */
export function cleanQuickReply({ title, body, category }) {
  return { title: (title ?? "").trim(), body: (body ?? "").trim(), category };
}

/** Returns { field: message } for every invalid field; empty object when valid. */
export function validateQuickReply(input) {
  const { title, body, category } = cleanQuickReply(input);
  const { TITLE_MIN, TITLE_MAX, BODY_MIN, BODY_MAX } = QUICK_REPLY_LIMITS;
  const errors = {};
  if (title.length < TITLE_MIN || title.length > TITLE_MAX) {
    errors.title = `Title must be ${TITLE_MIN}–${TITLE_MAX} characters.`;
  }
  if (body.length < BODY_MIN || body.length > BODY_MAX) {
    errors.body = `Message must be ${BODY_MIN}–${BODY_MAX} characters.`;
  }
  if (!VALID_CATEGORIES.has(category)) errors.category = "Choose a category.";
  return errors;
}

export function quickReplyCategoryLabel(category) {
  if (category === "any") return "Any category";
  return CATEGORIES.find((item) => item.value === category)?.label ?? "Any category";
}

/**
 * Picker order: replies for the ticket's category first, then "any" ones; other categories are
 * left out. Within each group, title matches rank above body-only matches, then A–Z.
 * The search is case-insensitive over title and body.
 */
export function rankQuickReplies(replies, ticketCategory, query = "") {
  const needle = query.trim().toLowerCase();
  const scored = [];
  for (const reply of replies) {
    const group = reply.category === ticketCategory ? 0 : reply.category === "any" ? 1 : null;
    if (group === null) continue;
    let match = 0;
    if (needle) {
      if (reply.title.toLowerCase().includes(needle)) match = 0;
      else if (reply.body.toLowerCase().includes(needle)) match = 1;
      else continue;
    }
    scored.push({ reply, group, match });
  }
  scored.sort(
    (a, b) => a.group - b.group || a.match - b.match || a.reply.title.localeCompare(b.reply.title),
  );
  return scored.map((item) => item.reply);
}
