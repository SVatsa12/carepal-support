const AUTH_ERROR_MESSAGES = {
  "auth/invalid-credential": "Email or password is incorrect.",
  "auth/wrong-password": "Email or password is incorrect.",
  "auth/user-not-found": "Email or password is incorrect.",
  "auth/invalid-email": "Enter a valid email address.",
  "auth/user-disabled": "This account has been disabled. Please contact TheCarePal support.",
  "auth/too-many-requests": "Too many attempts. Please wait a few minutes and try again.",
  "auth/network-request-failed": "You appear to be offline. Check your connection and try again.",
};

/** Turns a Firebase Auth error into a message that is safe and helpful to show a family member. */
export function friendlyAuthError(error) {
  return AUTH_ERROR_MESSAGES[error?.code] ?? "We couldn't sign you in. Please try again.";
}
