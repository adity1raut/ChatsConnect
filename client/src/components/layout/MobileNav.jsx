import { NavLink, useLocation } from "react-router-dom";
import { useNotifications } from "../../context/NotificationContext";
import { CountBadge } from "../ui";
import { cn } from "../../lib/utils";
import { NAV_ITEMS, isNavActive } from "./navItems";

// Bottom tab bar on phones; hidden from md up where the sidebar takes over
export default function MobileNav() {
  const { pathname } = useLocation();
  const { unreadCount } = useNotifications();

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-sidebar/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
    >
      <div className="grid h-14 grid-cols-6">
        {NAV_ITEMS.map((item) => {
          const active = isNavActive(item, pathname);
          const Icon = item.icon;
          return (
            <NavLink
              key={item.id}
              to={item.path}
              aria-current={active ? "page" : undefined}
              aria-label={item.label}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 border-t-2 transition-colors",
                active ? "border-primary bg-primary/[0.06] text-primary" : "border-transparent text-faint hover:text-foreground",
              )}
            >
              <span className="relative">
                <Icon className="size-5" strokeWidth={active ? 2.4 : 2} aria-hidden="true" />
                {item.showUnread && (
                  <CountBadge count={unreadCount} className="absolute -top-1.5 -right-3 h-4 min-w-4 px-0.5 text-[9px]" />
                )}
              </span>
              <span className="text-[9px] font-bold tracking-[0.12em] uppercase">{item.shortLabel}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
