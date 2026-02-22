import React from "react";
import { Lock, Eye, EyeOff, Save } from "lucide-react";

function PasswordField({ label, value, onChange, show, onToggle, isDark, placeholder }) {
  return (
    <div className="form-field">
      <label className={`form-label ${isDark ? "text-gray-300" : "text-gray-700"}`}>{label}</label>
      <div className="input-wrapper">
        <Lock className="input-icon" size={16} />
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder || "••••••••"}
          className={`form-input form-input--padded-right ${isDark ? "form-input--dark" : "form-input--light"}`}
        />
        <button type="button" onClick={onToggle} className="input-eye-btn">
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

export default function PasswordTab({
  isDark,
  currentPassword, setCurrentPassword,
  newPassword, setNewPassword,
  confirmPassword, setConfirmPassword,
  showCurrentPassword, setShowCurrentPassword,
  showNewPassword, setShowNewPassword,
  showConfirmPassword, setShowConfirmPassword,
  loading, onSave,
}) {
  const strength = newPassword.length === 0 ? 0
    : newPassword.length < 6 ? 1
    : newPassword.length < 10 ? 2
    : newPassword.match(/[A-Z]/) && newPassword.match(/[0-9]/) && newPassword.match(/[^A-Za-z0-9]/) ? 4 : 3;

  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["", "#ef4444", "#f97316", "#3b82f6", "#22c55e"];

  return (
    <div className="tab-panel">
      <div className="tab-panel__header">
        <h3 className={`tab-panel__title ${isDark ? "text-white" : "text-gray-900"}`}>Change Password</h3>
        <p className={`tab-panel__subtitle ${isDark ? "text-gray-400" : "text-gray-500"}`}>Choose a strong, unique password</p>
      </div>

      <div className="form-stack">
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
          <div className="strength-meter">
            <div className="strength-meter__bars">
              {[1,2,3,4].map(i => (
                <div
                  key={i}
                  className="strength-meter__bar"
                  style={{ backgroundColor: i <= strength ? strengthColors[strength] : (isDark ? "#374151" : "#e5e7eb") }}
                />
              ))}
            </div>
            <span className="strength-meter__label" style={{ color: strengthColors[strength] }}>
              {strengthLabels[strength]}
            </span>
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
          <p className="form-error-inline">Passwords don't match</p>
        )}

        <button onClick={onSave} disabled={loading} className="btn-primary">
          <Save size={16} />
          {loading ? "Updating…" : "Update Password"}
        </button>
      </div>
    </div>
  );
}