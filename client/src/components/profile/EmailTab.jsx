import React from "react";
import { Mail, Save } from "lucide-react";

export default function EmailTab({ isDark, user, newEmail, setNewEmail, loading, onSave }) {
  return (
    <div className="tab-panel">
      <div className="tab-panel__header">
        <h3 className={`tab-panel__title ${isDark ? "text-white" : "text-gray-900"}`}>Email Settings</h3>
        <p className={`tab-panel__subtitle ${isDark ? "text-gray-400" : "text-gray-500"}`}>Update your account email address</p>
      </div>

      <div className="form-stack">
        <div className="form-field">
          <label className={`form-label ${isDark ? "text-gray-300" : "text-gray-700"}`}>Current Email</label>
          <div className={`current-value ${isDark ? "current-value--dark" : "current-value--light"}`}>
            <Mail size={15} className="current-value__icon" />
            <span>{user?.email}</span>
          </div>
        </div>

        <div className="form-field">
          <label className={`form-label ${isDark ? "text-gray-300" : "text-gray-700"}`}>New Email Address</label>
          <div className="input-wrapper">
            <Mail className="input-icon" size={16} />
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="new@example.com"
              className={`form-input ${isDark ? "form-input--dark" : "form-input--light"}`}
            />
          </div>
        </div>

        <button onClick={onSave} disabled={loading} className="btn-primary">
          <Save size={16} />
          {loading ? "Updating…" : "Update Email"}
        </button>
      </div>
    </div>
  );
}