import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import Login from "./pages/Login.jsx";
import Registration from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Notification from "./pages/Notification.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import Sidebar from "./components/common/Sidebar.jsx";

function MainLayout({ children }) {
  const [currentView, setCurrentView] = useState("home");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [_showSettingsModal, setShowSettingsModal] = useState(false);

  const handleLogout = () => {
    window.location.href = "/login";
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        showUserMenu={showUserMenu}
        setShowUserMenu={setShowUserMenu}
        setShowSettingsModal={setShowSettingsModal}
        handleLogout={handleLogout}
        unreadNotifications={3}
      />
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/registration" element={<Registration />} />
          
          <Route
            path="/"
            element={
              <MainLayout>
                <Dashboard />
              </MainLayout>
            }
          />
          <Route
            path="/notifications"
            element={
              <MainLayout>
                <Notification />
              </MainLayout>
            }
          />
          <Route
            path="/chat"
            element={
              <MainLayout>
                <ChatPage />
              </MainLayout>
            }
          />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;