import { SignalBars, StatusDot } from "../ui";

// Status strip that closes every public page, after the reference's "SYSTEM.ACTIVE" bar
export default function SiteFooter() {
  return (
    <footer className="border-t border-border bg-sidebar">
      <div className="mx-auto flex h-12 max-w-6xl items-center justify-between gap-4 px-4 text-[10px] font-bold tracking-[0.14em] text-faint uppercase sm:px-6">
        <div className="flex items-center gap-5">
          <span>System.Active</span>
          <SignalBars />
          <span className="hidden sm:inline">v2.0.0</span>
        </div>
        <div className="flex items-center gap-5">
          <span className="flex items-center gap-2">
            <StatusDot pulse /> Encrypting
          </span>
          <span className="hidden sm:inline">Keys: device-only</span>
        </div>
      </div>
    </footer>
  );
}
