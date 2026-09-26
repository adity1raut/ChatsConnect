import { NavLink, useLocation } from "react-router-dom";
import { ChevronsUpDown, Info, LogOut, Monitor, Moon, Settings, Sun } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useNotifications } from "../../context/NotificationContext";
import { useSettingsModal } from "../../context/SettingsModalContext";
import {
  CountBadge,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  SegmentedControl,
  UserAvatar,
} from "../ui";
import { cn } from "../../lib/utils";
import Brand from "./Brand";
import { NAV_ITEMS, isNavActive } from "./navItems";

const THEME_OPTIONS = [
  { value: "dark", label: "Dark", icon: Moon },
  { value: "light", label: "Light", icon: Sun },
  { value: "system", label: "System", icon: Monitor },
];

export default function Sidebar({ className }) {
  const { user, logout } = useAuth();
  const { themeMode, setThemeMode } = useTheme();
  const { unreadCount } = useNotifications();
  const { openSettings } = useSettingsModal();
  const { pathname } = useLocation();

  const handleLogout = () => {
    logout();
    // Full reload clears every in-memory context (socket, calls, caches)
    window.location.assign("/login");
  };

  return (
    <aside className={cn("w-60 shrink-0 flex-col border-r border-border bg-sidebar", className)}>
      <div className="border-b border-border px-5 py-5">
        <Brand subtitle="Secure messaging" />
      </div>

      <p className="eyebrow px-5 pt-6 pb-3 text-primary">Workspace</p>
      <nav aria-label="Main" className="flex flex-1 flex-col gap-px overflow-y-auto scrollbar-none">
        {NAV_ITEMS.map((item, index) => {
          const active = isNavActive(item, pathname);
          const Icon = item.icon;
          return (
            <NavLink
              key={item.id}
              to={item.path}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex items-center gap-3 border-l-2 py-2.5 pr-4 pl-[18px] text-[13px] font-bold transition-colors",
                active
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-transparent text-muted-foreground hover:border-border-strong hover:bg-accent hover:text-foreground",
              )}
            >
              <span className={cn("w-5 text-[10px] tabular-nums", active ? "text-primary" : "text-faint")}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <Icon
                className={cn("size-4", active ? "text-primary" : "text-faint group-hover:text-foreground")}
                aria-hidden="true"
              />
              <span className="flex-1">{item.label}</span>
              {item.showUnread && <CountBadge count={unreadCount} />}
            </NavLink>
          );
        })}
      </nav>

      <div className="flex items-center justify-between border-t border-border px-5 py-3">
        <span className="eyebrow text-faint">Theme</span>
        <SegmentedControl label="Theme" options={THEME_OPTIONS} value={themeMode} onChange={setThemeMode} size="sm" />
      </div>

      <div className="border-t border-border p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex w-full items-center gap-3 border border-transparent p-2 text-left transition-colors hover:border-border hover:bg-accent data-[state=open]:border-border data-[state=open]:bg-accent"
            >
              <UserAvatar src={user?.avatar} name={user?.name} size="sm" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-bold text-foreground">{user?.name}</span>
                <span className="block truncate text-[11px] text-faint">@{user?.username}</span>
              </span>
              <ChevronsUpDown className="size-4 text-faint" aria-hidden="true" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-(--radix-dropdown-menu-trigger-width)">
            <DropdownMenuLabel>Account</DropdownMenuLabel>
            <DropdownMenuItem onSelect={openSettings}>
              <Settings /> Settings
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <NavLink to="/about">
                <Info /> About
              </NavLink>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={handleLogout}>
              <LogOut /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
