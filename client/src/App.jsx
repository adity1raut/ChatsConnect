import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login.jsx";
import Registration from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Notification from "./pages/Notification.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import Sidebar from "./components/common/Sidebar.jsx";
import ProtectedRoute from "./components/routes/ProtectedRoute.jsx";
import PublicRoute from "./components/routes/PublicRoute.jsx";
import { useAuth } from "./context/AuthContext";

function MainLayout({ children }) {
  const [currentView, setCurrentView] = useState("home");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [_showSettingsModal, setShowSettingsModal] = useState(false);
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
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
      <AuthProvider>
        <Router>
          <Routes>
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            <Route 
              path="/registration" 
              element={
                <PublicRoute>
                  <Registration />
                </PublicRoute>
              } 
            />
            
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Dashboard />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Notification />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <ChatPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;