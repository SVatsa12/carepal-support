# Deploying CarePal Support

Live app: **https://carepal-74c9f.web.app** (also https://carepal-74c9f.firebaseapp.com)

| Part | Where | How |
| --- | --- | --- |
| Web app | Firebase Hosting | `firebase deploy` (below) |
| Firestore rules + indexes | Firebase | same command |
| Email notify-service | Render (free web service) | `render.yaml` Blueprint |
| Photos | Cloudinary | unsigned upload preset |

## 1. Web, rules and indexes → Firebase

```bash
cd web && npm run build && cd ..
npx firebase-tools deploy --only hosting,firestore:rules,firestore:indexes --project carepal-74c9f
```

- `firebase.json` serves `web/dist` as a single-page app (every path rewrites to `index.html`).
- Cache headers: `/assets/**` (content-hashed files) are cached for a year as `immutable`;
  everything else, including `index.html` on deep links, is `no-cache`, so a new deploy is
  picked up on the next load.
- Firebase Auth already trusts `carepal-74c9f.web.app` and `carepal-74c9f.firebaseapp.com`.
  A custom domain must be added under **Authentication → Settings → Authorized domains**.
- Production env: `web/.env.production` (gitignored) overrides `web/.env` for builds. It holds
  `VITE_NOTIFY_URL`; leave it empty until the notify-service is live (emails are then simply
  skipped, chat is unaffected).

## 2. notify-service → Render

Render deploys from a Git host, so push this repo to GitHub first.

1. Render → **New → Blueprint** → pick the repo. It reads `render.yaml`
   (root dir `notify-service`, build `npm ci`, start `npm start`, health check `/health`).
2. Fill the secret values Render asks for:
   - `FIREBASE_SERVICE_ACCOUNT_BASE64`: the service account JSON as one base64 line,
     e.g. `base64 -w0 scripts/service-account.json` (macOS: `base64 -i … | tr -d '\n'`).
   - `BREVO_API_KEY`, `MAIL_FROM` (e.g. `CarePal Support <you@gmail.com>`) and
     `SUPPORT_INBOX_EMAIL`: see *Email on Render* below.
   - `SMTP_USER` / `SMTP_PASS` are only used when `BREVO_API_KEY` is empty (local dev with a
     Gmail app password); on Render any placeholder will do.
3. When it's live, open `https://<service>.onrender.com/health` → `{"ok":true}`.
4. Put the URL in `web/.env.production` as `VITE_NOTIFY_URL=https://<service>.onrender.com`,
   then rebuild and redeploy Hosting (step 1).

`ALLOWED_ORIGINS`, `APP_URL` and `TRUST_PROXY=1` are already set in `render.yaml` for the
Hosting URLs.

### Email on Render: Brevo, not SMTP

Since 26 Sept 2025 Render's **free** web services block outbound traffic to SMTP ports 25, 465
and 587, so Gmail SMTP times out there. The service therefore sends through
[Brevo](https://www.brevo.com)'s transactional email API over HTTPS whenever `BREVO_API_KEY`
is set, and falls back to SMTP (nodemailer) when it isn't, which suits local dev.

1. Create a free Brevo account (300 emails/day).
2. **Senders, domains & dedicated IPs → Senders → Add a sender** with the address you use in
   `MAIL_FROM`, and confirm Brevo's verification email.
3. **SMTP & API → API keys → Generate a new API key**, then paste it into `BREVO_API_KEY` on
   Render.
4. If an email doesn't show up, check **Transactional → Logs** in Brevo and the Render logs
   (rejected sends are logged as `Brevo rejected the email (HTTP …)`).

A Gmail address sent through a third party often lands in **spam** at first; mark it
"Not spam" once.

**Free instances sleep** after ~15 minutes idle. The first request after a quiet spell can
take 30–50 s while the service wakes. The web client calls it fire-and-forget with a 5 s
timeout, so chat is never slowed down; the browser stops waiting, but the service still
finishes sending the email once it's awake.

## 3. Cloudinary upload preset

In Cloudinary → **Settings → Upload → Upload presets**, open the unsigned preset named in
`VITE_CLOUDINARY_UPLOAD_PRESET` and confirm:

- Signing mode: **Unsigned**
- Folder: **carepal-support** (the app also sends this folder)
- Allowed formats: **jpg, jpeg, png, webp, heic** (images only)
- Max file size: **5 MB** (`5000000` bytes) — the app checks 5 MB and compresses to ~1 MB
  before upload, so this is the server-side backstop.

Firestore rules only accept `photoUrl` values starting with `https://res.cloudinary.com/`.

## 4. Post-deploy smoke test

Use two browsers (or one normal + one private window), one per role.

- [ ] **Logins**: "Try as a family member" lands on *My tickets*; "Try as support agent"
      lands on the *Inbox* with the stats strip.
- [ ] **Create ticket with photo** (member): choose category + priority, attach a photo,
      submit → chat opens, photo shows in the ticket details.
- [ ] **Staff sees it live**: the new ticket appears in *Pending* with an unread badge and a
      green wait timer.
- [ ] **Live chat both ways**: staff reply appears for the member within a few seconds (and the
      ticket moves to *In progress*); member reply appears for staff.
- [ ] **Assign**: "Assign to me" → system message "Assigned to …" in both views.
- [ ] **Status change**: set *In progress* / back to *Pending* → system message, inbox tab
      counts update.
- [ ] **Quick reply**: type `/` in the staff composer, pick a reply → placeholders filled,
      text is editable before sending.
- [ ] **Unread badges**: member's list and nav badge count staff messages; opening the ticket
      clears them. Same on the staff side. Tab title shows `(n)`.
- [ ] **Timer**: a ticket awaiting staff shows the SLA chip (green < 15 min, amber < 60 min,
      red ≥ 60 min); after a staff reply the member card shows "CarePal replied … ago".
- [ ] **Resolve + rate**: staff resolves → member sees the banner and rating card live,
      rates 1–5 with a comment → staff header shows the rating, CSAT updates.
- [ ] **Email**: with the notify-service live and SMTP set, a staff reply emails the member
      address; a second reply within 10 minutes is throttled (check the Render logs).
- [ ] **Phone**: open the live URL on a real phone — no sideways scroll, composer stays above
      the keyboard, inbox filters open as a bottom sheet.
- [ ] Delete any test tickets afterwards (or run `npm run seed:reset` in `scripts/`).
