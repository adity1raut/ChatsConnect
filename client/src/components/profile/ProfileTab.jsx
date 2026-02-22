import React from "react";
import { User, AtSign, Save } from "lucide-react";

export default function ProfileTab({ isDark, name, setName, username, setUsername, bio, setBio, loading, onSave }) {
  return (
    <div className="tab-panel">
      <div className="tab-panel__header">
        <h3 className={`tab-panel__title ${isDark ? "text-white" : "text-gray-900"}`}>Profile Information</h3>
        <p className={`tab-panel__subtitle ${isDark ? "text-gray-400" : "text-gray-500"}`}>Update your name, username, and bio</p>
      </div>

      <div className="form-stack">
        <div className="form-field">
          <label className={`form-label ${isDark ? "text-gray-300" : "text-gray-700"}`}>Full Name</label>
          <div className="input-wrapper">
            <User className="input-icon" size={16} />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className={`form-input ${isDark ? "form-input--dark" : "form-input--light"}`}
            />
          </div>
        </div>

        <div className="form-field">
          <label className={`form-label ${isDark ? "text-gray-300" : "text-gray-700"}`}>Username</label>
          <div className="input-wrapper">
            <AtSign className="input-icon" size={16} />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              placeholder="yourhandle"
              className={`form-input ${isDark ? "form-input--dark" : "form-input--light"}`}
            />
          </div>
          <p className={`form-hint ${isDark ? "text-gray-500" : "text-gray-400"}`}>3–20 characters: letters, numbers, underscore</p>
        </div>

        <div className="form-field">
          <label className={`form-label ${isDark ? "text-gray-300" : "text-gray-700"}`}>Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            maxLength={200}
            placeholder="Tell us a little about yourself…"
            className={`form-textarea ${isDark ? "form-input--dark" : "form-input--light"}`}
          />
          <p className={`form-hint form-hint--right ${isDark ? "text-gray-500" : "text-gray-400"}`}>{bio.length}/200</p>
        </div>

        <button onClick={onSave} disabled={loading} className="btn-primary">
          <Save size={16} />
          {loading ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}