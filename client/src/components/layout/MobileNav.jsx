import { NavLink, useLocation } from "react-router-dom";
import { useNotifications } from "../../context/NotificationContext";
import { CountBadge } from "../ui";
import { cn } from "../../lib/cn";
import { NAV_ITEMS, isNavActive } from "./navItems";

// Bottom tab bar on phones; hidden from md up where the sidebar takes over
export default function MobileNav() {
  const { pathname } = useLocation();
  const { unreadCount } = useNotifications();

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
    >
      <div className="flex h-14 items-center justify-around">
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
                "relative flex min-w-14 flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 transition-colors",
                active ? "text-accent-fg" : "text-subtle hover:text-fg",
              )}
            >
              {active && (
                <span className="absolute top-0 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-accent" />
              )}
              <span className="relative">
                <Icon className="size-[22px]" strokeWidth={active ? 2.5 : 2} aria-hidden="true" />
                {item.showUnread && (
                  <CountBadge count={unreadCount} className="absolute -top-1.5 -right-2.5 h-4 min-w-4 px-1 text-[9px]" />
                )}
              </span>
              <span className="text-[10px] font-semibold">{item.shortLabel}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
