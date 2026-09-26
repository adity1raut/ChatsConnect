import { Suspense, lazy } from "react";
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
import { Spinner, Toaster } from "./components/ui";

// Each page is its own chunk, loaded when first visited
const Login = lazy(() => import("./pages/Login.jsx"));
const Registration = lazy(() => import("./pages/Register.jsx"));
const LandingPage = lazy(() => import("./pages/LandingPage.jsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));
const Notification = lazy(() => import("./pages/Notification.jsx"));
const ChatPage = lazy(() => import("./pages/ChatPage.jsx"));
const Profile = lazy(() => import("./pages/Profile.jsx"));
const UserProfile = lazy(() => import("./pages/UserProfile.jsx"));
const SearchPage = lazy(() => import("./pages/Search.jsx"));
const About = lazy(() => import("./pages/About.jsx"));
const AuthCallback = lazy(() => import("./features/auth/AuthCallback.jsx"));
const Verify2FA = lazy(() => import("./features/auth/Verify2FA.jsx"));
const AssistantPage = lazy(() => import("./features/ai/AssistantPage.jsx"));

// Signed-in pages share the app shell (sidebar / mobile nav / settings modal)
const PageLoading = () => (
  <div className="flex h-full min-h-[50dvh] items-center justify-center">
    <Spinner label="Loading page" className="size-7" />
  </div>
);

// Signed-in pages keep the shell visible while their code loads
const signedIn = (page, { fullHeight = false } = {}) => (
  <ProtectedRoute>
    <AppLayout fullHeight={fullHeight}>
      <Suspense fallback={<PageLoading />}>{page}</Suspense>
    </AppLayout>
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
        <Toaster />

        <Suspense fallback={<PageLoading />}>
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
            <Route
              path="/chat"
              element={signedIn(<ChatPage />, { fullHeight: true })}
            />
            <Route
              path="/assistant"
              element={signedIn(<AssistantPage />, { fullHeight: true })}
            />
            <Route path="/profile" element={signedIn(<Profile />)} />
            <Route
              path="/profile/:userId"
              element={signedIn(<UserProfile />)}
            />
            <Route path="/search" element={signedIn(<SearchPage />)} />
            <Route path="/about" element={signedIn(<About />)} />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </Providers>
    </Router>
  );
}

export default App;
