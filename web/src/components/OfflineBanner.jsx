import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "../hooks/useOnlineStatus";

/** Fixed strip shown while the device is offline. */
export default function OfflineBanner() {
  const online = useOnlineStatus();
  return (
    <div role="status" aria-live="polite">
      {!online && (
        <p className="fixed inset-x-0 top-0 z-[60] flex items-center justify-center gap-2 bg-slate-900 px-4 pb-2 pt-[calc(0.5rem+env(safe-area-inset-top))] text-center text-sm text-white shadow-md">
          <WifiOff aria-hidden="true" className="h-4 w-4 shrink-0" />
          You're offline. Messages you send will go out when you reconnect.
        </p>
      )}
    </div>
  );
}
