// Seeds CarePal Support with synthetic demo data.
//
//   npm run seed         abort if tickets already exist, otherwise seed
//   npm run seed:reset   delete seeded users, all tickets (with messages) and quick replies, then seed
//
// Reads scripts/.env (see .env.example). When FIRESTORE_EMULATOR_HOST / FIREBASE_AUTH_EMULATOR_HOST
// are set, it talks to the local emulators instead and needs no service account.

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { DEMO_DOMAIN, MEMBERS, QUICK_REPLIES, STAFF, TICKETS } from "./seedData.js";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(SCRIPT_DIR, ".env"), quiet: true });

const BATCH_LIMIT = 450; // Firestore allows 500 ops per batch; keep headroom.
const PREVIEW_MAX = 120;
const STATUS_LABELS = { pending: "Pending", in_progress: "In progress", resolved: "Resolved" };

// ---------- Setup ----------

function initFirebase() {
  const usingEmulator = Boolean(process.env.FIRESTORE_EMULATOR_HOST);
  if (usingEmulator) {
    initializeApp({ projectId: process.env.GCLOUD_PROJECT || "demo-carepal" });
    return "emulator";
  }

  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!credentialsPath) {
    throw new Error(
      "GOOGLE_APPLICATION_CREDENTIALS is not set. Copy scripts/.env.example to scripts/.env and point it at your service account JSON.",
    );
  }
  const serviceAccount = JSON.parse(readFileSync(resolve(SCRIPT_DIR, credentialsPath), "utf8"));
  initializeApp({ credential: cert(serviceAccount) });
  return serviceAccount.project_id;
}

function readSeedPassword() {
  const password = process.env.SEED_PASSWORD;
  if (!password || password.length < 8) {
    throw new Error("SEED_PASSWORD in scripts/.env must be at least 8 characters.");
  }
  return password;
}

function emailFor(person) {
  if (person.key === "priya" && process.env.SEED_DEMO_MEMBER_EMAIL) {
    return process.env.SEED_DEMO_MEMBER_EMAIL.trim().toLowerCase();
  }
  if (person.key === "anjali" && process.env.SEED_STAFF_NOTIFY_EMAIL) {
    return process.env.SEED_STAFF_NOTIFY_EMAIL.trim().toLowerCase();
  }
  const [first, last] = person.name.toLowerCase().split(" ");
  return person.role && person.role !== "member"
    ? `${first}@${DEMO_DOMAIN}`
    : `${first}.${last}@${DEMO_DOMAIN}`;
}

// ---------- Time helpers ----------

const UNIT_MS = { d: 86_400_000, h: 3_600_000, m: 60_000 };

/** "2d3h15m" → milliseconds. */
function parseAgo(ago) {
  const parts = [...ago.matchAll(/(\d+)([dhm])/g)];
  if (parts.length === 0 || parts.map((p) => p[0]).join("") !== ago) {
    throw new Error(`Invalid "ago" value: ${ago}`);
  }
  return parts.reduce((total, [, value, unit]) => total + Number(value) * UNIT_MS[unit], 0);
}

function truncate(text, max) {
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;
}

// ---------- Batched writes ----------

class BatchWriter {
  constructor(db) {
    this.db = db;
    this.batch = db.batch();
    this.pending = 0;
    this.total = 0;
  }

  async set(ref, data) {
    this.batch.set(ref, data);
    await this.#counted();
  }

  async delete(ref) {
    this.batch.delete(ref);
    await this.#counted();
  }

  async #counted() {
    this.pending += 1;
    this.total += 1;
    if (this.pending >= BATCH_LIMIT) await this.flush();
  }

  async flush() {
    if (this.pending === 0) return;
    await this.batch.commit();
    this.batch = this.db.batch();
    this.pending = 0;
  }
}

// ---------- Reset ----------

async function resetData(auth, db, seededEmails) {
  const uidsToDelete = [];
  let pageToken;
  do {
    const page = await auth.listUsers(1000, pageToken);
    for (const user of page.users) {
      const email = user.email?.toLowerCase() ?? "";
      if (email.endsWith(`@${DEMO_DOMAIN}`) || seededEmails.has(email)) uidsToDelete.push(user.uid);
    }
    pageToken = page.pageToken;
  } while (pageToken);

  if (uidsToDelete.length > 0) {
    const result = await auth.deleteUsers(uidsToDelete);
    if (result.failureCount > 0) {
      throw new Error(`Failed to delete ${result.failureCount} auth users`);
    }
  }

  const writer = new BatchWriter(db);
  for (const uid of uidsToDelete) await writer.delete(db.collection("users").doc(uid));
  await writer.flush();

  // recursiveDelete also removes every tickets/{id}/messages subcollection.
  await db.recursiveDelete(db.collection("tickets"));
  await db.recursiveDelete(db.collection("quickReplies"));

  console.log(`Reset: removed ${uidsToDelete.length} demo users, all tickets and quick replies.`);
}

// ---------- Users ----------

async function upsertAuthUser(auth, { email, name, password }) {
  try {
    const existing = await auth.getUserByEmail(email);
    await auth.updateUser(existing.uid, { displayName: name, password, emailVerified: true });
    return existing.uid;
  } catch (error) {
    if (error.code !== "auth/user-not-found") throw error;
    const created = await auth.createUser({
      email,
      password,
      displayName: name,
      emailVerified: true,
    });
    return created.uid;
  }
}

async function seedUsers(auth, writer, password, now) {
  const people = [
    ...STAFF.map((person) => ({ ...person })),
    ...MEMBERS.map((person) => ({ ...person, role: "member" })),
  ];
  const byKey = {};

  for (const person of people) {
    const email = emailFor(person);
    const uid = await upsertAuthUser(auth, { email, name: person.name, password });
    const profile = {
      name: person.name,
      email,
      phone: person.phone,
      role: person.role,
      city: person.city,
      createdAt: Timestamp.fromMillis(now - parseAgo("7d")),
    };
    if (person.careType) profile.careType = person.careType;
    await writer.set(writer.db.collection("users").doc(uid), profile);
    byKey[person.key] = { uid, email, ...person };
  }
  return byKey;
}

// ---------- Tickets ----------

/**
 * Derives the ticket's denormalised fields from its conversation, exactly as the app's
 * transactions would have produced them. The description counts as the first member message.
 */
function deriveTicketFields(ticket, createdAtMs, messages) {
  const conversation = [
    { role: "member", text: ticket.description, at: createdAtMs },
    ...messages
      .filter((msg) => msg.type === "message")
      .map((msg) => ({
        role: msg.senderRole,
        text: msg.text,
        at: msg.atMs,
      })),
  ];
  const last = conversation.at(-1);

  // Trailing run of messages from the last speaker = unanswered messages.
  let runStart = conversation.length - 1;
  while (runStart > 0 && conversation[runStart - 1].role === last.role) runStart -= 1;
  const trailingCount = conversation.length - runStart;

  const resolved = ticket.status === "resolved";
  const resolveEvent = messages.findLast(
    (msg) => msg.type === "system" && msg.text.endsWith("to Resolved"),
  );
  const resolvedAtMs = resolved ? (resolveEvent?.atMs ?? last.at) : null;
  const lastEventMs = Math.max(createdAtMs, ...messages.map((msg) => msg.atMs));

  const otherSide = last.role === "member" ? "staff" : "member";
  return {
    lastMessageAt: Timestamp.fromMillis(last.at),
    lastMessagePreview: truncate(last.text, PREVIEW_MAX),
    lastMessageRole: last.role,
    awaitingReplyFrom: resolved ? null : otherSide,
    waitingSince: resolved ? null : Timestamp.fromMillis(conversation[runStart].at),
    // Staff always saw the conversation before resolving it.
    unreadStaff: last.role === "member" && !ticket.staffRead && !resolved ? trailingCount : 0,
    unreadMember: last.role === "staff" && !ticket.memberRead ? trailingCount : 0,
    resolvedAt: resolvedAtMs ? Timestamp.fromMillis(resolvedAtMs) : null,
    updatedAt: Timestamp.fromMillis(lastEventMs),
    lastEventMs,
  };
}

function buildMessages(ticket, createdAtMs, now, people) {
  let previousMs = createdAtMs;
  return ticket.messages.map((msg, index) => {
    const atMs = now - parseAgo(msg.ago);
    if (atMs < previousMs) {
      throw new Error(
        `Ticket "${ticket.subject}": message ${index + 1} is earlier than the one before it`,
      );
    }
    previousMs = atMs;
    const sender = msg.kind === "member" ? people[ticket.member] : people[msg.staffKey];
    if (msg.text.length < 1 || msg.text.length > 2000) {
      throw new Error(`Ticket "${ticket.subject}": message ${index + 1} has invalid length`);
    }
    return {
      type: msg.kind === "system" ? "system" : "message",
      senderId: sender.uid,
      senderName: sender.name,
      senderRole: msg.kind,
      text: msg.text,
      atMs,
    };
  });
}

function validateTicket(ticket) {
  if (ticket.subject.length < 5 || ticket.subject.length > 120) {
    throw new Error(`Subject length out of range: "${ticket.subject}"`);
  }
  if (ticket.description.length < 10 || ticket.description.length > 2000) {
    throw new Error(`Description length out of range on "${ticket.subject}"`);
  }
}

async function seedTickets(db, writer, people, now) {
  for (const ticket of TICKETS) {
    validateTicket(ticket);
    const member = people[ticket.member];
    const assignee = ticket.assignee ? people[ticket.assignee] : null;
    const createdAtMs = now - parseAgo(ticket.createdAgo);
    const messages = buildMessages(ticket, createdAtMs, now, people);
    const { lastEventMs, ...derived } = deriveTicketFields(ticket, createdAtMs, messages);

    const ticketRef = db.collection("tickets").doc();
    const rating = ticket.rating
      ? {
          score: ticket.rating.score,
          comment: ticket.rating.comment,
          createdAt: Timestamp.fromMillis(Math.min(lastEventMs + 30 * 60_000, now)),
        }
      : null;

    await writer.set(ticketRef, {
      ticketNo: `TCP-${ticketRef.id.slice(0, 6).toUpperCase()}`,
      memberId: member.uid,
      memberName: member.name,
      memberEmail: member.email,
      category: ticket.category,
      priority: ticket.priority,
      subject: ticket.subject,
      description: ticket.description,
      photoUrl: null,
      status: ticket.status,
      assigneeId: assignee?.uid ?? null,
      assigneeName: assignee?.name ?? null,
      createdAt: Timestamp.fromMillis(createdAtMs),
      ...derived,
      updatedAt: rating ? rating.createdAt : derived.updatedAt,
      rating,
      lastEmailAt: { member: null, staff: null },
    });

    for (const { atMs, ...message } of messages) {
      await writer.set(ticketRef.collection("messages").doc(), {
        ...message,
        createdAt: Timestamp.fromMillis(atMs),
      });
    }
  }
}

async function seedQuickReplies(db, writer, people, now) {
  const createdAt = Timestamp.fromMillis(now - parseAgo("6d"));
  for (const reply of QUICK_REPLIES) {
    await writer.set(db.collection("quickReplies").doc(), {
      ...reply,
      createdBy: people.anjali.uid,
      createdAt,
      updatedAt: createdAt,
    });
  }
}

// ---------- Summary ----------

function printSummary(people) {
  const byStatus = Object.fromEntries(
    Object.keys(STATUS_LABELS).map((status) => [STATUS_LABELS[status], 0]),
  );
  for (const ticket of TICKETS) byStatus[STATUS_LABELS[ticket.status]] += 1;

  console.log("\nSeeded collections:");
  console.table({
    "users (staff)": STAFF.length,
    "users (members)": MEMBERS.length,
    tickets: TICKETS.length,
    messages: TICKETS.reduce((sum, ticket) => sum + ticket.messages.length, 0),
    quickReplies: QUICK_REPLIES.length,
  });
  console.log("Tickets by status:");
  console.table(byStatus);

  console.log("Demo logins (password = SEED_PASSWORD from scripts/.env):");
  console.table(
    Object.values(people).map((person) => ({
      name: person.name,
      role: person.role,
      email: person.email,
      tickets: TICKETS.filter((ticket) => ticket.member === person.key).length || "",
    })),
  );
}

// ---------- Main ----------

async function main() {
  const reset = process.argv.includes("--reset");
  const target = initFirebase();
  const password = readSeedPassword();
  const auth = getAuth();
  const db = getFirestore();
  const now = Date.now();

  console.log(`Seeding ${target}${reset ? " (with --reset)" : ""}…`);

  const seededEmails = new Set([...STAFF, ...MEMBERS].map((person) => emailFor(person)));
  if (reset) {
    await resetData(auth, db, seededEmails);
  } else {
    const existing = await db.collection("tickets").limit(1).get();
    if (!existing.empty) {
      console.error("Tickets already exist. Run `npm run seed:reset` to wipe and reseed.");
      process.exitCode = 1;
      return;
    }
  }

  const writer = new BatchWriter(db);
  const people = await seedUsers(auth, writer, password, now);
  await seedTickets(db, writer, people, now);
  await seedQuickReplies(db, writer, people, now);
  await writer.flush();

  console.log(`Done: ${writer.total} documents written.`);
  printSummary(people);
}

main().catch((error) => {
  console.error("Seed failed:", error.message);
  console.error(error);
  process.exitCode = 1;
});
