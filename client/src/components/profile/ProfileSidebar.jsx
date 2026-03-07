import React from "react";
import {
  User, AlertCircle, AtSign, Camera, ShieldCheck, LogOut, Settings,
} from "lucide-react";

const TABS = [
  { id: "profile", label: "Profile Info", icon: User, color: "from-violet-500 to-purple-600" },
  { id: "settings", label: "Settings", icon: Settings, color: "from-slate-500 to-gray-600" },
  { id: "danger", label: "Danger Zone", icon: AlertCircle, color: "from-red-500 to-rose-600" },
];

export default function ProfileSidebar({ user, activeTab, setActiveTab, isDark, avatarPreview, onAvatarChange, onLogout }) {
  return (
    <>
      {/* ──────────────────────────────────────────────────
          MOBILE layout: compact card with avatar + tab row
          ─────────────────────────────────────────────── */}
      <div className={`md:hidden w-full rounded-3xl backdrop-blur-2xl shadow-xl overflow-hidden ${isDark ? "bg-gray-900/70 border border-white/5" : "bg-white/80 border border-white/80"
        }`}>
        <div className="h-1 w-full bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 opacity-80" />

        {/* Avatar row */}
        <div className="flex items-center gap-4 px-5 py-4">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="absolute inset-[-3px] rounded-full bg-gradient-to-r from-violet-500 via-pink-500 to-blue-500" style={{ animation: "spin 4s linear infinite" }} />
            <div className={`absolute inset-[-1px] rounded-full ${isDark ? "bg-gray-900" : "bg-white"}`} />
            <img
              src={avatarPreview || "/default-avatar.png"}
              alt="Avatar"
              className="w-14 h-14 rounded-full object-cover relative z-10 block"
            />
            <label className="absolute bottom-0 right-0 z-20 w-6 h-6 rounded-full bg-gradient-to-tr from-violet-600 to-pink-500 flex items-center justify-center text-white cursor-pointer shadow-md hover:scale-110 transition-transform" title="Change photo">
              <Camera size={11} strokeWidth={2.5} />
              <input type="file" accept="image/*" onChange={onAvatarChange} hidden />
            </label>
          </div>

          {/* Name + username */}
          <div className="flex-1 min-w-0">
            <p className={`font-bold text-base truncate leading-tight ${isDark ? "text-white" : "text-gray-900"}`}>{user?.name}</p>
            <p className={`text-xs flex items-center gap-1 mt-0.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              <AtSign size={11} strokeWidth={2.5} />
              {user?.username}
            </p>
            <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1.5 ${user?.isOnline ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/20" : isDark ? "bg-gray-700/60 text-gray-400 border border-gray-600/30" : "bg-gray-100 text-gray-500 border border-gray-200"
              }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${user?.isOnline ? "bg-emerald-500 animate-pulse" : "bg-gray-400"}`} />
              {user?.isOnline ? "Online" : "Offline"}
            </span>
          </div>

          {/* Logout on mobile */}
          <button
            onClick={onLogout}
            className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 flex-shrink-0 ${isDark ? "bg-white/[0.03] text-gray-400 hover:bg-red-500/12 hover:text-red-400 border border-white/5" : "bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-500 border border-gray-100"}`}
          >
            <LogOut size={15} />
          </button>
        </div>

        {/* Mobile tab scroller */}
        <div className="flex overflow-x-auto gap-1 px-3 pb-3 scrollbar-none">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isDanger = tab.id === "danger";
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex-shrink-0 transition-all duration-200 border ${isActive
                    ? isDanger
                      ? "bg-gradient-to-r from-red-500/20 to-rose-600/20 text-red-400 border-red-500/30"
                      : "bg-gradient-to-r from-violet-500/15 to-purple-600/10 text-violet-400 border-violet-500/25"
                    : isDanger
                      ? isDark ? "text-red-400/70 border-transparent hover:bg-red-500/10" : "text-red-500/70 border-transparent hover:bg-red-50"
                      : isDark ? "text-gray-400 border-transparent hover:bg-white/5 hover:text-gray-200" : "text-gray-500 border-transparent hover:bg-gray-50 hover:text-gray-800"
                  }`}
              >
                <span
                  className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${isActive
                      ? isDanger ? "bg-red-500/20 text-red-400" : `bg-gradient-to-br ${tab.color} text-white shadow-sm`
                      : isDark ? "bg-white/5" : "bg-gray-100"
                    }`}
                >
                  <Icon size={11} strokeWidth={isActive ? 2.5 : 2} />
                </span>
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ──────────────────────────────────────────────────
          DESKTOP layout: vertical sidebar
          ─────────────────────────────────────────────── */}
      <aside className={`hidden md:flex flex-col rounded-3xl backdrop-blur-2xl shadow-2xl overflow-hidden transition-colors duration-300 ${isDark ? "bg-gray-900/70 border border-white/5" : "bg-white/80 border border-white/80"
        }`}>
        <div className="h-1 w-full bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 opacity-80" />

        <div className="p-6 flex flex-col gap-0">
          {/* Avatar Section */}
          <div className={`flex flex-col items-center py-7 px-4 mb-2 rounded-2xl ${isDark ? "bg-white/[0.03]" : "bg-black/[0.02]"}`}>
            <div className="relative inline-block mb-4">
              <div className="absolute inset-[-5px] rounded-full bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 opacity-50 blur-md" />
              <div className="absolute inset-[-3px] rounded-full bg-gradient-to-r from-violet-500 via-pink-500 to-blue-500" style={{ animation: "spin 4s linear infinite" }} />
              <div className={`absolute inset-[-1px] rounded-full ${isDark ? "bg-gray-900" : "bg-white"}`} />
              <img src={avatarPreview || "/default-avatar.png"} alt="Avatar" className="block w-24 h-24 rounded-full object-cover relative z-10" />
              <label className="absolute bottom-0.5 right-0.5 z-20 w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-pink-500 flex items-center justify-center text-white cursor-pointer shadow-lg hover:scale-110 transition-all duration-200" title="Change photo">
                <Camera size={13} strokeWidth={2.5} />
                <input type="file" accept="image/*" onChange={onAvatarChange} hidden />
              </label>
            </div>

            <h2 className={`font-bold text-lg tracking-tight mt-1 ${isDark ? "text-white" : "text-gray-900"}`}>{user?.name}</h2>
            <p className={`text-xs flex items-center gap-1 mt-1 font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              <AtSign size={11} strokeWidth={2.5} />{user?.username}
            </p>
            {user?.bio && (
              <p className={`text-xs leading-relaxed mt-3 text-center break-words px-2 italic ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                "{user.bio}"
              </p>
            )}
            <div className="flex items-center gap-1.5 mt-4">
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${user?.isOnline ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/20" : isDark ? "bg-gray-700/60 text-gray-400 border border-gray-600/30" : "bg-gray-100 text-gray-500 border border-gray-200"
                }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${user?.isOnline ? "bg-emerald-500 animate-pulse" : "bg-gray-400"}`} />
                {user?.isOnline ? "Online" : "Offline"}
              </span>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex flex-col gap-1.5 py-4">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const isDanger = tab.id === "danger";
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 w-full text-left group overflow-hidden ${isActive
                      ? isDanger ? "bg-gradient-to-r from-red-500/20 to-rose-600/20 text-red-400 border border-red-500/30 shadow-sm" : "bg-gradient-to-r from-violet-500/15 to-purple-600/10 text-violet-400 border border-violet-500/25 shadow-sm"
                      : isDanger ? isDark ? "text-red-400/70 hover:bg-red-500/10 hover:text-red-400 border border-transparent" : "text-red-500/70 hover:bg-red-50 hover:text-red-500 border border-transparent"
                        : isDark ? "text-gray-400 hover:bg-white/5 hover:text-gray-200 border border-transparent" : "text-gray-500 hover:bg-gray-50 hover:text-gray-800 border border-transparent"
                    }`}
                >
                  {isActive && (
                    <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full ${isDanger ? "bg-red-500" : "bg-gradient-to-b from-violet-500 to-purple-600"}`} />
                  )}
                  <span className={`flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 transition-all duration-200 ${isActive
                      ? isDanger ? "bg-red-500/20 text-red-400" : `bg-gradient-to-br ${tab.color} text-white shadow-sm`
                      : isDark ? "bg-white/5 group-hover:bg-white/10" : "bg-gray-100 group-hover:bg-gray-200"
                    }`}>
                    <Icon size={15} strokeWidth={isActive ? 2.5 : 2} />
                  </span>
                  {tab.label}
                  {isActive && (
                    <span className="ml-auto">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className={`h-px mx-1 mb-4 ${isDark ? "bg-white/5" : "bg-gray-100"}`} />

          {/* Account info */}
          <div className={`rounded-2xl p-4 mb-4 ${isDark ? "bg-white/[0.03] border border-white/5" : "bg-violet-50/80 border border-violet-100/60"}`}>
            <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] mb-3 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
              <ShieldCheck size={12} /><span>Account Info</span>
            </div>
            <div className="flex flex-col gap-2.5">
              <div className="flex justify-between items-center">
                <span className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>Member since</span>
                <span className={`text-xs font-semibold ${isDark ? "text-gray-200" : "text-gray-700"}`}>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "—"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>Account type</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gradient-to-r from-violet-500/15 to-purple-500/15 text-violet-500 border border-violet-500/20">Standard</span>
              </div>
            </div>
          </div>

          <button onClick={onLogout} className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${isDark ? "bg-white/[0.03] text-gray-400 hover:bg-red-500/12 hover:text-red-400 border border-white/5 hover:border-red-500/20" : "bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-500 border border-gray-100 hover:border-red-100"}`}>
            <LogOut size={15} className="transition-transform duration-200 group-hover:-translate-x-0.5" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}