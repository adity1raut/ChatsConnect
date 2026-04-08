import React, { useState } from "react";
import {
  MessageSquare,
  Video,
  Users,
  Sparkles,
  Github,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

import { API_URL } from "../../config/api.js";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { isDark } = useTheme();
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleEmailAuth = async () => {
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      if (response.data.success) {
        // Use the login function from AuthContext
        login(response.data.user, response.data.accessToken);

        // Store refresh token separately if needed
        localStorage.setItem("refreshToken", response.data.refreshToken);

        // Navigate to dashboard
        navigate("/dashboard");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Login failed. Please check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGithubAuth = () => {
    setLoading(true);
    // Redirect to GitHub OAuth
    window.location.href = `${API_URL}/auth/github`;
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleEmailAuth();
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 relative overflow-hidden flex items-center justify-center pt-16 p-4 sm:p-6 md:p-8 ${isDark ? "bg-[#0a0a14] text-gray-100" : "bg-[#f4f5ff] text-gray-900"
        }`}
    >
      {/* Background orbs — landing page style */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-32 -left-32 w-125 h-125 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, #7c3aed, transparent 70%)" }}
        />
        <div
          className="absolute -bottom-20 -right-20 w-100 h-100 rounded-full opacity-15 blur-3xl"
          style={{ background: "radial-gradient(circle, #ec4899, transparent 70%)" }}
        />
      </div>

      <div className="relative z-10 w-full max-w-6xl flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
        {/* Left Side - Branding & Features */}
        <div
          className={`hidden lg:flex lg:flex-1 flex-col space-y-8 animate-fade-in-left ${isDark ? "text-gray-100" : "text-gray-900"
            }`}
        >
          <div className="space-y-4">
            <div
              className={`inline-flex items-center gap-3 px-6 py-3 rounded-full border shadow-xl hover:scale-105 transition-transform duration-300 backdrop-blur-md ${isDark ? "bg-white/5 border-white/10" : "bg-violet-50 border-violet-200"
                }`}
            >
              <MessageSquare className="w-8 h-8 animate-pulse" />
              <span className="text-2xl font-bold">ChatConnect</span>
            </div>
            <h1 className="text-5xl font-bold leading-tight animate-fade-in">
              Connect, Collaborate,
              <br />
              <span
                className="bg-clip-text text-transparent inline-block hover:scale-105 transition-transform"
                style={{ backgroundImage: "linear-gradient(135deg, #7c3aed, #a855f7, #ec4899)" }}
              >
                Communicate
              </span>
            </h1>
            <p className={`text-lg ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              Experience the future of messaging with AI-powered conversations,
              crystal-clear video calls, and seamless group collaboration.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="space-y-4">
            <div
              className={`rounded-2xl p-6 border hover:scale-105 hover:shadow-2xl transition-all duration-300 cursor-pointer group backdrop-blur-xl ${isDark
                ? "bg-gray-900/60 border-white/6 hover:border-white/10"
                : "bg-white/90 border-gray-200 hover:shadow-md"
                }`}
            >
              <div className="flex items-start gap-4">
                <div className="bg-linear-to-br from-purple-500 to-purple-600 p-3 rounded-xl shadow-lg group-hover:rotate-12 transition-transform duration-300">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">AI Enhancement</h3>
                  <p
                    className={`${isDark ? "text-gray-300" : "text-gray-500"} text-sm`}
                  >
                    Smart replies, message summarization, and intelligent
                    conversation insights powered by AI.
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`rounded-2xl p-6 border hover:scale-105 hover:shadow-2xl transition-all duration-300 cursor-pointer group backdrop-blur-xl ${isDark
                ? "bg-gray-900/60 border-white/6 hover:border-white/10"
                : "bg-white/90 border-gray-200 hover:shadow-md"
                }`}
            >
              <div className="flex items-start gap-4">
                <div className="bg-linear-to-br from-pink-500 to-pink-600 p-3 rounded-xl shadow-lg group-hover:rotate-12 transition-transform duration-300">
                  <Video className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">HD Video Calls</h3>
                  <p
                    className={`${isDark ? "text-gray-300" : "text-gray-500"} text-sm`}
                  >
                    Connect face-to-face with crystal-clear video quality and
                    screen sharing capabilities.
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`rounded-2xl p-6 border hover:scale-105 hover:shadow-2xl transition-all duration-300 cursor-pointer group backdrop-blur-xl ${isDark
                ? "bg-gray-900/60 border-white/6 hover:border-white/10"
                : "bg-white/90 border-gray-200 hover:shadow-md"
                }`}
            >
              <div className="flex items-start gap-4">
                <div className="bg-linear-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg group-hover:rotate-12 transition-transform duration-300">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Group Chat</h3>
                  <p
                    className={`${isDark ? "text-gray-300" : "text-gray-500"} text-sm`}
                  >
                    Create unlimited groups, channels, and communities for
                    seamless team collaboration.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:flex-1 lg:max-w-md animate-fade-in-right">
          {/* Mobile Logo */}
          <div className="text-center mb-6 lg:hidden">
            <div
              className={`inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl shadow-xl mb-3 hover:scale-110 transition-transform duration-300 ${isDark ? "bg-gray-900 border border-white/6" : "bg-white border border-gray-200"
                }`}
            >
              <MessageSquare
                className={`w-8 h-8 sm:w-10 sm:h-10 ${isDark ? "text-purple-400" : "text-purple-600"}`}
              />
            </div>
            <h1
              className="text-3xl sm:text-4xl font-extrabold mb-2 bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(135deg, #7c3aed, #a855f7, #ec4899)" }}
            >
              ChatsConnect
            </h1>
            <p className={`text-xs sm:text-sm mb-4 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              Real-time messaging with AI enhancement
            </p>

            {/* Mobile Features */}
            <div className={`flex items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              <div className="flex items-center gap-1 sm:gap-2 hover:scale-110 transition-transform">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>AI</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 hover:scale-110 transition-transform">
                <Video className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Video</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 hover:scale-110 transition-transform">
                <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Groups</span>
              </div>
            </div>
          </div>

          {/* Login Card */}
          <div
            className={`backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 border transition-all duration-500 ${isDark
              ? "bg-gray-900/80 border-white/6"
              : "bg-white/95 border-gray-200"
              }`}
          >
            <h2
              className={`text-xl sm:text-2xl font-bold ${isDark ? "text-white" : "text-gray-800"} mb-4 sm:mb-6 text-center`}
            >
              Welcome Back
            </h2>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg animate-shake">
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            )}

            {/* Email/Password Inputs */}
            <div className="space-y-3 sm:space-y-4">
              <div className="group">
                <label
                  className={`block text-xs sm:text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"} mb-1 sm:mb-2 transition-colors`}
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 ${isDark ? "text-gray-500" : "text-gray-400"} group-focus-within:text-purple-500 transition-colors`}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="you@example.com"
                    className={`w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base ${isDark
                      ? "bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-purple-500"
                      } border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-purple-500/50 outline-none transition-all hover:border-purple-400`}
                  />
                </div>
              </div>

              <div className="group">
                <label
                  className={`block text-xs sm:text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"} mb-1 sm:mb-2 transition-colors`}
                >
                  Password
                </label>
                <div className="relative">
                  <Lock
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 ${isDark ? "text-gray-500" : "text-gray-400"} group-focus-within:text-purple-500 transition-colors`}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="••••••••"
                    className={`w-full pl-9 sm:pl-10 pr-10 sm:pr-12 py-2.5 sm:py-3 text-sm sm:text-base ${isDark
                      ? "bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-purple-500"
                      } border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-purple-500/50 outline-none transition-all hover:border-purple-400`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${isDark ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"} transition-colors`}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs sm:text-sm">
                <label className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    className="mr-1.5 sm:mr-2 rounded w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600 focus:ring-purple-500 focus:ring-2 transition-all cursor-pointer"
                  />
                  <span
                    className={`${isDark ? "text-gray-300 group-hover:text-white" : "text-gray-600 group-hover:text-gray-800"} transition-colors`}
                  >
                    Remember me
                  </span>
                </label>
                <button
                  type="button"
                  className={`${isDark ? "text-purple-400 hover:text-purple-300" : "text-purple-600 hover:text-purple-700"} font-medium hover:underline transition-all`}
                >
                  Forgot?
                </button>
              </div>

              <button
                onClick={handleEmailAuth}
                disabled={loading}
                className="w-full bg-linear-to-r from-purple-600 to-pink-600 text-white py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base hover:from-purple-700 hover:to-pink-700 hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Signing In...
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-4 sm:my-6">
              <div className="absolute inset-0 flex items-center">
                <div
                  className={`w-full border-t ${isDark ? "border-gray-600" : "border-gray-300"}`}
                ></div>
              </div>
              <div className="relative flex justify-center text-xs sm:text-sm">
                <span
                  className={`px-3 sm:px-4 text-sm ${isDark ? "bg-gray-900/80 text-gray-500" : "bg-white/95 text-gray-400"}`}
                >
                  Or continue with
                </span>
              </div>
            </div>

            {/* GitHub Login */}
            <button
              onClick={handleGithubAuth}
              disabled={loading}
              className={`w-full ${isDark
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-gray-900 hover:bg-gray-800"
                } text-white py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 group`}
            >
              <Github className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-12 transition-transform" />
              Continue with GitHub
            </button>

            {/* Toggle to Sign Up */}
            <div
              className={`mt-4 sm:mt-6 text-center text-xs sm:text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}
            >
              Don't have an account?{" "}
              <Link
                to="/registration"
                className={`${isDark ? "text-purple-400 hover:text-purple-300" : "text-purple-600 hover:text-purple-700"} font-semibold hover:underline transition-all`}
              >
                Sign Up
              </Link>
            </div>
          </div>

          {/* Footer */}
          <p className={`text-center text-xs mt-4 sm:mt-6 px-4 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
            By continuing, you agree to our{" "}
            <a
              href="#"
              className="font-semibold text-violet-500 hover:text-violet-400 transition-colors"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="font-semibold text-violet-500 hover:text-violet-400 transition-colors"
            >
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
