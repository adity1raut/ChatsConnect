import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { Home, MessageSquare, Bell, User, Search } from "lucide-react";

import Login from "./pages/Login.jsx";
import Registration from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Notification from "./pages/Notification.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import Profile from "./pages/Profile.jsx";
import SearchPage from "./pages/Search.jsx";
import Sidebar from "./components/common/Sidebar.jsx";
import ProtectedRoute from "./components/routes/ProtectedRoute.jsx";
import PublicRoute from "./components/routes/PublicRoute.jsx";

/* ─── Mobile bottom nav bar ─── */
function MobileNav({ unreadNotifications = 3 }) {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const items = [
    { label: "Home", icon: Home, path: "/" },
    { label: "Search", icon: Search, path: "/search" },
    { label: "Chats", icon: MessageSquare, path: "/chat", badge: "●" },
    { label: "Alerts", icon: Bell, path: "/notifications", badge: unreadNotifications > 0 ? (unreadNotifications > 9 ? "9+" : String(unreadNotifications)) : null },
    { label: "Profile", icon: User, path: "/profile" },
  ];

  const activePath = location.pathname;

  return (
    <nav
      className={`fixed bottom-0 inset-x-0 z-50 flex items-center justify-around h-14 border-t transition-colors duration-300 md:hidden ${isDark ? "bg-gray-950/95 border-white/[0.07]" : "bg-white/95 border-gray-200"
        }`}
      style={{ backdropFilter: "blur(20px)", paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {items.map(({ label, icon: Icon, path, badge }) => {
        const isActive = activePath === path || (activePath.startsWith(path) && path !== "/");
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`relative flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 min-w-[52px] ${isActive ? "text-violet-500" : isDark ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-700"
              }`}
          >
            {isActive && (
              <span className="absolute top-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-violet-500" />
            )}
            <div className={`relative ${isActive ? "scale-110" : ""} transition-transform duration-200`}>
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              {badge && badge !== "●" && (
                <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white text-[9px] font-bold shadow-md">
                  {badge}
                </span>
              )}
              {badge === "●" && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border border-current animate-pulse" />
              )}
            </div>
            <span className={`text-[10px] font-semibold tracking-tight ${isActive ? "text-violet-500" : ""}`}>
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

/* ─── Scrollable layout for normal pages ─── */
function MainLayout({ children }) {
  const [currentView, setCurrentView] = useState("home");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [_showSettingsModal, setShowSettingsModal] = useState(false);
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <div className="flex h-[100dvh] overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0 md:h-full">
        <Sidebar
          currentView={currentView}
          setCurrentView={setCurrentView}
          showUserMenu={showUserMenu}
          setShowUserMenu={setShowUserMenu}
          setShowSettingsModal={setShowSettingsModal}
          handleLogout={handleLogout}
          unreadNotifications={3}
        />
      </div>

      {/* Scrollable content — extra pb on mobile for bottom nav */}
      <div className="flex-1 overflow-y-auto pb-14 md:pb-0">
        {children}
      </div>

      {/* Mobile bottom nav */}
      <MobileNav unreadNotifications={3} />
    </div>
  );
}

/* ─── Full-height locked layout for Chat ─── */
function ChatLayout({ children }) {
  const [currentView, setCurrentView] = useState("home");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [_showSettingsModal, setShowSettingsModal] = useState(false);
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <div className="flex h-[100dvh] overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0 md:h-full">
        <Sidebar
          currentView={currentView}
          setCurrentView={setCurrentView}
          showUserMenu={showUserMenu}
          setShowUserMenu={setShowUserMenu}
          setShowSettingsModal={setShowSettingsModal}
          handleLogout={handleLogout}
          unreadNotifications={3}
        />
      </div>

      {/* Chat gets full height, minus mobile nav height on small screens */}
      <div className="flex-1 overflow-hidden h-full" style={{ height: "calc(100dvh - 56px)", marginBottom: 0 }}>
        <div className="h-full overflow-hidden md:h-full" style={{ height: "100%" }}>
          {children}
        </div>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav unreadNotifications={3} />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/registration" element={<PublicRoute><Registration /></PublicRoute>} />

            <Route path="/" element={<ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><MainLayout><Notification /></MainLayout></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><ChatLayout><ChatPage /></ChatLayout></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><MainLayout><Profile /></MainLayout></ProtectedRoute>} />
            <Route path="/search" element={<ProtectedRoute><MainLayout><SearchPage /></MainLayout></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;