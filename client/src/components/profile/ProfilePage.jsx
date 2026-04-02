import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import ProfileSidebar from "./ProfileSidebar";
import ProfileTab from "./ProfileTab";
import SettingsTab from "./SettingsTab";
import DangerZoneTab from "./DangerZoneTab";
import DeleteModal from "./DeleteModal";
import Toast from "./Toast";
import { useProfileActions } from "./useProfileActions";

export default function ProfilePage() {
  const { isDark } = useTheme();
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("profile");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || "");
  const [avatarFile, setAvatarFile] = useState(null);

  const {
    loading,
    error,
    success,
    setError,
    setSuccess,
    updateProfile,
    deleteAccount,
  } = useProfileActions({ user, updateUser, logout, navigate });

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
      setAvatarFile(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      className={`min-h-[100dvh] relative overflow-hidden transition-all duration-700 flex flex-col p-4 sm:p-6 md:p-10 ${
        isDark ? "bg-[#0a0a14] text-gray-50" : "bg-[#f4f5ff] text-gray-900"
      }`}
    >
      {/* ── Background ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div
          className="absolute inset-0"
          style={{
            background: isDark
              ? "radial-gradient(ellipse at top left, rgba(139,92,246,0.25) 0%, transparent 50%), radial-gradient(ellipse at bottom right, rgba(236,72,153,0.2) 0%, transparent 50%)"
              : "radial-gradient(ellipse at top left, rgba(167,139,250,0.35) 0%, transparent 50%), radial-gradient(ellipse at bottom right, rgba(244,114,182,0.25) 0%, transparent 50%)",
          }}
        />
        <div
          className={`absolute top-[-120px] left-[-80px] w-[500px] h-[500px] rounded-full filter blur-[100px] opacity-30 ${isDark ? "bg-violet-600" : "bg-violet-400"}`}
          style={{ animation: "float 12s ease-in-out infinite" }}
        />
        <div
          className={`absolute top-[45%] right-[-100px] w-[400px] h-[400px] rounded-full filter blur-[100px] opacity-25 ${isDark ? "bg-pink-600" : "bg-pink-300"}`}
          style={{
            animation: "float 15s ease-in-out infinite",
            animationDelay: "-5s",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(20px, -20px) scale(1.05); }
          66% { transform: translate(-15px, 15px) scale(0.95); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .tab-enter { animation: slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) both; }
      `}</style>

      {/* Toasts */}
      {error && (
        <Toast type="error" message={error} onDismiss={() => setError("")} />
      )}
      {success && (
        <Toast
          type="success"
          message={success}
          onDismiss={() => setSuccess("")}
        />
      )}

      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col gap-5 sm:gap-8">
        {/* ── Page heading ── */}
        <header
          className="flex items-center gap-4 sm:gap-5"
          style={{ animation: "slideUp 0.4s cubic-bezier(0.16,1,0.3,1) both" }}
        >
          <div
            className={`w-11 h-11 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-xl sm:text-2xl shadow-lg ${
              isDark
                ? "bg-white/5 backdrop-blur-md border border-white/10"
                : "bg-white/60 backdrop-blur-md border border-white/70"
            }`}
          >
            ✦
          </div>
          <div>
            <h1
              className={`text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-none ${isDark ? "text-white" : "text-gray-900"}`}
            >
              My{" "}
              <span className="bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Profile
              </span>
            </h1>
            <p
              className={`text-xs sm:text-sm font-medium mt-1.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}
            >
              Update your photo, name, and bio
            </p>
          </div>
        </header>

        <div className="flex flex-col md:grid md:grid-cols-[290px_1fr] gap-4 sm:gap-6 items-start">
          {/* Sidebar */}
          <ProfileSidebar
            user={user}
            isDark={isDark}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            avatarPreview={avatarPreview}
            onAvatarChange={handleAvatarChange}
            onLogout={() => {
              logout();
              navigate("/login");
            }}
          />

          {/* Main panel */}
          <main
            className={`w-full rounded-3xl backdrop-blur-2xl shadow-2xl overflow-hidden transition-colors duration-300 ${
              isDark
                ? "bg-gray-900/70 border border-white/5"
                : "bg-white/80 border border-white/80"
            }`}
          >
            <div className="h-1 w-full bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 opacity-80" />

            <div className="p-5 sm:p-8 md:p-10">
              {activeTab === "profile" && (
                <ProfileTab
                  key="profile"
                  isDark={isDark}
                  name={name}
                  setName={setName}
                  bio={bio}
                  setBio={setBio}
                  loading={loading}
                  onSave={() =>
                    updateProfile({
                      name,
                      username: user?.username,
                      bio,
                      avatarFile,
                    })
                  }
                />
              )}
              {activeTab === "settings" && (
                <SettingsTab key="settings" isDark={isDark} />
              )}
              {activeTab === "danger" && (
                <DangerZoneTab
                  key="danger"
                  isDark={isDark}
                  onDeleteClick={() => setShowDeleteModal(true)}
                />
              )}
            </div>
          </main>
        </div>
      </div>

      {showDeleteModal && (
        <DeleteModal
          isDark={isDark}
          deleteConfirmText={deleteConfirmText}
          setDeleteConfirmText={setDeleteConfirmText}
          loading={loading}
          onConfirm={() => deleteAccount(deleteConfirmText)}
          onCancel={() => {
            setShowDeleteModal(false);
            setDeleteConfirmText("");
          }}
        />
      )}
    </div>
  );
}
