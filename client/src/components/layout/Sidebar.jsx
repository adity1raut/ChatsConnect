import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ChevronsUpDown, Info, LogOut, Monitor, Moon, Settings, Sun } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useNotifications } from "../../context/NotificationContext";
import { useSettingsModal } from "../../context/SettingsModalContext";
import { CountBadge, SegmentedControl, UserAvatar } from "../ui";
import { cn } from "../../lib/utils";
import Brand from "./Brand";
import { NAV_ITEMS, isNavActive } from "./navItems";

const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

function AccountMenu({ onClose, onLogout }) {
  const { openSettings } = useSettingsModal();

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const itemClass =
    "flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm font-medium rounded-lg transition-colors";

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} aria-hidden="true" />
      <div
        role="menu"
        className="absolute right-3 bottom-full left-3 z-50 mb-2 rounded-2xl border border-border bg-popover p-1.5 shadow-2xl animate-scale-in"
      >
        <button
          role="menuitem"
          className={cn(itemClass, "text-foreground hover:bg-muted")}
          onClick={() => {
            onClose();
            openSettings();
          }}
        >
          <Settings className="size-4 text-muted-foreground" aria-hidden="true" /> Settings
        </button>
        <NavLink
          role="menuitem"
          to="/about"
          onClick={onClose}
          className={cn(itemClass, "text-foreground hover:bg-muted")}
        >
          <Info className="size-4 text-muted-foreground" aria-hidden="true" /> About
        </NavLink>
        <div className="my-1 h-px bg-border" />
        <button
          role="menuitem"
          className={cn(itemClass, "text-red-600 hover:bg-red-500/10 dark:text-red-400")}
          onClick={onLogout}
        >
          <LogOut className="size-4" aria-hidden="true" /> Log out
        </button>
      </div>
    </>
  );
}

export default function Sidebar({ className }) {
  const { user, logout } = useAuth();
  const { themeMode, setThemeMode } = useTheme();
  const { unreadCount } = useNotifications();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    // Full reload clears every in-memory context (socket, calls, caches)
    window.location.assign("/login");
  };

  return (
    <aside
      className={cn(
        "relative w-64 shrink-0 flex-col border-r border-border bg-card/90 backdrop-blur-xl",
        className,
      )}
    >
      <div className="px-5 pt-6 pb-5">
        <Brand subtitle="Chat platform" />
      </div>

      <nav aria-label="Main" className="flex flex-1 flex-col gap-1 px-3">
        {NAV_ITEMS.map((item) => {
          const active = isNavActive(item, pathname);
          const Icon = item.icon;
          return (
            <NavLink
              key={item.id}
              to={item.path}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-[18px]" strokeWidth={active ? 2.5 : 2} aria-hidden="true" />
              <span className="flex-1">{item.label}</span>
              {item.showUnread && <CountBadge count={unreadCount} />}
            </NavLink>
          );
        })}
      </nav>

      <div className="flex items-center justify-between px-5 py-3">
        <span className="text-[11px] font-semibold tracking-wider text-faint uppercase">
          Theme
        </span>
        <SegmentedControl
          label="Theme"
          options={THEME_OPTIONS}
          value={themeMode}
          onChange={setThemeMode}
          size="sm"
        />
      </div>

      <div className="relative border-t border-border p-3">
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-muted"
        >
          <UserAvatar src={user?.avatar} name={user?.name} size="sm" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-foreground">{user?.name}</span>
            <span className="block truncate text-xs text-muted-foreground">@{user?.username}</span>
          </span>
          <ChevronsUpDown className="size-4 text-faint" aria-hidden="true" />
        </button>
        {menuOpen && (
          <AccountMenu onClose={() => setMenuOpen(false)} onLogout={handleLogout} />
        )}
      </div>
    </aside>
  );
}
