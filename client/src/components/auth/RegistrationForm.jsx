import React, { useState } from "react";
import {
  MessageSquare,
  Video,
  Users,
  Sparkles,
  Github,
  Mail,
  Lock,
  User,
  KeyRound,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import ThemeToggle from "../common/ThemeToggle";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function RegistrationForm() {
  const [step, setStep] = useState(1); // 1: Registration, 2: OTP Verification
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const handleSignUp = async () => {
    setError("");
    setSuccess("");

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/request-otp`, {
        email,
        username: name,
        password,
      });

      if (response.data.success) {
        setSuccess("OTP sent to your email! Please check your inbox.");
        setStep(2); // Move to OTP verification step
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to send OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setError("");
    setSuccess("");

    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/verify-otp`, {
        email,
        otp,
      });

      if (response.data.success) {
        // Store tokens in localStorage
        localStorage.setItem("accessToken", response.data.accessToken);
        localStorage.setItem("refreshToken", response.data.refreshToken);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        setSuccess("Account created successfully! Redirecting...");

        // Redirect to dashboard or home after 1.5 seconds
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Invalid OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/request-otp`, {
        email,
        username: name,
        password,
      });

      if (response.data.success) {
        setSuccess("New OTP sent to your email!");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleGithubAuth = () => {
    setLoading(true);
    // Implement GitHub OAuth flow
    window.location.href = `${API_URL}/auth/github`;
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      if (step === 1) {
        handleSignUp();
      } else {
        handleVerifyOTP();
      }
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${
        isDark
          ? "bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900"
          : "bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400"
      } flex items-center justify-center p-4 sm:p-6 md:p-8`}
    >
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50">
        <ThemeToggle />
      </div>

      <div className="relative z-10 w-full max-w-6xl flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
        {/* Left Side - Branding & Features */}
        <div
          className={`hidden lg:flex lg:flex-1 flex-col ${
            isDark ? "text-white" : "text-white"
          } space-y-8`}
        >
          <div className="space-y-4">
            <div
              className={`inline-flex items-center gap-3 ${
                isDark ? "bg-white/10" : "bg-white/20"
              } backdrop-blur-md px-6 py-3 rounded-full border ${
                isDark ? "border-white/20" : "border-white/30"
              } shadow-xl`}
            >
              <MessageSquare className="w-8 h-8" />
              <span className="text-2xl font-bold">ChatConnect</span>
            </div>
            <h1 className="text-5xl font-bold leading-tight">
              Join Our
              <br />
              <span
                className={`${isDark ? "text-purple-300" : "text-blue-100"}`}
              >
                Community
              </span>
            </h1>
            <p
              className={`text-lg ${isDark ? "text-gray-300" : "text-blue-50"}`}
            >
              Create your account and start connecting with people around the
              world through AI-enhanced messaging.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="space-y-4">
            <div
              className={`${
                isDark
                  ? "bg-white/5 border-white/10"
                  : "bg-white/20 border-white/30"
              } backdrop-blur-xl rounded-2xl p-6 border hover:bg-white/20 transition-all shadow-xl`}
            >
              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl shadow-lg">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">AI Enhancement</h3>
                  <p
                    className={`${isDark ? "text-gray-300" : "text-blue-50"} text-sm`}
                  >
                    Smart replies, message summarization, and intelligent
                    conversation insights powered by AI.
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`${
                isDark
                  ? "bg-white/5 border-white/10"
                  : "bg-white/20 border-white/30"
              } backdrop-blur-xl rounded-2xl p-6 border hover:bg-white/20 transition-all shadow-xl`}
            >
              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-br from-pink-500 to-pink-600 p-3 rounded-xl shadow-lg">
                  <Video className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">HD Video Calls</h3>
                  <p
                    className={`${isDark ? "text-gray-300" : "text-blue-50"} text-sm`}
                  >
                    Connect face-to-face with crystal-clear video quality and
                    screen sharing capabilities.
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`${
                isDark
                  ? "bg-white/5 border-white/10"
                  : "bg-white/20 border-white/30"
              } backdrop-blur-xl rounded-2xl p-6 border hover:bg-white/20 transition-all shadow-xl`}
            >
              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Group Chat</h3>
                  <p
                    className={`${isDark ? "text-gray-300" : "text-blue-50"} text-sm`}
                  >
                    Create unlimited groups, channels, and communities for
                    seamless team collaboration.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="w-full lg:flex-1 lg:max-w-md">
          {/* Mobile Logo */}
          <div className="text-center mb-6 lg:hidden">
            <div
              className={`inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 ${
                isDark ? "bg-gray-800" : "bg-white"
              } rounded-2xl shadow-xl mb-3`}
            >
              <MessageSquare
                className={`w-8 h-8 sm:w-10 sm:h-10 ${isDark ? "text-purple-400" : "text-purple-600"}`}
              />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              ChatConnect
            </h1>
            <p
              className={`${isDark ? "text-gray-300" : "text-blue-50"} text-xs sm:text-sm mb-4`}
            >
              Real-time messaging with AI enhancement
            </p>

            {/* Mobile Features */}
            <div className="flex items-center justify-center gap-3 sm:gap-6 text-white text-xs sm:text-sm">
              <div className="flex items-center gap-1 sm:gap-2">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>AI</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <Video className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Video</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Groups</span>
              </div>
            </div>
          </div>

          {/* Registration Card */}
          <div
            className={`${
              isDark
                ? "bg-gray-800/90 border-gray-700/50"
                : "bg-white/95 border-white/50"
            } backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 border transition-colors duration-500`}
          >
            <h2
              className={`text-xl sm:text-2xl font-bold ${isDark ? "text-white" : "text-gray-800"} mb-2 text-center`}
            >
              {step === 1 ? "Create Account" : "Verify OTP"}
            </h2>

            {step === 2 && (
              <p
                className={`text-xs sm:text-sm ${isDark ? "text-gray-400" : "text-gray-600"} text-center mb-4`}
              >
                Enter the 6-digit code sent to {email}
              </p>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mb-4 p-3 bg-green-500/10 border border-green-500/50 rounded-lg">
                <p className="text-green-500 text-sm">{success}</p>
              </div>
            )}

            {/* Step 1: Registration Form */}
            {step === 1 && (
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label
                    className={`block text-xs sm:text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"} mb-1 sm:mb-2`}
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <User
                      className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 ${isDark ? "text-gray-500" : "text-gray-400"}`}
                    />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="John Doe"
                      className={`w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base ${
                        isDark
                          ? "bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-purple-500"
                      } border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-purple-500/50 outline-none transition-all`}
                    />
                  </div>
                </div>

                <div>
                  <label
                    className={`block text-xs sm:text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"} mb-1 sm:mb-2`}
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail
                      className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 ${isDark ? "text-gray-500" : "text-gray-400"}`}
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="you@example.com"
                      className={`w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base ${
                        isDark
                          ? "bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-purple-500"
                      } border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-purple-500/50 outline-none transition-all`}
                    />
                  </div>
                </div>

                <div>
                  <label
                    className={`block text-xs sm:text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"} mb-1 sm:mb-2`}
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock
                      className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 ${isDark ? "text-gray-500" : "text-gray-400"}`}
                    />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="••••••••"
                      className={`w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base ${
                        isDark
                          ? "bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-purple-500"
                      } border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-purple-500/50 outline-none transition-all`}
                    />
                  </div>
                </div>

                <div>
                  <label
                    className={`block text-xs sm:text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"} mb-1 sm:mb-2`}
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock
                      className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 ${isDark ? "text-gray-500" : "text-gray-400"}`}
                    />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="••••••••"
                      className={`w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base ${
                        isDark
                          ? "bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-purple-500"
                      } border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-purple-500/50 outline-none transition-all`}
                    />
                  </div>
                </div>

                <button
                  onClick={handleSignUp}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Sending OTP..." : "Continue"}
                </button>
              </div>
            )}

            {/* Step 2: OTP Verification */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label
                    className={`block text-xs sm:text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"} mb-2`}
                  >
                    Enter OTP
                  </label>
                  <div className="relative">
                    <KeyRound
                      className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? "text-gray-500" : "text-gray-400"}`}
                    />
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      onKeyPress={handleKeyPress}
                      placeholder="000000"
                      maxLength={6}
                      className={`w-full pl-10 pr-4 py-3 text-center text-2xl tracking-widest font-semibold ${
                        isDark
                          ? "bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-purple-500"
                      } border rounded-xl focus:ring-2 focus:ring-purple-500/50 outline-none transition-all`}
                    />
                  </div>
                </div>

                <button
                  onClick={handleVerifyOTP}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold text-base hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Verifying..." : "Verify & Create Account"}
                </button>

                <button
                  onClick={handleResendOTP}
                  disabled={loading}
                  className={`w-full ${
                    isDark
                      ? "bg-gray-700 hover:bg-gray-600 text-white"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                  } py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  Resend OTP
                </button>

                <button
                  onClick={() => setStep(1)}
                  className={`w-full text-center ${isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-800"} text-sm transition-colors`}
                >
                  ← Back to Registration
                </button>
              </div>
            )}

            {/* Divider - Only show in step 1 */}
            {step === 1 && (
              <>
                <div className="relative my-4 sm:my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div
                      className={`w-full border-t ${isDark ? "border-gray-600" : "border-gray-300"}`}
                    ></div>
                  </div>
                  <div className="relative flex justify-center text-xs sm:text-sm">
                    <span
                      className={`px-3 sm:px-4 ${isDark ? "bg-gray-800 text-gray-400" : "bg-white text-gray-500"}`}
                    >
                      Or continue with
                    </span>
                  </div>
                </div>

                {/* GitHub Signup */}
                <button
                  onClick={handleGithubAuth}
                  disabled={loading}
                  className={`w-full ${
                    isDark
                      ? "bg-gray-700 hover:bg-gray-600"
                      : "bg-gray-900 hover:bg-gray-800"
                  } text-white py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <Github className="w-4 h-4 sm:w-5 sm:h-5" />
                  Continue with GitHub
                </button>
              </>
            )}

            {/* Toggle to Login */}
            <div
              className={`mt-4 sm:mt-6 text-center text-xs sm:text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}
            >
              Already have an account?{" "}
              <Link
                to="/login"
                className={`${isDark ? "text-purple-400 hover:text-purple-300" : "text-purple-600 hover:text-purple-700"} font-semibold`}
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-white text-xs mt-4 sm:mt-6 opacity-80 px-4">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
