import { SettingsModalProvider } from "../../context/SettingsModalContext";
import { cn } from "../../lib/utils";
import MobileNav from "./MobileNav";
import Sidebar from "./Sidebar";
import StatusBar from "./StatusBar";

/**
 * Shell for every signed-in page: sidebar + status bar on desktop, bottom
 * tab bar on phones. `fullHeight` pages (chat) manage their own scrolling.
 */
export default function AppLayout({ children, fullHeight = false }) {
  return (
    <SettingsModalProvider>
      <div className="flex h-dvh overflow-hidden bg-background text-foreground">
        <Sidebar className="hidden md:flex" />
        <div className="flex min-w-0 flex-1 flex-col">
          <main
            id="main"
            className={cn(
              "min-h-0 min-w-0",
              fullHeight
                ? "h-above-mobile-nav flex-none overflow-hidden md:h-auto md:flex-1"
                : "flex-1 overflow-y-auto bg-grid pb-mobile-nav md:pb-0",
            )}
          >
            {children}
          </main>
          <StatusBar className="hidden md:flex" />
        </div>
        <MobileNav />
      </div>
    </SettingsModalProvider>
  );
}
