# CarePal Support

Support tickets and live chat between families and the TheCarePal operations team.

Full documentation comes in a later phase. Workspaces:

- `web/` — React + Vite app (member and staff views)
- `notify-service/` — Express service for email notifications
- `scripts/` — seed script (firebase-admin)

## Notes

### Firestore rules and indexes

Rules live in `firestore.rules` and the composite index in `firestore.indexes.json`. Deploy both
with the Firebase CLI (after `firebase login` and setting your project id in `.firebaserc`):

```bash
npx firebase-tools deploy --only firestore:rules,firestore:indexes
```

### Seeding demo data

1. In the Firebase console, open Project settings → Service accounts → Generate new private key,
   and save the file as `scripts/service-account.json` (gitignored).
2. Copy `scripts/.env.example` to `scripts/.env` and set `SEED_PASSWORD` (8+ characters).
3. Run:

```bash
cd scripts
npm install
npm run seed:reset
```

`npm run seed` refuses to run if tickets already exist; `npm run seed:reset` deletes the demo
users, all tickets (with their messages) and quick replies first. All data is synthetic.
