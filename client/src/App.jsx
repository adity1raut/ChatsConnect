import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import Providers from "./app/Providers.jsx";
import AppLayout from "./components/layout/AppLayout.jsx";
import ProtectedRoute from "./components/routes/ProtectedRoute.jsx";
import PublicRoute from "./components/routes/PublicRoute.jsx";
import IncomingCallModal from "./components/video/IncomingCallModal";
import GroupVideoCall from "./components/video/GroupVideoCall";
import VideoCallModal from "./components/video/VideoCallModal";

import Login from "./pages/Login.jsx";
import Registration from "./pages/Register.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Notification from "./pages/Notification.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import Profile from "./pages/Profile.jsx";
import UserProfile from "./pages/UserProfile.jsx";
import SearchPage from "./pages/Search.jsx";
import About from "./pages/About.jsx";
import AuthCallback from "./features/auth/AuthCallback.jsx";
import Verify2FA from "./features/auth/Verify2FA.jsx";

// Signed-in pages share the app shell (sidebar / mobile nav / settings modal)
const signedIn = (page, { fullHeight = false } = {}) => (
  <ProtectedRoute>
    <AppLayout fullHeight={fullHeight}>{page}</AppLayout>
  </ProtectedRoute>
);

function App() {
  return (
    <Router>
      <Providers>
        {/* Global call overlays — visible from any page */}
        <IncomingCallModal />
        <VideoCallModal />
        <GroupVideoCall />

        <Routes>
          <Route path="/" element={<LandingPage />} />
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

          {/* Auth hand-offs: GitHub OAuth and emailed 2FA link */}
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/auth/verify-2fa" element={<Verify2FA />} />

          <Route path="/dashboard" element={signedIn(<Dashboard />)} />
          <Route path="/notifications" element={signedIn(<Notification />)} />
          <Route path="/chat" element={signedIn(<ChatPage />, { fullHeight: true })} />
          <Route path="/profile" element={signedIn(<Profile />)} />
          <Route path="/profile/:userId" element={signedIn(<UserProfile />)} />
          <Route path="/search" element={signedIn(<SearchPage />)} />
          <Route path="/about" element={signedIn(<About />)} />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Providers>
    </Router>
  );
}

export default App;
