import { Clock, HeartHandshake, ListChecks, MessagesSquare } from "lucide-react";
import { APP_NAME } from "../constants";

const BENEFITS = [
  { icon: MessagesSquare, text: "Live chat with the care team" },
  { icon: Clock, text: "See how long each request has waited" },
  { icon: ListChecks, text: "Every ticket tracked from raised to resolved" },
];

/** Teal brand panel on the left of the sign-in page, shown from lg up. */
export default function LoginIntro() {
  return (
    <section
      aria-labelledby="login-intro-heading"
      className="hidden bg-brand-800 px-12 py-12 text-white lg:flex lg:items-center lg:justify-center xl:px-16"
    >
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
            <HeartHandshake aria-hidden="true" className="h-6 w-6" />
          </span>
          <h2 id="login-intro-heading" className="text-2xl font-semibold">
            {APP_NAME}
          </h2>
        </div>
        <p className="mt-5 text-lg leading-relaxed text-brand-50">
          One place for families and the care team to sort out late visits, billing and schedule
          changes.
        </p>

        <ul className="mt-8 space-y-4">
          {BENEFITS.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10">
                <Icon aria-hidden="true" className="h-5 w-5" />
              </span>
              <span className="text-base">{text}</span>
            </li>
          ))}
        </ul>

      </div>
    </section>
  );
}
