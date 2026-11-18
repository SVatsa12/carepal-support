import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import EmptyState from "../components/EmptyState";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      <div className="w-full max-w-md">
        <EmptyState
          icon={Compass}
          title="Page not found"
          message="The page you were looking for doesn't exist or has moved."
          action={
            <Link
              to="/"
              className="inline-flex min-h-11 items-center rounded-xl bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700"
            >
              Go to home
            </Link>
          }
        />
      </div>
    </main>
  );
}
