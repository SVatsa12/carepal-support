# CarePal Support — project context

"CarePal Support" is a take-home assignment for TheCarePal (task FS-07): a home-care company in India
(nurses/caregivers for elderly care, dementia care, baby care, post-hospital recovery). Families raise
support tickets (late nurse, billing, schedule change, etc.) and chat live with the operations team.

The repo root is this folder (CarePalAssignment). `prompt.md` holds the phase prompts and is gitignored:
never commit it.

## Stack (fixed — do not change without asking)

- Monorepo:
  - `web/` — React 18 + Vite, JavaScript (ES modules), React Router v6, Tailwind CSS v3,
    Firebase JS SDK v10+ (modular API), date-fns, react-hot-toast, browser-image-compression,
    lucide-react (icons), clsx
  - `notify-service/` — Node 20 + Express 4, firebase-admin, nodemailer, cors, helmet, dotenv,
    express-rate-limit
  - `scripts/` — seed.js using firebase-admin
  - `firestore.rules`, `firestore.indexes.json`, `firebase.json` at repo root
- Firebase Spark plan: Auth (email/password), Firestore, Hosting. NO Cloud Functions, NO Firebase
  Storage. Photos are uploaded to Cloudinary via an unsigned upload preset.
- Real-time = Firestore onSnapshot listeners (no socket server).

## Must-have features (all are graded)

1. Member creates a ticket: category, priority, subject, description, optional photo.
2. Real-time chat thread on each ticket.
3. Admin inbox: filters, assign to a team member, statuses Pending / In progress / Resolved.
4. Unread message badges for both sides (member and staff).
5. Live timer showing how long each ticket has waited since the last reply.
6. Saved quick replies for common answers.

Bonus: email notification on new reply; satisfaction rating when resolved.

## Roles

- member: a family account. Sees only their own tickets.
- agent: support team member. Sees all tickets, replies, assigns, changes status.
- admin: same as agent + manages quick replies (agents can use them).
- "staff" = agent or admin.

## Firestore data model (use EXACTLY these names)

```
users/{uid}
  name, email, phone, role ("member"|"agent"|"admin"), city?, careType?, createdAt

tickets/{ticketId}
  ticketNo            "TCP-" + first 6 chars of doc id uppercased
  memberId, memberName, memberEmail
  category            "late_nurse"|"billing"|"schedule_change"|"care_quality"|"app_issue"|"other"
  priority            "low"|"medium"|"high"|"urgent"
  subject             string 5–120 chars
  description         string 10–2000 chars
  photoUrl            string|null (must start with https://res.cloudinary.com/)
  status              "pending"|"in_progress"|"resolved"
  assigneeId, assigneeName   string|null
  createdAt, updatedAt, resolvedAt (Timestamp|null)
  lastMessageAt       Timestamp
  lastMessagePreview  string (max 120 chars)
  lastMessageRole     "member"|"staff"
  awaitingReplyFrom   "staff"|"member"|null
  waitingSince        Timestamp|null   (time of the OLDEST unanswered message)
  unreadMember        number           (staff messages the member hasn't seen)
  unreadStaff         number           (member messages staff haven't seen)
  rating              { score: 1–5, comment: string, createdAt } | null
  lastEmailAt         { member: Timestamp|null, staff: Timestamp|null }  (server-only)

tickets/{ticketId}/messages/{messageId}
  type                "message"|"system"
  senderId, senderName, senderRole ("member"|"staff"|"system")
  text                string 1–2000 chars
  createdAt           Timestamp

quickReplies/{id}
  title (3–60), body (5–1000), category (same enum as tickets, or "any"),
  createdBy, createdAt, updatedAt
  body supports placeholders {{memberName}}, {{ticketNo}}, {{agentName}}
```

## Core business rules

- New ticket: status "pending", awaitingReplyFrom "staff", waitingSince = createdAt,
  unreadStaff = 1, unreadMember = 0, lastMessageRole "member",
  lastMessagePreview = description (truncated).
- Sending a message is ONE Firestore transaction:
  read ticket → create message doc → update ticket:
  lastMessageAt, lastMessagePreview, lastMessageRole, updatedAt,
  increment the OTHER side's unread counter by 1,
  if ticket.awaitingReplyFrom !== otherSide → set awaitingReplyFrom = otherSide and
  waitingSince = serverTimestamp(); else leave waitingSince unchanged (the clock keeps
  running from the first unanswered message).
- Opening a thread resets ONLY your own side's counter to 0 (skip the write if already 0).
- Status change / assignment by staff: transaction that updates the ticket AND writes a
  "system" message ("Rohit changed status to In progress", "Assigned to Meera").
  System messages do NOT touch unread counters or the wait timer.
- Resolving sets resolvedAt and awaitingReplyFrom = null, waitingSince = null.
  Moving a resolved ticket back to pending/in_progress restores awaitingReplyFrom = "staff",
  waitingSince = now.
- Members cannot reply on a resolved ticket; they see a banner + "Raise a new ticket" button
  + the rating card. Staff can reopen.
- Rating: member only, ticket must be resolved, only once.
- Wait timer display: if awaitingReplyFrom === "staff" → "Waiting 1h 12m" with SLA colour
  (green < 15 min, amber < 60 min, red ≥ 60 min). If "member" → neutral "Awaiting member · 3h".
  If null → nothing. Ticks every 30 s via ONE shared interval (not one per row).

## Code standards (apply to every phase)

- Folder layout in `web/src`:
  `firebase.js`, `constants.js` (enums + labels + colours), `utils/` (pure functions),
  `services/` (all Firestore/Cloudinary/notify writes — components never call Firestore
  directly), `hooks/` (all onSnapshot listeners; ALWAYS return unsubscribe in useEffect cleanup),
  `context/AuthContext.jsx`, `components/`, `pages/member/`, `pages/admin/`, `routes/`.
- Small focused components, clear names, no dead code, no TODOs left behind.
- Every async action: try/catch → user-friendly toast; log the raw error with console.error.
- Every list/thread has loading skeleton, empty state, and error state.
- Mobile first: works at 360px width, touch targets ≥ 44px, use 100dvh for full-height
  layouts so the chat composer is not hidden by the mobile keyboard.
- Accessibility: labels on all inputs, aria-label on icon buttons, visible focus rings,
  colour is never the only signal (badges also have text).
- Secrets: never hard-code keys. Use `import.meta.env.VITE_*` in web and `process.env` in
  services. Provide `.env.example` files. `.gitignore` must include `.env`, `.env.*`, `!.env.example`,
  `serviceAccount*.json`, `*-service-account.json`, `node_modules`, `dist`.
- Only synthetic data. Never real patient data.
- Visual style: calm and trustworthy. Neutral slate background, one teal/emerald primary,
  rounded-xl cards, subtle borders, Inter or system font. No gradients overload.
  App title: "CarePal Support".
- After writing code for a phase: list files created/changed, the commands to run, and
  how to verify the acceptance checks.

## Workflow

- Phases come from `prompt.md` and run in order; each must pass its acceptance checks.
- After each phase: `npm run build` and `npm run lint` in `web/` (plus `npm test` once it exists),
  then commit with the phase's suggested message.
- Credentials (Firebase config, service account, Cloudinary, SMTP) live only in local `.env` files /
  `service-account.json`, which the user creates. Never print or commit them.
