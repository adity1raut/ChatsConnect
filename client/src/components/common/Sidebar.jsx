import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import {
  Home,
  Search,
  MessageSquare,
  Bell,
  User,
  Info,
  MoreHorizontal,
  Settings,
  Activity,
  Bookmark,
  Palette,
  AlertCircle,
  LogOut,
  SwitchCamera,
  Sparkles,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";

export default function Sidebar({
  currentView = "home",
  setCurrentView = () => {},
  showUserMenu = false,
  setShowUserMenu = () => {},
  setShowSettingsModal = () => {},
  handleLogout = () => {},
  unreadNotifications = 3,
}) {
  const { isDark, themeMode, setThemeMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveView = () => {
    const path = location.pathname;
    if (path === "/") return "home";
    if (path === "/chat") return "messages";
    if (path === "/notifications") return "notifications";
    if (path === "/profile") return "profile";
    if (path === "/about") return "about";
    return currentView;
  };

  const activeView = getActiveView();

  const handleNavigation = (view, path) => {
    setCurrentView(view);
    navigate(path);
  };

  const NAV_ITEMS = [
    { id: "home", label: "Home", icon: Home, path: "/" },
    { id: "search", label: "Search", icon: Search, path: "/search" },
    {
      id: "messages",
      label: "Messages",
      icon: MessageSquare,
      path: "/chat",
      badge: "●",
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      path: "/notifications",
      badge:
        unreadNotifications > 0
          ? unreadNotifications > 9
            ? "9+"
            : unreadNotifications
          : null,
    },
    { id: "profile", label: "Profile", icon: User, path: "/profile" },
    { id: "about", label: "About", icon: Info, path: "/about" },
  ];

  const MENU_ITEMS = [
    {
      label: "Settings",
      icon: Settings,
      action: () => {
        setShowSettingsModal(true);
        setShowUserMenu(false);
      },
    },
    {
      label: "Your activity",
      icon: Activity,
      action: () => setShowUserMenu(false),
    },
    { label: "Saved", icon: Bookmark, action: () => setShowUserMenu(false) },
    {
      label: "Appearance",
      icon: Palette,
      action: () => setShowUserMenu(false),
    },
    {
      label: "Report a problem",
      icon: AlertCircle,
      action: () => setShowUserMenu(false),
    },
    { divider: true },
    {
      label: "Switch accounts",
      icon: SwitchCamera,
      action: () => setShowUserMenu(false),
    },
    { divider: true },
    { label: "Log out", icon: LogOut, action: handleLogout, danger: true },
  ];

  return (
    <div
      className={`w-64 flex flex-col h-full transition-all duration-300 relative ${
        isDark
          ? "bg-gray-950/95 border-r border-white/[0.06]"
          : "bg-white/95 border-r border-gray-200/80"
      }`}
      style={{ backdropFilter: "blur(20px)" }}
    >
      {/* Subtle top-to-bottom gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isDark
            ? "linear-gradient(180deg, rgba(139,92,246,0.05) 0%, transparent 40%)"
            : "linear-gradient(180deg, rgba(139,92,246,0.04) 0%, transparent 40%)",
        }}
      />

      {/* Logo */}
      <div className="relative px-5 pt-7 pb-6">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #a855f7, #ec4899)",
            }}
          >
            <Sparkles size={16} className="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1
              className="text-lg font-extrabold tracking-tight bg-clip-text text-transparent"
              style={{
                backgroundImage: "linear-gradient(135deg, #7c3aed, #a855f7)",
              }}
            >
              ChatsConnect
            </h1>
            <p
              className={`text-[10px] font-medium -mt-0.5 ${isDark ? "text-gray-500" : "text-gray-400"}`}
            >
              Chat platform
            </p>
          </div>
        </div>

        {/* Separator */}
        <div className={`mt-5 h-px ${isDark ? "bg-white/5" : "bg-gray-100"}`} />
      </div>

      {/* Navigation */}
      <nav className="relative flex-1 flex flex-col gap-1 px-3">
        {NAV_ITEMS.map((item) => {
          const isActive = activeView === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.id, item.path)}
              className={`relative flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 w-full text-left group ${
                isActive
                  ? "text-white shadow-lg"
                  : isDark
                    ? "text-gray-400 hover:text-white hover:bg-white/5"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
              style={
                isActive
                  ? {
                      background:
                        "linear-gradient(135deg, rgba(124,58,237,0.9), rgba(168,85,247,0.8))",
                      boxShadow: "0 4px 20px rgba(124,58,237,0.35)",
                    }
                  : {}
              }
            >
              {/* Active left bar */}
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-white opacity-60" />
              )}

              {/* Icon container */}
              <span
                className={`flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 transition-all duration-200 ${
                  isActive
                    ? "bg-white/20"
                    : isDark
                      ? "bg-white/5 group-hover:bg-white/10"
                      : "bg-gray-100 group-hover:bg-gray-200"
                }`}
              >
                <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
              </span>

              <span className="font-semibold tracking-tight">{item.label}</span>

              {/* Badges */}
              {item.id === "messages" && !isActive && (
                <span className="absolute left-8 top-2.5 w-2 h-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-full shadow-sm animate-pulse" />
              )}
              {item.badge &&
                item.id === "notifications" &&
                !isActive &&
                unreadNotifications > 0 && (
                  <span className="ml-auto min-w-[20px] h-5 px-1.5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-md">
                    {item.badge}
                  </span>
                )}
            </button>
          );
        })}
      </nav>

      {/* Bottom separator */}
      <div className={`mx-5 h-px ${isDark ? "bg-white/5" : "bg-gray-100"}`} />

      {/* Theme toggle */}
      <div className="px-5 py-3 flex items-center justify-between">
        <span
          className={`text-[11px] font-semibold uppercase tracking-wider ${isDark ? "text-gray-600" : "text-gray-400"}`}
        >
          Theme
        </span>
        <div
          className={`flex items-center gap-1 p-1 rounded-lg ${isDark ? "bg-white/5" : "bg-gray-100"}`}
        >
          {[
            { mode: "light", Icon: Sun, title: "Light" },
            { mode: "dark", Icon: Moon, title: "Dark" },
            { mode: "system", Icon: Monitor, title: "System" },
          ].map(({ mode, Icon, title }) => (
            <button
              key={mode}
              onClick={() => setThemeMode(mode)}
              title={title}
              className={`w-7 h-7 flex items-center justify-center rounded-md transition-all duration-200 ${
                themeMode === mode
                  ? "bg-violet-500 text-white shadow-sm"
                  : isDark
                    ? "text-gray-500 hover:text-gray-300 hover:bg-white/8"
                    : "text-gray-400 hover:text-gray-700 hover:bg-white"
              }`}
            >
              <Icon size={13} strokeWidth={2} />
            </button>
          ))}
        </div>
      </div>

      {/* More / user menu trigger */}
      <div className="relative px-3 py-4">
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className={`relative flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 w-full text-left group ${
            isDark
              ? "text-gray-400 hover:text-white hover:bg-white/5"
              : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
          }`}
        >
          <span
            className={`flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 ${
              isDark
                ? "bg-white/5 group-hover:bg-white/10"
                : "bg-gray-100 group-hover:bg-gray-200"
            }`}
          >
            <MoreHorizontal size={16} strokeWidth={2} />
          </span>
          <span className="font-semibold tracking-tight">More</span>
        </button>

        {/* Dropdown menu */}
        {showUserMenu && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
              onClick={() => setShowUserMenu(false)}
            />

            <div
              className={`absolute bottom-full left-2 right-2 mb-2 rounded-2xl shadow-2xl py-1.5 z-50 border overflow-hidden ${
                isDark
                  ? "bg-gray-900/98 border-white/10"
                  : "bg-white border-gray-200/80"
              }`}
              style={{ backdropFilter: "blur(20px)" }}
            >
              {/* Gradient top bar */}
              <div className="h-0.5 w-full bg-gradient-to-r from-violet-500 to-purple-500 opacity-60 mb-1" />

              {MENU_ITEMS.map((item, i) => {
                if (item.divider) {
                  return (
                    <div
                      key={i}
                      className={`h-px my-1 mx-2 ${isDark ? "bg-white/5" : "bg-gray-100"}`}
                    />
                  );
                }
                const Icon = item.icon;
                return (
                  <button
                    key={i}
                    onClick={item.action}
                    className={`w-full px-4 py-2.5 text-left flex items-center gap-3 text-sm font-medium transition-all duration-150 ${
                      item.danger
                        ? isDark
                          ? "text-red-400 hover:bg-red-500/10 hover:text-red-300"
                          : "text-red-600 hover:bg-red-50 hover:text-red-700"
                        : isDark
                          ? "text-gray-300 hover:bg-white/5 hover:text-white"
                          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <Icon size={16} strokeWidth={2} className="flex-shrink-0" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
