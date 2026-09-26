import { SettingsModalProvider } from "../../context/SettingsModalContext";
import { cn } from "../../lib/cn";
import MobileNav from "./MobileNav";
import Sidebar from "./Sidebar";

/**
 * Shell for every signed-in page: sidebar on desktop, bottom bar on phones.
 * `fullHeight` pages (chat) manage their own scrolling inside a fixed-height box.
 */
export default function AppLayout({ children, fullHeight = false }) {
  return (
    <SettingsModalProvider>
      <div className="flex h-dvh overflow-hidden bg-bg text-fg">
        <Sidebar className="hidden md:flex" />
        <main
          id="main"
          className={cn(
            "min-w-0 flex-1",
            fullHeight
              ? "h-above-mobile-nav overflow-hidden md:h-full"
              : "overflow-y-auto pb-mobile-nav md:pb-0",
          )}
        >
          {children}
        </main>
        <MobileNav />
      </div>
    </SettingsModalProvider>
  );
}
