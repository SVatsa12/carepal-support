// Enums, labels and colours shared across the app. Values match the Firestore data model exactly.

export const APP_NAME = "CarePal Support";

export const CATEGORIES = [
  {
    value: "late_nurse",
    label: "Late or missed nurse visit",
    description: "Caregiver arrived late, left early or did not turn up.",
    icon: "Clock",
  },
  {
    value: "billing",
    label: "Billing & invoices",
    description: "Charges, refunds, payment failures or invoice copies.",
    icon: "Receipt",
  },
  {
    value: "schedule_change",
    label: "Schedule change",
    description: "Change visit timings, pause care or add extra shifts.",
    icon: "CalendarClock",
  },
  {
    value: "care_quality",
    label: "Care quality concern",
    description: "Feedback about how care was given at home.",
    icon: "HeartPulse",
  },
  {
    value: "app_issue",
    label: "App or account issue",
    description: "Login problems, app errors or profile updates.",
    icon: "Smartphone",
  },
  {
    value: "other",
    label: "Something else",
    description: "Anything that doesn't fit the options above.",
    icon: "HelpCircle",
  },
];

export const PRIORITIES = [
  {
    value: "low",
    label: "Low",
    hint: "Low — a question or something that can wait a few days.",
    classes: "bg-slate-100 text-slate-700 ring-slate-200",
  },
  {
    value: "medium",
    label: "Medium",
    hint: "Medium — needs attention within a day or so.",
    classes: "bg-sky-50 text-sky-700 ring-sky-200",
  },
  {
    value: "high",
    label: "High",
    hint: "High — it's affecting care this week.",
    classes: "bg-amber-50 text-amber-800 ring-amber-200",
  },
  {
    value: "urgent",
    label: "Urgent",
    hint: "Urgent — someone's safety or today's visit is affected.",
    classes: "bg-red-50 text-red-700 ring-red-200",
  },
];

export const STATUSES = [
  { value: "pending", label: "Pending", classes: "bg-amber-50 text-amber-800 ring-amber-200" },
  {
    value: "in_progress",
    label: "In progress",
    classes: "bg-brand-50 text-brand-800 ring-brand-200",
  },
  {
    value: "resolved",
    label: "Resolved",
    classes: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  },
];

export const ROLES = {
  MEMBER: "member",
  AGENT: "agent",
  ADMIN: "admin",
};

export const STAFF_ROLES = [ROLES.AGENT, ROLES.ADMIN];
export const ALL_ROLES = Object.values(ROLES);

export const ROLE_LABELS = {
  [ROLES.MEMBER]: "Family member",
  [ROLES.AGENT]: "Agent",
  [ROLES.ADMIN]: "Admin",
};

// Wait-timer colour thresholds, in minutes: green below the first, amber below the second, red after.
export const SLA_MINUTES = {
  WARN: 15,
  BREACH: 60,
};

// How each SLA level looks on the staff wait timer. The label is read out, so colour is never
// the only signal.
export const SLA_LEVELS = {
  ok: { label: "within SLA", classes: "bg-emerald-50 text-emerald-800 ring-emerald-200" },
  warn: { label: "SLA at risk", classes: "bg-amber-50 text-amber-800 ring-amber-300" },
  breach: { label: "SLA breached", classes: "bg-red-50 text-red-700 ring-red-200" },
};

export const MAX_UPLOAD_MB = 5;
export const MESSAGE_MAX = 2000;
export const PREVIEW_MAX = 120;

// Must match firestore.rules.
export const TICKET_LIMITS = {
  SUBJECT_MIN: 5,
  SUBJECT_MAX: 120,
  DESCRIPTION_MIN: 10,
  DESCRIPTION_MAX: 2000,
};

// Typical first-reply time quoted to families after they raise a ticket.
export const TYPICAL_REPLY_MINUTES = 15;

// Care helpline for urgent issues. Synthetic placeholder number for this demo.
export const HELPLINE = { display: "1800 000 0000", tel: "+9118000000000" };

// Quick replies. Limits must match firestore.rules.
export const QUICK_REPLY_LIMITS = {
  TITLE_MIN: 3,
  TITLE_MAX: 60,
  BODY_MIN: 5,
  BODY_MAX: 1000,
};

// Placeholders a quick reply body may use, with sample values for the editor preview.
export const QUICK_REPLY_PLACEHOLDERS = [
  { key: "memberName", label: "Member's first name", sample: "Priya" },
  { key: "ticketNo", label: "Ticket number", sample: "TCP-7KQ2XA" },
  { key: "agentName", label: "Your first name", sample: "Rohit" },
];

// Satisfaction rating on resolved tickets. The comment limit must match firestore.rules.
export const RATING_COMMENT_MAX = 500;
export const RATING_LABELS = { 1: "Very poor", 2: "Poor", 3: "Okay", 4: "Good", 5: "Excellent" };
