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
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle,
  AtSign,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

import { API_URL } from "../../config/api.js";

export default function RegistrationForm() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { isDark } = useTheme();
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleStep1 = () => {
    setError("");
    setSuccess("");

    if (!name || !username || !email) {
      setError("Please fill in all fields");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      setError(
        "Username must be 3-20 characters (letters, numbers, underscore only)",
      );
      return;
    }

    setStep(2);
  };

  const handleSignUp = async () => {
    setError("");
    setSuccess("");

    if (!password || !confirmPassword) {
      setError("Please fill in all password fields");
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
        username: username,
        password,
        name,
      });

      if (response.data.success) {
        setSuccess("OTP sent to your email! Please check your inbox.");
        setStep(3);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to send OTP. Please try again.",
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
        login(response.data.user, response.data.accessToken);
        localStorage.setItem("refreshToken", response.data.refreshToken);
        setSuccess("Account created successfully! Redirecting...");

        setTimeout(() => {
          navigate("/");
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP. Please try again.");
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
        username: username,
        password,
        name,
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
    window.location.href = `${API_URL}/auth/github`;
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      if (step === 1) {
        handleStep1();
      } else if (step === 2) {
        handleSignUp();
      } else {
        handleVerifyOTP();
      }
    }
  };

  return (
    <div
      className={`min-h-screen transition-all duration-700 relative overflow-hidden ${
        isDark
          ? "bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900"
          : "bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400"
      } flex items-center justify-center p-4 sm:p-6 md:p-8`}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute top-1/4 left-1/4 w-64 h-64 ${
            isDark ? "bg-purple-500" : "bg-white"
          } rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob`}
        ></div>
        <div
          className={`absolute top-1/3 right-1/4 w-64 h-64 ${
            isDark ? "bg-pink-500" : "bg-yellow-200"
          } rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000`}
        ></div>
        <div
          className={`absolute bottom-1/4 left-1/3 w-64 h-64 ${
            isDark ? "bg-blue-500" : "bg-pink-200"
          } rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000`}
        ></div>
      </div>

      <div className="relative z-10 w-full max-w-6xl flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
        {/* Left Side - Branding & Features */}
        <div
          className={`hidden lg:flex lg:flex-1 flex-col ${
            isDark ? "text-white" : "text-white"
          } space-y-8 animate-fade-in-left`}
        >
          <div className="space-y-4">
            <div
              className={`inline-flex items-center gap-3 ${
                isDark ? "bg-white/10" : "bg-white/20"
              } backdrop-blur-md px-6 py-3 rounded-full border ${
                isDark ? "border-white/20" : "border-white/30"
              } shadow-xl hover:scale-105 transition-transform duration-300`}
            >
              <MessageSquare className="w-8 h-8 animate-pulse" />
              <span className="text-2xl font-bold">ChatConnect</span>
            </div>
            <h1 className="text-5xl font-bold leading-tight animate-fade-in">
              Join Our
              <br />
              <span
                className={`${isDark ? "text-purple-300" : "text-blue-100"} inline-block hover:scale-105 transition-transform`}
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
              } backdrop-blur-xl rounded-2xl p-6 border hover:bg-white/20 hover:scale-105 hover:shadow-2xl transition-all duration-300 cursor-pointer group`}
            >
              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl shadow-lg group-hover:rotate-12 transition-transform duration-300">
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
              } backdrop-blur-xl rounded-2xl p-6 border hover:bg-white/20 hover:scale-105 hover:shadow-2xl transition-all duration-300 cursor-pointer group`}
            >
              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-br from-pink-500 to-pink-600 p-3 rounded-xl shadow-lg group-hover:rotate-12 transition-transform duration-300">
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
              } backdrop-blur-xl rounded-2xl p-6 border hover:bg-white/20 hover:scale-105 hover:shadow-2xl transition-all duration-300 cursor-pointer group`}
            >
              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg group-hover:rotate-12 transition-transform duration-300">
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
        <div className="w-full lg:flex-1 lg:max-w-md animate-fade-in-right">
          {/* Mobile Logo */}
          <div className="text-center mb-6 lg:hidden">
            <div
              className={`inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 ${
                isDark ? "bg-gray-800" : "bg-white"
              } rounded-2xl shadow-xl mb-3 hover:scale-110 transition-transform duration-300`}
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

          {/* Registration Card */}
          <div
            className={`${
              isDark
                ? "bg-gray-800/90 border-gray-700/50"
                : "bg-white/95 border-white/50"
            } backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 border transition-all duration-500 hover:shadow-3xl`}
          >
            {/* Progress Indicator */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  step === 1
                    ? "bg-gradient-to-r from-purple-600 to-pink-600"
                    : "bg-green-500"
                } text-white font-semibold shadow-lg transition-all duration-300`}
              >
                {step === 1 ? "1" : <CheckCircle className="w-5 h-5" />}
              </div>
              <div
                className={`h-1 w-12 rounded-full ${
                  step >= 2
                    ? "bg-gradient-to-r from-purple-600 to-pink-600"
                    : isDark
                      ? "bg-gray-700"
                      : "bg-gray-300"
                } transition-all duration-500`}
              ></div>
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  step === 2
                    ? "bg-gradient-to-r from-purple-600 to-pink-600"
                    : step > 2
                      ? "bg-green-500"
                      : isDark
                        ? "bg-gray-700"
                        : "bg-gray-300"
                } text-white font-semibold transition-all duration-300`}
              >
                {step > 2 ? <CheckCircle className="w-5 h-5" /> : "2"}
              </div>
              <div
                className={`h-1 w-12 rounded-full ${
                  step === 3
                    ? "bg-gradient-to-r from-purple-600 to-pink-600"
                    : isDark
                      ? "bg-gray-700"
                      : "bg-gray-300"
                } transition-all duration-500`}
              ></div>
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  step === 3
                    ? "bg-gradient-to-r from-purple-600 to-pink-600"
                    : isDark
                      ? "bg-gray-700"
                      : "bg-gray-300"
                } text-white font-semibold transition-all duration-300`}
              >
                3
              </div>
            </div>

            <h2
              className={`text-xl sm:text-2xl font-bold ${isDark ? "text-white" : "text-gray-800"} mb-2 text-center`}
            >
              {step === 1
                ? "Create Account"
                : step === 2
                  ? "Set Password"
                  : "Verify OTP"}
            </h2>

            {step === 2 && (
              <p
                className={`text-xs sm:text-sm ${isDark ? "text-gray-400" : "text-gray-600"} text-center mb-4`}
              >
                Choose a strong password for{" "}
                <span className="font-semibold">{email}</span>
              </p>
            )}

            {step === 3 && (
              <p
                className={`text-xs sm:text-sm ${isDark ? "text-gray-400" : "text-gray-600"} text-center mb-4`}
              >
                Enter the 6-digit code sent to{" "}
                <span className="font-semibold">{email}</span>
              </p>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg animate-shake">
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mb-4 p-3 bg-green-500/10 border border-green-500/50 rounded-lg animate-fade-in">
                <p className="text-green-500 text-sm flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  {success}
                </p>
              </div>
            )}

            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="space-y-3 sm:space-y-4">
                <div className="group">
                  <label
                    className={`block text-xs sm:text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"} mb-1 sm:mb-2 transition-colors`}
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <User
                      className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 ${isDark ? "text-gray-500" : "text-gray-400"} group-focus-within:text-purple-500 transition-colors`}
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
                      } border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-purple-500/50 outline-none transition-all hover:border-purple-400`}
                    />
                  </div>
                </div>

                <div className="group">
                  <label
                    className={`block text-xs sm:text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"} mb-1 sm:mb-2 transition-colors`}
                  >
                    Username
                  </label>
                  <div className="relative">
                    <AtSign
                      className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 ${isDark ? "text-gray-500" : "text-gray-400"} group-focus-within:text-purple-500 transition-colors`}
                    />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) =>
                        setUsername(e.target.value.toLowerCase())
                      }
                      onKeyPress={handleKeyPress}
                      placeholder="johndoe"
                      className={`w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base ${
                        isDark
                          ? "bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-purple-500"
                      } border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-purple-500/50 outline-none transition-all hover:border-purple-400`}
                    />
                  </div>
                  <p
                    className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                  >
                    3-20 characters, letters, numbers, and underscore only
                  </p>
                </div>

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
                      className={`w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base ${
                        isDark
                          ? "bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-purple-500"
                      } border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-purple-500/50 outline-none transition-all hover:border-purple-400`}
                    />
                  </div>
                </div>

                <button
                  onClick={handleStep1}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base hover:from-purple-700 hover:to-pink-700 hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  Continue
                </button>

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
                  } text-white py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 group`}
                >
                  <Github className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-12 transition-transform" />
                  Continue with GitHub
                </button>
              </div>
            )}

            {/* Step 2: Password */}
            {step === 2 && (
              <div className="space-y-3 sm:space-y-4">
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
                      className={`w-full pl-9 sm:pl-10 pr-10 sm:pr-12 py-2.5 sm:py-3 text-sm sm:text-base ${
                        isDark
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
                  <p
                    className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                  >
                    At least 6 characters
                  </p>
                </div>

                <div className="group">
                  <label
                    className={`block text-xs sm:text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"} mb-1 sm:mb-2 transition-colors`}
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock
                      className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 ${isDark ? "text-gray-500" : "text-gray-400"} group-focus-within:text-purple-500 transition-colors`}
                    />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="••••••••"
                      className={`w-full pl-9 sm:pl-10 pr-10 sm:pr-12 py-2.5 sm:py-3 text-sm sm:text-base ${
                        isDark
                          ? "bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-purple-500"
                      } border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-purple-500/50 outline-none transition-all hover:border-purple-400`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${isDark ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"} transition-colors`}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                      ) : (
                        <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleSignUp}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base hover:from-purple-700 hover:to-pink-700 hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
                      Sending OTP...
                    </span>
                  ) : (
                    "Continue"
                  )}
                </button>

                <button
                  onClick={() => setStep(1)}
                  className={`w-full flex items-center justify-center gap-2 text-center ${isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-800"} text-sm transition-colors py-2`}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              </div>
            )}

            {/* Step 3: OTP Verification */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="group">
                  <label
                    className={`block text-xs sm:text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"} mb-2 text-center`}
                  >
                    Enter 6-Digit Code
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) =>
                        setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      onKeyPress={handleKeyPress}
                      placeholder="000000"
                      maxLength={6}
                      className={`w-full px-4 py-3 text-center text-2xl tracking-widest font-semibold ${
                        isDark
                          ? "bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-purple-500"
                      } border rounded-xl focus:ring-2 focus:ring-purple-500/50 outline-none transition-all hover:border-purple-400`}
                    />
                  </div>
                </div>

                <button
                  onClick={handleVerifyOTP}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold text-base hover:from-purple-700 hover:to-pink-700 hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
                      Verifying...
                    </span>
                  ) : (
                    "Verify & Create Account"
                  )}
                </button>

                <button
                  onClick={handleResendOTP}
                  disabled={loading}
                  className={`w-full ${
                    isDark
                      ? "bg-gray-700 hover:bg-gray-600"
                      : "bg-gray-200 hover:bg-gray-300"
                  } ${isDark ? "text-white" : "text-gray-800"} py-3 rounded-xl font-semibold text-sm hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
                >
                  Resend OTP
                </button>

                <button
                  onClick={() => setStep(2)}
                  className={`w-full flex items-center justify-center gap-2 text-center ${isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-800"} text-sm transition-colors py-2`}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              </div>
            )}

            {/* Toggle to Login */}
            <div
              className={`mt-4 sm:mt-6 text-center text-xs sm:text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}
            >
              Already have an account?{" "}
              <Link
                to="/login"
                className={`${isDark ? "text-purple-400 hover:text-purple-300" : "text-purple-600 hover:text-purple-700"} font-semibold hover:underline transition-all`}
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-white text-xs mt-4 sm:mt-6 opacity-80 px-4 hover:opacity-100 transition-opacity">
            By continuing, you agree to our{" "}
            <a
              href="#"
              className="underline hover:text-purple-300 transition-colors"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="underline hover:text-purple-300 transition-colors"
            >
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
