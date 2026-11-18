import { CATEGORIES, PRIORITIES, TICKET_LIMITS } from "../constants";

export function ticketNoFromId(id) {
  return `TCP-${id.slice(0, 6).toUpperCase()}`;
}

export function isOpenStatus(status) {
  return status === "pending" || status === "in_progress";
}

/** Validates the new-ticket form. Returns an object of field → message (empty when valid). */
export function validateTicketInput({ category, priority, subject, description }) {
  const errors = {};
  const trimmedSubject = (subject ?? "").trim();
  const trimmedDescription = (description ?? "").trim();

  if (!CATEGORIES.some((item) => item.value === category)) {
    errors.category = "Choose what your ticket is about.";
  }
  if (!PRIORITIES.some((item) => item.value === priority)) {
    errors.priority = "Choose how urgent this is.";
  }
  if (trimmedSubject.length < TICKET_LIMITS.SUBJECT_MIN) {
    errors.subject = `Add a short subject (at least ${TICKET_LIMITS.SUBJECT_MIN} characters).`;
  } else if (trimmedSubject.length > TICKET_LIMITS.SUBJECT_MAX) {
    errors.subject = `Keep the subject under ${TICKET_LIMITS.SUBJECT_MAX} characters.`;
  }
  if (trimmedDescription.length < TICKET_LIMITS.DESCRIPTION_MIN) {
    errors.description = `Tell us a little more (at least ${TICKET_LIMITS.DESCRIPTION_MIN} characters).`;
  } else if (trimmedDescription.length > TICKET_LIMITS.DESCRIPTION_MAX) {
    errors.description = `Please keep it under ${TICKET_LIMITS.DESCRIPTION_MAX} characters.`;
  }
  return errors;
}
