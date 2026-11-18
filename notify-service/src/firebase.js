import { readFileSync } from "node:fs";
import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import config from "./config.js";

function loadServiceAccount() {
  try {
    const json = config.serviceAccountBase64
      ? Buffer.from(config.serviceAccountBase64, "base64").toString("utf8")
      : readFileSync(config.credentialsPath, "utf8");
    return JSON.parse(json);
  } catch (error) {
    const source = config.serviceAccountBase64
      ? "FIREBASE_SERVICE_ACCOUNT_BASE64"
      : "the file at GOOGLE_APPLICATION_CREDENTIALS";
    console.error(`notify-service: couldn't read the service account from ${source}.`);
    console.error(error.message);
    process.exit(1);
  }
}

const app = initializeApp({ credential: cert(loadServiceAccount()) });

export const adminAuth = getAuth(app);
export const db = getFirestore(app);
