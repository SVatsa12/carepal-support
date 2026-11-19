import { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Headset, Loader2, Users } from "lucide-react";
import toast from "react-hot-toast";
import clsx from "clsx";
import Logo from "../components/Logo";
import LoginIntro from "../components/LoginIntro";
import { FullPageSpinner } from "../components/Spinner";
import { useAuth } from "../hooks/useAuth";
import { friendlyAuthError } from "../utils/authErrors";
import { homePathForRole } from "../utils/roles";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const DEMO_PASSWORD = import.meta.env.VITE_DEMO_PASSWORD;
const DEMO_ACCOUNTS = [
  {
    id: "member",
    label: "Try as a family member",
    email: import.meta.env.VITE_DEMO_MEMBER_EMAIL,
    icon: Users,
  },
  {
    id: "staff",
    label: "Try as support agent",
    email: import.meta.env.VITE_DEMO_STAFF_EMAIL,
    icon: Headset,
  },
];

function validate(email, password) {
  const errors = {};
  if (!email.trim()) errors.email = "Enter your email address.";
  else if (!EMAIL_PATTERN.test(email.trim())) errors.email = "Enter a valid email address.";
  if (!password) errors.password = "Enter your password.";
  return errors;
}

/** Where to go after sign-in: the page the user was sent away from, else their role home. */
function redirectTarget(fromLocation, role) {
  const fromPath = fromLocation ? `${fromLocation.pathname}${fromLocation.search ?? ""}` : null;
  if (fromPath && !fromPath.startsWith("/login")) return fromPath;
  return homePathForRole(role);
}

function FieldError({ id, message }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1 text-sm text-red-700">
      {message}
    </p>
  );
}

export default function Login() {
  const { role, loading, signIn } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [pendingAction, setPendingAction] = useState(null);

  if (role) return <Navigate to={redirectTarget(location.state?.from, role)} replace />;
  // Session check or post-sign-in profile load: show a spinner instead of flashing the form.
  if (loading) return <FullPageSpinner label="Signing you in" />;

  const busy = Boolean(pendingAction);

  async function attemptSignIn(action, signInEmail, signInPassword) {
    if (busy) return;
    setFormError("");
    setPendingAction(action);
    try {
      await signIn(signInEmail, signInPassword);
    } catch (error) {
      console.error("Sign-in failed", error);
      const message = friendlyAuthError(error);
      setFormError(message);
      toast.error(message);
    } finally {
      setPendingAction(null);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate(email, password);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    attemptSignIn("form", email, password);
  }

  const demoConfigured = Boolean(DEMO_PASSWORD);

  return (
    // Phones and tablets: the centred card. From lg: teal intro panel left, the same card right.
    <main className="min-h-dvh lg:grid lg:grid-cols-2">
      <LoginIntro />
      <div className="flex min-h-dvh items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm">
          <div className="mb-6 flex justify-center lg:hidden">
            <Logo />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h1 className="text-lg font-semibold text-slate-900">Sign in</h1>
            <p className="mt-1 text-sm text-slate-600">
              Raise a ticket and chat with the TheCarePal care team.
            </p>

            <div className="mt-5 space-y-3">
              {DEMO_ACCOUNTS.map(({ id, label, email: demoEmail, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  disabled={busy || !demoConfigured || !demoEmail}
                  onClick={() => attemptSignIn(id, demoEmail, DEMO_PASSWORD)}
                  className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-700 px-4 text-sm font-semibold text-white hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {pendingAction === id ? (
                    <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
                  ) : (
                    <Icon aria-hidden="true" className="h-4 w-4" />
                  )}
                  {label}
                </button>
              ))}
              <p className="text-center text-xs text-slate-500">
                {demoConfigured
                  ? "Demo data only. All families, nurses and tickets are invented, and no real patient information is used."
                  : "Demo sign-in isn't configured. Set the VITE_DEMO_* values in web/.env."}
              </p>
            </div>

            <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wide text-slate-500">
              <span className="h-px flex-1 bg-slate-200" />
              or sign in with email
              <span className="h-px flex-1 bg-slate-200" />
            </div>

            <form noValidate onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  className={clsx(
                    "mt-1 block min-h-11 w-full rounded-xl border px-3 text-base text-slate-900 shadow-sm focus:border-brand-600 sm:text-sm",
                    errors.email ? "border-red-400" : "border-slate-300",
                  )}
                />
                <FieldError id="email-error" message={errors.email} />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={errors.password ? "password-error" : undefined}
                  className={clsx(
                    "mt-1 block min-h-11 w-full rounded-xl border px-3 text-base text-slate-900 shadow-sm focus:border-brand-600 sm:text-sm",
                    errors.password ? "border-red-400" : "border-slate-300",
                  )}
                />
                <FieldError id="password-error" message={errors.password} />
              </div>

              {formError && (
                <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
                  {formError}
                </p>
              )}

              <button
                type="submit"
                disabled={busy}
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pendingAction === "form" && (
                  <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
                )}
                Sign in
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
