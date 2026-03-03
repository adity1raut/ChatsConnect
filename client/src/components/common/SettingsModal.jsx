import React, { useState } from "react";
import {
  X, Bot, Bell, Shield, HelpCircle, ChevronDown, Eye, EyeOff,
  Lock, Mail, AtSign, ShieldCheck, Check, AlertCircle,
} from "lucide-react";
import axios from "axios";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function Toggle({ checked, onChange }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${checked ? "bg-violet-500" : "bg-gray-300 dark:bg-gray-600"}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${checked ? "translate-x-5" : "translate-x-0"}`}
      />
    </button>
  );
}

function SectionRow({ label, description, right }) {
  const { isDark } = useTheme();
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <div>
        <p className={`text-sm font-medium ${isDark ? "text-gray-200" : "text-gray-700"}`}>{label}</p>
        {description && (
          <p className={`text-xs mt-0.5 ${isDark ? "text-gray-500" : "text-gray-400"}`}>{description}</p>
        )}
      </div>
      {right}
    </div>
  );
}

function InlineMsg({ msg }) {
  if (!msg) return null;
  const isError = msg.type === "error";
  return (
    <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${isError ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"}`}>
      {isError ? <AlertCircle size={13} /> : <Check size={13} />}
      {msg.text}
    </div>
  );
}

function ExpandSection({ label, icon: Icon, color, isOpen, onToggle, isDark, children }) {
  return (
    <div className={`rounded-xl border transition-colors duration-200 ${isDark ? "border-white/8 bg-white/[0.02]" : "border-gray-100 bg-gray-50/60"}`}>
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-4 py-3 text-sm font-semibold ${isDark ? "text-gray-200" : "text-gray-700"}`}
      >
        <span className="flex items-center gap-2.5">
          <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${color}`}>
            <Icon size={13} className="text-white" />
          </span>
          {label}
        </span>
        <ChevronDown
          size={15}
          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""} ${isDark ? "text-gray-500" : "text-gray-400"}`}
        />
      </button>
      {isOpen && (
        <div className={`px-4 pb-4 border-t ${isDark ? "border-white/5" : "border-gray-100"}`}>
          <div className="pt-4 flex flex-col gap-3">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SettingsModal({
  showSettingsModal,
  setShowSettingsModal,
  aiEnabled,
  setAiEnabled,
  notifications,
  setNotifications,
}) {
  const { isDark } = useTheme();
  const { user, updateUser } = useAuth();

  const [twoFaEnabled, setTwoFaEnabled] = useState(false);
  const [activeSection, setActiveSection] = useState(null);

  // Password form state
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [pwdMsg, setPwdMsg] = useState(null);
  const [pwdLoading, setPwdLoading] = useState(false);

  // Email form state
  const [newEmail, setNewEmail] = useState("");
  const [emailMsg, setEmailMsg] = useState(null);
  const [emailLoading, setEmailLoading] = useState(false);

  // Username form state
  const [newUsername, setNewUsername] = useState("");
  const [usernameMsg, setUsernameMsg] = useState(null);
  const [usernameLoading, setUsernameLoading] = useState(false);

  const token = () => localStorage.getItem("accessToken");
  const authHeader = () => ({ Authorization: `Bearer ${token()}` });

  const toggleSection = (id) => {
    setActiveSection((prev) => (prev === id ? null : id));
    setPwdMsg(null);
    setEmailMsg(null);
    setUsernameMsg(null);
  };

  const handleChangePassword = async () => {
    if (!currentPwd || !newPwd || !confirmPwd) return setPwdMsg({ type: "error", text: "All fields are required" });
    if (newPwd !== confirmPwd) return setPwdMsg({ type: "error", text: "Passwords don't match" });
    if (newPwd.length < 6) return setPwdMsg({ type: "error", text: "Password must be at least 6 characters" });
    setPwdLoading(true);
    setPwdMsg(null);
    try {
      await axios.put(`${API_URL}/auth/change-password`, { currentPassword: currentPwd, newPassword: newPwd }, { headers: authHeader() });
      setPwdMsg({ type: "success", text: "Password changed successfully!" });
      setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
    } catch (err) {
      setPwdMsg({ type: "error", text: err.response?.data?.message || "Failed to change password" });
    } finally {
      setPwdLoading(false);
    }
  };

  const handleChangeEmail = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) return setEmailMsg({ type: "error", text: "Enter a valid email address" });
    setEmailLoading(true);
    setEmailMsg(null);
    try {
      const { data } = await axios.put(`${API_URL}/profile/update-email`, { email: newEmail }, { headers: authHeader() });
      updateUser(data.user);
      setEmailMsg({ type: "success", text: "Email updated successfully!" });
      setNewEmail("");
    } catch (err) {
      setEmailMsg({ type: "error", text: err.response?.data?.message || "Failed to update email" });
    } finally {
      setEmailLoading(false);
    }
  };

  const handleChangeUsername = async () => {
    if (!newUsername) return setUsernameMsg({ type: "error", text: "Username is required" });
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(newUsername))
      return setUsernameMsg({ type: "error", text: "3–20 chars: letters, numbers, underscore" });
    setUsernameLoading(true);
    setUsernameMsg(null);
    try {
      const { data } = await axios.put(`${API_URL}/profile/update`, { username: newUsername }, { headers: authHeader() });
      updateUser(data.user);
      setUsernameMsg({ type: "success", text: "Username updated successfully!" });
      setNewUsername("");
    } catch (err) {
      setUsernameMsg({ type: "error", text: err.response?.data?.message || "Failed to update username" });
    } finally {
      setUsernameLoading(false);
    }
  };

  const inputClass = `w-full px-3 py-2.5 text-sm rounded-xl border outline-none transition-all duration-200 ${isDark
    ? "bg-white/[0.04] border-white/8 text-white placeholder-gray-600 focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/15"
    : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/10"
  }`;

  const btnPrimary = `w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed`;

  if (!showSettingsModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`${isDark ? "bg-gray-900 border border-white/8" : "bg-white border border-gray-100"} rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl`}>

        {/* Header */}
        <div className={`p-6 border-b flex items-center justify-between sticky top-0 z-10 ${isDark ? "border-gray-800 bg-gray-900" : "border-gray-100 bg-white"}`}>
          <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-800"}`}>Settings</h2>
          <button
            onClick={() => setShowSettingsModal(false)}
            className={`p-2 rounded-lg transition-colors ${isDark ? "hover:bg-white/8 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-7">

          {/* ── AI Enhancement ── */}
          <div className={`pb-7 border-b ${isDark ? "border-white/5" : "border-gray-100"}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? "bg-purple-500/15" : "bg-purple-50"}`}>
                <Bot size={20} className="text-purple-500" />
              </div>
              <div>
                <h3 className={`font-semibold ${isDark ? "text-white" : "text-gray-800"}`}>AI Enhancement</h3>
                <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>Intelligent chat assistance</p>
              </div>
            </div>
            <div className="space-y-1">
              <SectionRow label="Enable AI Suggestions" right={<Toggle checked={aiEnabled} onChange={setAiEnabled} />} />
              <SectionRow label="Auto-translate Messages" right={<Toggle checked={false} onChange={() => {}} />} />
              <SectionRow label="Smart Reply" right={<Toggle checked={true} onChange={() => {}} />} />
            </div>
          </div>

          {/* ── Notifications ── */}
          <div className={`pb-7 border-b ${isDark ? "border-white/5" : "border-gray-100"}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? "bg-blue-500/15" : "bg-blue-50"}`}>
                <Bell size={20} className="text-blue-500" />
              </div>
              <div>
                <h3 className={`font-semibold ${isDark ? "text-white" : "text-gray-800"}`}>Notifications</h3>
                <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>Manage your alerts</p>
              </div>
            </div>
            <div className="space-y-1">
              <SectionRow label="Push Notifications" right={<Toggle checked={notifications} onChange={setNotifications} />} />
              <SectionRow label="Email Notifications" right={<Toggle checked={false} onChange={() => {}} />} />
              <SectionRow label="Sound Alerts" right={<Toggle checked={true} onChange={() => {}} />} />
            </div>
          </div>

          {/* ── Privacy & Security ── */}
          <div className={`pb-7 border-b ${isDark ? "border-white/5" : "border-gray-100"}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? "bg-emerald-500/15" : "bg-emerald-50"}`}>
                <Shield size={20} className="text-emerald-500" />
              </div>
              <div>
                <h3 className={`font-semibold ${isDark ? "text-white" : "text-gray-800"}`}>Privacy & Security</h3>
                <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>Control your data and account security</p>
              </div>
            </div>

            <div className="space-y-3">
              {/* Two-Step Verification */}
              <div className={`flex items-center justify-between px-4 py-3 rounded-xl border ${isDark ? "border-white/8 bg-white/[0.02]" : "border-gray-100 bg-gray-50/60"}`}>
                <div className="flex items-center gap-2.5">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${twoFaEnabled ? "bg-emerald-500" : isDark ? "bg-white/8" : "bg-gray-200"}`}>
                    <ShieldCheck size={13} className={twoFaEnabled ? "text-white" : isDark ? "text-gray-400" : "text-gray-500"} />
                  </span>
                  <div>
                    <p className={`text-sm font-semibold ${isDark ? "text-gray-200" : "text-gray-700"}`}>Two-Step Verification</p>
                    <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>Add an extra layer of security</p>
                  </div>
                </div>
                <Toggle checked={twoFaEnabled} onChange={setTwoFaEnabled} />
              </div>

              {/* Change Password */}
              <ExpandSection
                label="Change Password"
                icon={Lock}
                color="bg-violet-500"
                isOpen={activeSection === "password"}
                onToggle={() => toggleSection("password")}
                isDark={isDark}
              >
                <div className="relative">
                  <input
                    type={showCurrentPwd ? "text" : "password"}
                    value={currentPwd}
                    onChange={(e) => setCurrentPwd(e.target.value)}
                    placeholder="Current password"
                    className={inputClass}
                  />
                  <button type="button" onClick={() => setShowCurrentPwd((v) => !v)} className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                    {showCurrentPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showNewPwd ? "text" : "password"}
                    value={newPwd}
                    onChange={(e) => setNewPwd(e.target.value)}
                    placeholder="New password"
                    className={inputClass}
                  />
                  <button type="button" onClick={() => setShowNewPwd((v) => !v)} className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                    {showNewPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <input
                  type="password"
                  value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)}
                  placeholder="Confirm new password"
                  className={inputClass}
                />
                <InlineMsg msg={pwdMsg} />
                <button
                  onClick={handleChangePassword}
                  disabled={pwdLoading}
                  className={btnPrimary}
                  style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}
                >
                  {pwdLoading ? "Updating…" : "Update Password"}
                </button>
              </ExpandSection>

              {/* Change Email */}
              <ExpandSection
                label="Change Email"
                icon={Mail}
                color="bg-blue-500"
                isOpen={activeSection === "email"}
                onToggle={() => toggleSection("email")}
                isDark={isDark}
              >
                <div className={`text-xs px-3 py-2 rounded-lg ${isDark ? "bg-white/[0.04] text-gray-400" : "bg-gray-100 text-gray-500"}`}>
                  Current: <span className="font-medium">{user?.email}</span>
                </div>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="New email address"
                  className={inputClass}
                />
                <InlineMsg msg={emailMsg} />
                <button
                  onClick={handleChangeEmail}
                  disabled={emailLoading}
                  className={btnPrimary}
                  style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)" }}
                >
                  {emailLoading ? "Updating…" : "Update Email"}
                </button>
              </ExpandSection>

              {/* Change Username */}
              <ExpandSection
                label="Change Username"
                icon={AtSign}
                color="bg-pink-500"
                isOpen={activeSection === "username"}
                onToggle={() => toggleSection("username")}
                isDark={isDark}
              >
                <div className={`text-xs px-3 py-2 rounded-lg ${isDark ? "bg-white/[0.04] text-gray-400" : "bg-gray-100 text-gray-500"}`}>
                  Current: <span className="font-medium">@{user?.username}</span>
                </div>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value.toLowerCase())}
                  placeholder="New username (3–20 chars)"
                  className={inputClass}
                />
                <InlineMsg msg={usernameMsg} />
                <button
                  onClick={handleChangeUsername}
                  disabled={usernameLoading}
                  className={btnPrimary}
                  style={{ background: "linear-gradient(135deg, #ec4899, #f43f5e)" }}
                >
                  {usernameLoading ? "Updating…" : "Update Username"}
                </button>
              </ExpandSection>
            </div>
          </div>

          {/* ── Help & Support ── */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? "bg-yellow-500/15" : "bg-yellow-50"}`}>
                <HelpCircle size={20} className="text-yellow-500" />
              </div>
              <div>
                <h3 className={`font-semibold ${isDark ? "text-white" : "text-gray-800"}`}>Help & Support</h3>
                <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>Get assistance</p>
              </div>
            </div>
            <div className="space-y-1">
              {["Help Center", "Contact Support", "Terms of Service"].map((item) => (
                <button
                  key={item}
                  className={`w-full text-left text-sm px-3 py-2.5 rounded-xl transition-colors ${isDark ? "text-gray-400 hover:text-violet-400 hover:bg-white/5" : "text-gray-600 hover:text-violet-600 hover:bg-violet-50"}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
