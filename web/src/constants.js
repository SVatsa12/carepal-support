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
  { value: "low", label: "Low", classes: "bg-slate-100 text-slate-700 ring-slate-200" },
  { value: "medium", label: "Medium", classes: "bg-sky-50 text-sky-700 ring-sky-200" },
  { value: "high", label: "High", classes: "bg-amber-50 text-amber-800 ring-amber-200" },
  { value: "urgent", label: "Urgent", classes: "bg-red-50 text-red-700 ring-red-200" },
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

// Wait-timer colour thresholds, in minutes: green below the first, amber below the second, red after.
export const SLA_MINUTES = {
  WARN: 15,
  BREACH: 60,
};

export const MAX_UPLOAD_MB = 5;
export const MESSAGE_MAX = 2000;
