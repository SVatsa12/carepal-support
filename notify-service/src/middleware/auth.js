import { adminAuth } from "../firebase.js";
import { HttpError } from "../lib/httpError.js";

/** Verifies "Authorization: Bearer <Firebase ID token>" and sets req.uid. */
export async function requireAuth(req, _res, next) {
  const match = /^Bearer (.+)$/.exec(req.get("authorization") ?? "");
  if (!match) return next(new HttpError(401, "Sign in required."));
  try {
    const decoded = await adminAuth.verifyIdToken(match[1]);
    req.uid = decoded.uid;
    return next();
  } catch (error) {
    console.warn("Rejected ID token:", error.code ?? error.message);
    return next(new HttpError(401, "Your session has expired. Sign in again."));
  }
}
