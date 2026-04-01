import React, { useState } from "react";
import { useAI } from "./context/AIContext";
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
import { SocketProvider } from "./context/SocketContext";
import { NotificationProvider, useNotifications } from "./context/NotificationContext";
import { FriendProvider } from "./context/FriendContext";
import { CallProvider } from "./context/CallContext";
import { GroupCallProvider } from "./context/GroupCallContext";
import { AIProvider } from "./context/AIContext";
import IncomingCallModal from "./components/video/IncomingCallModal";
import GroupVideoCall from "./components/video/GroupVideoCall";
import VideoCallModal from "./components/video/VideoCallModal";
import SettingsModal from "./components/common/SettingsModal";
import { Home, MessageSquare, Bell, User, Search } from "lucide-react";

import Login from "./pages/Login.jsx";
import Registration from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Notification from "./pages/Notification.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import Profile from "./pages/Profile.jsx";
import UserProfile from "./pages/UserProfile.jsx";
import SearchPage from "./pages/Search.jsx";
import AuthCallback from "./pages/AuthCallback.jsx";
import About from "./pages/About.jsx";
import Blog from "./pages/Blog.jsx";
import Sidebar from "./components/common/Sidebar.jsx";
import ProtectedRoute from "./components/routes/ProtectedRoute.jsx";
import PublicRoute from "./components/routes/PublicRoute.jsx";

/* ─── Mobile bottom nav bar ─── */
function MobileNav() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadCount } = useNotifications();

  const items = [
    { label: "Home", icon: Home, path: "/" },
    { label: "Search", icon: Search, path: "/search" },
    { label: "Chats", icon: MessageSquare, path: "/chat" },
    { label: "Alerts", icon: Bell, path: "/notifications", badge: unreadCount > 0 ? (unreadCount > 9 ? "9+" : String(unreadCount)) : null },
    { label: "Profile", icon: User, path: "/profile" },
  ];

  const activePath = location.pathname;

  return (
    <nav
      className={`fixed bottom-0 inset-x-0 z-50 flex items-center justify-around h-14 border-t transition-colors duration-300 md:hidden ${isDark ? "bg-gray-950/95 border-white/[0.07]" : "bg-white/95 border-gray-200"}`}
      style={{ backdropFilter: "blur(20px)", paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {items.map(({ label, icon: Icon, path, badge }) => {
        const isActive = activePath === path || (activePath.startsWith(path) && path !== "/");
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`relative flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 min-w-[52px] ${isActive ? "text-violet-500" : isDark ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-700"}`}
          >
            {isActive && (
              <span className="absolute top-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-violet-500" />
            )}
            <div className={`relative ${isActive ? "scale-110" : ""} transition-transform duration-200`}>
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              {badge && (
                <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white text-[9px] font-bold shadow-md">
                  {badge}
                </span>
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

function MainLayout({ children }) {
  const [currentView, setCurrentView] = useState("home");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const { logout } = useAuth();
  const { unreadCount } = useNotifications();
  const { aiEnabled, setAiEnabled, autoTranslate, setAutoTranslate, preferredLanguage, setPreferredLanguage } = useAI();

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <div className="flex h-[100dvh] overflow-hidden">
      <div className="hidden md:flex md:flex-shrink-0 md:h-full">
        <Sidebar
          currentView={currentView}
          setCurrentView={setCurrentView}
          showUserMenu={showUserMenu}
          setShowUserMenu={setShowUserMenu}
          setShowSettingsModal={setShowSettingsModal}
          handleLogout={handleLogout}
          unreadNotifications={unreadCount}
        />
      </div>
      <div className="flex-1 overflow-y-auto pb-14 md:pb-0">
        {children}
      </div>
      <MobileNav />
      <SettingsModal
        showSettingsModal={showSettingsModal}
        setShowSettingsModal={setShowSettingsModal}
        aiEnabled={aiEnabled}
        setAiEnabled={setAiEnabled}
        autoTranslate={autoTranslate}
        setAutoTranslate={setAutoTranslate}
        preferredLanguage={preferredLanguage}
        setPreferredLanguage={setPreferredLanguage}
        notifications={notifications}
        setNotifications={setNotifications}
      />
    </div>
  );
}

/* ─── Full-height locked layout for Chat ─── */
function ChatLayout({ children }) {
  const [currentView, setCurrentView] = useState("home");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const { logout } = useAuth();
  const { unreadCount } = useNotifications();
  const { aiEnabled, setAiEnabled, autoTranslate, setAutoTranslate, preferredLanguage, setPreferredLanguage } = useAI();

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <div className="flex h-[100dvh] overflow-hidden">
      <div className="hidden md:flex md:flex-shrink-0 md:h-full">
        <Sidebar
          currentView={currentView}
          setCurrentView={setCurrentView}
          showUserMenu={showUserMenu}
          setShowUserMenu={setShowUserMenu}
          setShowSettingsModal={setShowSettingsModal}
          handleLogout={handleLogout}
          unreadNotifications={unreadCount}
        />
      </div>
      <div className="flex-1 overflow-hidden h-[calc(100dvh-56px)] md:h-full">
        <div className="h-full overflow-hidden">
          {children}
        </div>
      </div>
      <MobileNav />
      <SettingsModal
        showSettingsModal={showSettingsModal}
        setShowSettingsModal={setShowSettingsModal}
        aiEnabled={aiEnabled}
        setAiEnabled={setAiEnabled}
        autoTranslate={autoTranslate}
        setAutoTranslate={setAutoTranslate}
        preferredLanguage={preferredLanguage}
        setPreferredLanguage={setPreferredLanguage}
        notifications={notifications}
        setNotifications={setNotifications}
      />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <AIProvider>
          <CallProvider>
          <GroupCallProvider>
          <FriendProvider>
          <NotificationProvider>
            <Router>
              {/* Global call overlays — visible from any page */}
              <IncomingCallModal />
              <VideoCallModal />
              <GroupVideoCall />
              <Routes>
                <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/registration" element={<PublicRoute><Registration /></PublicRoute>} />
                <Route path="/auth/callback" element={<AuthCallback />} />

                <Route path="/" element={<ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />
                <Route path="/notifications" element={<ProtectedRoute><MainLayout><Notification /></MainLayout></ProtectedRoute>} />
                <Route path="/chat" element={<ProtectedRoute><ChatLayout><ChatPage /></ChatLayout></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><MainLayout><Profile /></MainLayout></ProtectedRoute>} />
                <Route path="/profile/:userId" element={<ProtectedRoute><MainLayout><UserProfile /></MainLayout></ProtectedRoute>} />
                <Route path="/search" element={<ProtectedRoute><MainLayout><SearchPage /></MainLayout></ProtectedRoute>} />
                <Route path="/about" element={<ProtectedRoute><MainLayout><About /></MainLayout></ProtectedRoute>} />
                <Route path="/blog" element={<ProtectedRoute><MainLayout><Blog /></MainLayout></ProtectedRoute>} />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Router>
          </NotificationProvider>
          </FriendProvider>
          </GroupCallProvider>
          </CallProvider>
          </AIProvider>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
