import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import ThemeToggle from "../common/ThemeToggle";

import ProfileSidebar from "./ProfileSidebar";
import ProfileTab from "./ProfileTab";
import EmailTab from "./EmailTab";
import PasswordTab from "./PasswordTab";
import DangerZoneTab from "./DangerZoneTab";
import DeleteModal from "./DeleteModal";
import Toast from "./Toast";
import { useProfileActions } from "./useProfileActions";
import "./ProfilePage.css";

export default function ProfilePage() {
  const { isDark } = useTheme();
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("profile");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // Profile form state
  const [name, setName] = useState(user?.name || "");
  const [username, setUsername] = useState(user?.username || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || "");
  const [avatarFile, setAvatarFile] = useState(null);
  const [newEmail, setNewEmail] = useState(user?.email || "");

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    loading, error, success, setError, setSuccess,
    updateProfile, updateEmail, updatePassword, deleteAccount,
  } = useProfileActions({ user, updateUser, logout, navigate });

  useEffect(() => { if (!user) navigate("/login"); }, [user, navigate]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError("Image must be under 5MB"); return; }
    const reader = new FileReader();
    reader.onloadend = () => { setAvatarPreview(reader.result); setAvatarFile(reader.result); };
    reader.readAsDataURL(file);
  };

  return (
    <div className={`profile-page ${isDark ? "profile-page--dark" : "profile-page--light"}`}>
      {/* Ambient blobs */}
      <div className="blobs" aria-hidden>
        <div className={`blob blob-1 ${isDark ? "blob--dark-a" : "blob--light-a"}`} />
        <div className={`blob blob-2 ${isDark ? "blob--dark-b" : "blob--light-b"}`} />
        <div className={`blob blob-3 ${isDark ? "blob--dark-c" : "blob--light-c"}`} />
      </div>

      {/* Theme toggle */}
      <div className="theme-toggle-anchor">
        <ThemeToggle />
      </div>

      {/* Toast */}
      {error && <Toast type="error" message={error} onDismiss={() => setError("")} />}
      {success && <Toast type="success" message={success} onDismiss={() => setSuccess("")} />}

      <div className="profile-page__inner">
        {/* Page heading */}
        <header className="profile-page__header">
          <div className={`header-icon ${isDark ? "header-icon--dark" : "header-icon--light"}`}>💬</div>
          <div>
            <h1 className="profile-page__title">My Profile</h1>
            <p className="profile-page__subtitle">Manage your account settings</p>
          </div>
        </header>

        <div className="profile-page__layout">
          {/* Sidebar */}
          <ProfileSidebar
            user={user}
            isDark={isDark}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            avatarPreview={avatarPreview}
            onAvatarChange={handleAvatarChange}
            onLogout={() => { logout(); navigate("/login"); }}
          />

          {/* Main panel */}
          <main className={`main-panel ${isDark ? "main-panel--dark" : "main-panel--light"}`}>
            {activeTab === "profile" && (
              <ProfileTab
                isDark={isDark}
                name={name} setName={setName}
                username={username} setUsername={setUsername}
                bio={bio} setBio={setBio}
                loading={loading}
                onSave={() => updateProfile({ name, username, bio, avatarFile })}
              />
            )}
            {activeTab === "email" && (
              <EmailTab
                isDark={isDark}
                user={user}
                newEmail={newEmail} setNewEmail={setNewEmail}
                loading={loading}
                onSave={() => updateEmail(newEmail)}
              />
            )}
            {activeTab === "password" && (
              <PasswordTab
                isDark={isDark}
                currentPassword={currentPassword} setCurrentPassword={setCurrentPassword}
                newPassword={newPassword} setNewPassword={setNewPassword}
                confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword}
                showCurrentPassword={showCurrentPassword} setShowCurrentPassword={setShowCurrentPassword}
                showNewPassword={showNewPassword} setShowNewPassword={setShowNewPassword}
                showConfirmPassword={showConfirmPassword} setShowConfirmPassword={setShowConfirmPassword}
                loading={loading}
                onSave={() => updatePassword({ currentPassword, newPassword, confirmPassword })}
              />
            )}
            {activeTab === "danger" && (
              <DangerZoneTab
                isDark={isDark}
                onDeleteClick={() => setShowDeleteModal(true)}
              />
            )}
          </main>
        </div>
      </div>

      {/* Delete modal */}
      {showDeleteModal && (
        <DeleteModal
          isDark={isDark}
          deleteConfirmText={deleteConfirmText}
          setDeleteConfirmText={setDeleteConfirmText}
          loading={loading}
          onConfirm={() => deleteAccount(deleteConfirmText)}
          onCancel={() => { setShowDeleteModal(false); setDeleteConfirmText(""); }}
        />
      )}
    </div>
  );
}