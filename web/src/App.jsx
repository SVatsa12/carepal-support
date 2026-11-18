import { Toaster } from "react-hot-toast";
import { HeartHandshake } from "lucide-react";
import { APP_NAME } from "./constants";

export default function App() {
  return (
    <>
      <main className="flex min-h-dvh items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white">
            <HeartHandshake aria-hidden="true" className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-semibold text-slate-900">{APP_NAME}</h1>
          <p className="mt-1 text-sm text-slate-600">
            Help for families, from the TheCarePal team.
          </p>
        </div>
      </main>
      <Toaster position="top-center" />
    </>
  );
}
