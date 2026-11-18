import { Link, Outlet } from "react-router-dom";
import Logo from "../Logo";
import UserMenu from "../UserMenu";

/** Mobile-first single column for family members. */
export default function MemberLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-md items-center justify-between px-4">
          <Link to="/app/tickets" aria-label="CarePal Support home" className="rounded-lg">
            <Logo />
          </Link>
          <UserMenu />
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-4">
        <Outlet />
      </main>
    </div>
  );
}
