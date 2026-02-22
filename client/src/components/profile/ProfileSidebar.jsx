import React from "react";
import {
  User, Mail, Lock, AlertCircle, AtSign, Camera, Sparkles, MessageSquare, LogOut,
} from "lucide-react";

const TABS = [
  { id: "profile", label: "Profile Info", icon: User },
  { id: "email", label: "Email Settings", icon: Mail },
  { id: "password", label: "Password", icon: Lock },
  { id: "danger", label: "Danger Zone", icon: AlertCircle },
];

export default function ProfileSidebar({ user, activeTab, setActiveTab, isDark, avatarPreview, onAvatarChange, onLogout }) {
  return (
    <aside className={`sidebar ${isDark ? "sidebar--dark" : "sidebar--light"}`}>
      {/* Avatar */}
      <div className="sidebar__avatar-wrapper">
        <div className="avatar-ring">
          <img
            src={avatarPreview || "/default-avatar.png"}
            alt="Avatar"
            className="avatar-img"
          />
          <label className="avatar-upload-btn" title="Change photo">
            <Camera size={16} />
            <input type="file" accept="image/*" onChange={onAvatarChange} hidden />
          </label>
        </div>

        <h2 className={`sidebar__name ${isDark ? "text-white" : "text-gray-900"}`}>
          {user?.name}
        </h2>
        <p className="sidebar__username">
          <AtSign size={13} />
          {user?.username}
        </p>

        {user?.bio && (
          <p className={`sidebar__bio ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            {user.bio}
          </p>
        )}
      </div>

      {/* Nav */}
      <nav className="sidebar__nav">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isDanger = tab.id === "danger";
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`sidebar__nav-btn
                ${isActive ? (isDanger ? "sidebar__nav-btn--danger-active" : "sidebar__nav-btn--active") : ""}
                ${!isActive && isDanger ? "sidebar__nav-btn--danger" : ""}
                ${!isActive && !isDanger ? (isDark ? "sidebar__nav-btn--idle-dark" : "sidebar__nav-btn--idle-light") : ""}
              `}
            >
              <span className="sidebar__nav-icon">
                <Icon size={16} />
              </span>
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Stats */}
      <div className={`sidebar__stats ${isDark ? "sidebar__stats--dark" : "sidebar__stats--light"}`}>
        <div className="sidebar__stats-header">
          <Sparkles size={14} />
          <span>Account Info</span>
        </div>
        <div className="sidebar__stats-rows">
          <div className="sidebar__stats-row">
            <span className="stats-label">Joined</span>
            <span className="stats-value">{new Date(user?.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
          </div>
          <div className="sidebar__stats-row">
            <span className="stats-label">Status</span>
            <span className={`stats-badge ${user?.isOnline ? "stats-badge--online" : "stats-badge--offline"}`}>
              {user?.isOnline ? "Online" : "Offline"}
            </span>
          </div>
        </div>
      </div>

      {/* Logout */}
      <button onClick={onLogout} className={`sidebar__logout ${isDark ? "sidebar__logout--dark" : "sidebar__logout--light"}`}>
        <LogOut size={15} />
        Sign Out
      </button>
    </aside>
  );
}