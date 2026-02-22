import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

const HomeIcon = ({ filled }) => (
  <svg
    width="26"
    height="26"
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth={filled ? "0" : "2"}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const SearchIcon = () => (
  <svg
    width="26"
    height="26"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const MessagesIcon = ({ filled }) => (
  <svg
    width="26"
    height="26"
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth={filled ? "0" : "2"}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const HeartIcon = ({ filled }) => (
  <svg
    width="26"
    height="26"
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth={filled ? "0" : "2"}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const MenuIcon = () => (
  <svg
    width="26"
    height="26"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

export default function Sidebar({
  currentView = "home",
  setCurrentView = () => {},
  showUserMenu = false,
  setShowUserMenu = () => {},
  setShowSettingsModal = () => {},
  handleLogout = () => {},
  unreadNotifications = 3,
}) {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active view based on current route
  const getActiveView = () => {
    const path = location.pathname;
    if (path === "/") return "home";
    if (path === "/chat") return "messages";
    if (path === "/notifications") return "notifications";
    return currentView;
  };

  const activeView = getActiveView();

  const handleNavigation = (view, path) => {
    setCurrentView(view);
    navigate(path);
  };

  // Centralized style classes
  const sidebarBaseClasses = `
    w-64 
    flex flex-col 
    py-6 px-3 
    border-r 
    transition-all duration-300 ease-in-out
    ${isDark 
      ? "bg-gray-900/95 backdrop-blur-xl border-gray-700/50" 
      : "bg-white/95 backdrop-blur-xl border-gray-200/70"
    }
  `;

  const navButtonActiveClasses = `
    bg-gradient-to-r from-purple-500 to-blue-500 
    text-white 
    shadow-lg 
    font-semibold
    transform scale-105
  `;

  const navButtonInactiveClasses = `
    font-normal
    ${isDark 
      ? "text-gray-300 hover:bg-gray-800/60 hover:text-white" 
      : "text-gray-700 hover:bg-gray-100/80 hover:text-gray-900"
    }
  `;

  const navButtonBaseClasses = `
    flex items-center gap-4 
    px-4 py-3 
    rounded-xl 
    transition-all duration-200 
    ease-in-out
    relative
  `;

  const menuDropdownClasses = `
    absolute bottom-full left-0 
    mb-2 
    rounded-2xl 
    shadow-2xl 
    py-2 
    w-64 
    z-50 
    border
    ${isDark
      ? "bg-gray-900/95 backdrop-blur-xl border-gray-700/50"
      : "bg-white/98 backdrop-blur-xl border-gray-200/70"
    }
  `;

  const menuItemClasses = `
    w-full 
    px-4 py-3 
    text-left 
    flex items-center gap-3 
    transition-all duration-200
    ${isDark
      ? "hover:bg-gray-800/60 text-gray-200 hover:text-white"
      : "hover:bg-gray-100/80 text-gray-700 hover:text-gray-900"
    }
  `;

  const dividerClasses = `
    h-px my-2
    ${isDark ? "bg-gray-700/50" : "bg-gray-200/60"}
  `;

  return (
    <div className={sidebarBaseClasses}>
      {/* Logo */}
      <div className="px-3 mb-8">
        <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
          Connectify
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-2">
        <button
          onClick={() => handleNavigation("home", "/")}
          className={`${navButtonBaseClasses} ${
            activeView === "home" ? navButtonActiveClasses : navButtonInactiveClasses
          }`}
        >
          <HomeIcon filled={activeView === "home"} />
          <span className="text-base">Home</span>
        </button>

        <button
          onClick={() => handleNavigation("search", "/search")}
          className={`${navButtonBaseClasses} ${
            activeView === "search" ? navButtonActiveClasses : navButtonInactiveClasses
          }`}
        >
          <SearchIcon />
          <span className="text-base">Search</span>
        </button>

        <button
          onClick={() => handleNavigation("messages", "/chat")}
          className={`${navButtonBaseClasses} ${
            activeView === "messages" ? navButtonActiveClasses : navButtonInactiveClasses
          }`}
        >
          <MessagesIcon filled={activeView === "messages"} />
          <span className="text-base">Messages</span>
          <span className="absolute left-7 top-2.5 w-2 h-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-full shadow-lg animate-pulse"></span>
        </button>

        <button
          onClick={() => handleNavigation("notifications", "/notifications")}
          className={`${navButtonBaseClasses} ${
            activeView === "notifications" ? navButtonActiveClasses : navButtonInactiveClasses
          }`}
        >
          <HeartIcon filled={activeView === "notifications"} />
          <span className="text-base">Notifications</span>
          {unreadNotifications > 0 && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 min-w-[22px] h-5 px-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
              {unreadNotifications > 9 ? "9+" : unreadNotifications}
            </span>
          )}
        </button>

        <button
          onClick={() => handleNavigation("profile", "/profile")}
          className={`${navButtonBaseClasses} ${
            activeView === "profile" ? navButtonActiveClasses : navButtonInactiveClasses
          }`}
        >
          <div
            className={`
              w-7 h-7 
              rounded-full 
              bg-gradient-to-br from-purple-400 to-pink-500 
              flex items-center justify-center 
              text-white text-sm font-bold 
              shadow-md
              transition-all duration-200
              ${activeView === "profile" ? "ring-2 ring-white ring-offset-2 ring-offset-transparent scale-110" : ""}
            `}
          >
            J
          </div>
          <span className="text-base">Profile</span>
        </button>
      </nav>

      {/* Bottom Menu */}
      <div className="relative mt-4">
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className={`${navButtonBaseClasses} w-full ${navButtonInactiveClasses}`}
        >
          <MenuIcon />
          <span className="text-base">More</span>
        </button>

        {showUserMenu && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
              onClick={() => setShowUserMenu(false)}
            ></div>

            {/* Dropdown Menu */}
            <div className={menuDropdownClasses}>
              <button
                onClick={() => {
                  setShowSettingsModal(true);
                  setShowUserMenu(false);
                }}
                className={menuItemClasses}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 1v6m0 6v6" />
                </svg>
                <span className="text-sm font-medium">Settings</span>
              </button>

              <button className={menuItemClasses}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 2v20M2 12h20" />
                </svg>
                <span className="text-sm font-medium">Your activity</span>
              </button>

              <button className={menuItemClasses}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <span className="text-sm font-medium">Saved</span>
              </button>

              <button className={menuItemClasses}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
                <span className="text-sm font-medium">Switch appearance</span>
              </button>

              <button className={menuItemClasses}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                </svg>
                <span className="text-sm font-medium">Report a problem</span>
              </button>

              <div className={dividerClasses}></div>

              <button className={menuItemClasses}>
                <span className="text-sm font-medium">Switch accounts</span>
              </button>

              <div className={dividerClasses}></div>

              <button onClick={handleLogout} className={menuItemClasses}>
                <span className="text-sm font-medium">Log out</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}