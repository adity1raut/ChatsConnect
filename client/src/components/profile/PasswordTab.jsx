import React from "react";
import { Lock, Eye, EyeOff, Save, ShieldCheck, KeyRound } from "lucide-react";

function PasswordField({
  label,
  value,
  onChange,
  show,
  onToggle,
  isDark,
  placeholder,
}) {
  return (
    <div className="flex flex-col gap-2">
      <label
        className={`text-xs font-bold uppercase tracking-widest ${isDark ? "text-gray-400" : "text-gray-500"}`}
      >
        {label}
      </label>
      <div className="relative group">
        <Lock
          className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors duration-200 ${
            isDark
              ? "text-gray-600 group-focus-within:text-emerald-400"
              : "text-gray-400 group-focus-within:text-emerald-500"
          }`}
        />
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder || "••••••••"}
          className={`w-full pl-11 pr-12 py-3.5 text-sm rounded-xl border outline-none transition-all duration-200 ${
            isDark
              ? "bg-white/[0.04] border-white/8 text-white placeholder-gray-600 focus:border-emerald-500/60 focus:bg-emerald-500/[0.06] focus:ring-4 focus:ring-emerald-500/10"
              : "bg-gray-50/80 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/8"
          }`}
        />
        <button
          type="button"
          onClick={onToggle}
          className={`absolute right-4 top-1/2 -translate-y-1/2 transition-all duration-200 hover:scale-110 ${
            isDark
              ? "text-gray-600 hover:text-gray-300"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

const strengthConfig = [
  null,
  {
    label: "Weak",
    color: "#ef4444",
    bg: "rgba(239,68,68,0.12)",
    text: "text-red-500",
    tip: "Use a longer password",
  },
  {
    label: "Fair",
    color: "#f97316",
    bg: "rgba(249,115,22,0.12)",
    text: "text-orange-500",
    tip: "Add uppercase letters",
  },
  {
    label: "Good",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.12)",
    text: "text-blue-500",
    tip: "Add symbols for stronger",
  },
  {
    label: "Strong",
    color: "#22c55e",
    bg: "rgba(34,197,94,0.12)",
    text: "text-emerald-500",
    tip: "Great password!",
  },
];

export default function PasswordTab({
  isDark,
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  showCurrentPassword,
  setShowCurrentPassword,
  showNewPassword,
  setShowNewPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  loading,
  onSave,
}) {
  const strength =
    newPassword.length === 0
      ? 0
      : newPassword.length < 6
        ? 1
        : newPassword.length < 10
          ? 2
          : newPassword.match(/[A-Z]/) &&
              newPassword.match(/[0-9]/) &&
              newPassword.match(/[^A-Za-z0-9]/)
            ? 4
            : 3;

  const sc = strengthConfig[strength];

  return (
    <div className="tab-enter">
      {/* Section header */}
      <div className="flex items-start gap-4 mb-8 pb-6 border-b border-dashed border-gray-500/15">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-emerald-500 to-teal-500 shadow-md shadow-emerald-500/25">
          <KeyRound size={18} className="text-white" strokeWidth={2} />
        </div>
        <div>
          <h3
            className={`text-xl sm:text-2xl font-bold tracking-tight leading-tight ${isDark ? "text-white" : "text-gray-900"}`}
          >
            Change Password
          </h3>
          <p
            className={`text-sm mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}
          >
            Choose a strong, unique password to keep your account safe
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <PasswordField
          label="Current Password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          show={showCurrentPassword}
          onToggle={() => setShowCurrentPassword(!showCurrentPassword)}
          isDark={isDark}
        />

        <PasswordField
          label="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          show={showNewPassword}
          onToggle={() => setShowNewPassword(!showNewPassword)}
          isDark={isDark}
        />

        {/* Strength meter */}
        {newPassword.length > 0 && (
          <div
            className={`p-4 rounded-xl border transition-all duration-300 ${isDark ? "bg-white/[0.03] border-white/5" : "border-gray-100 bg-gray-50/80"}`}
            style={{ borderColor: `${sc?.color}22` }}
          >
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={13} style={{ color: sc?.color }} />
                <span className={`text-xs font-bold tracking-wide ${sc?.text}`}>
                  {sc?.label}
                </span>
              </div>
              <span
                className={`text-[11px] ${isDark ? "text-gray-500" : "text-gray-400"}`}
              >
                {sc?.tip}
              </span>
            </div>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex-1 h-1.5 rounded-full transition-all duration-400"
                  style={{
                    backgroundColor:
                      i <= strength
                        ? sc?.color
                        : isDark
                          ? "#1f2937"
                          : "#e5e7eb",
                    opacity: i <= strength ? 1 : 0.5,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        <PasswordField
          label="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          show={showConfirmPassword}
          onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
          isDark={isDark}
        />

        {confirmPassword && newPassword !== confirmPassword && (
          <div className="flex items-center gap-2 text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2.5 rounded-lg -mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
            Passwords don't match
          </div>
        )}

        {confirmPassword &&
          newPassword === confirmPassword &&
          confirmPassword.length > 0 && (
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2.5 rounded-lg -mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
              Passwords match
            </div>
          )}

        <button
          onClick={onSave}
          disabled={loading}
          className="relative flex items-center justify-center gap-2.5 w-full py-4 mt-1 rounded-xl font-bold text-white overflow-hidden transition-all duration-200 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg hover:shadow-emerald-500/25 group"
          style={{ background: "linear-gradient(135deg, #10b981, #14b8a6)" }}
        >
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          <Save size={16} strokeWidth={2.5} />
          {loading ? "Updating…" : "Update Password"}
        </button>
      </div>
    </div>
  );
}
