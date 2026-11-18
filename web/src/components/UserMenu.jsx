import { useEffect, useId, useRef, useState } from "react";
import { LogOut } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

function initialsOf(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

/** Avatar button that opens a small menu with the user's name and a sign-out action. */
export default function UserMenu() {
  const { profile, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return undefined;
    const closeOnOutsideClick = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={`Account menu for ${profile?.name ?? "you"}`}
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-800 hover:bg-brand-100"
      >
        {initialsOf(profile?.name)}
      </button>
      {open && (
        <div
          id={menuId}
          className="absolute right-0 z-20 mt-2 w-60 rounded-xl border border-slate-200 bg-white p-2 shadow-lg"
        >
          <div className="px-3 py-2">
            <p className="truncate text-sm font-medium text-slate-900">{profile?.name}</p>
            <p className="truncate text-xs text-slate-500">{profile?.email}</p>
          </div>
          <button
            type="button"
            onClick={signOut}
            className="flex min-h-11 w-full items-center gap-2 rounded-lg px-3 text-left text-sm text-slate-700 hover:bg-slate-100"
          >
            <LogOut aria-hidden="true" className="h-4 w-4" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
