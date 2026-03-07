import React from "react";
import {
  MessageSquare, Video, Users, Settings, Bot, TrendingUp,
  ArrowRight, Zap, Calendar, Sparkles, ArrowUpRight,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

const STAT_CONFIG = {
  blue: {
    gradient: "from-blue-500 to-cyan-500",
    glow: "rgba(59,130,246,0.3)",
    bg: isDark => isDark ? "bg-blue-500/10 border-blue-500/20" : "bg-blue-50 border-blue-100",
    text: "text-blue-500",
  },
  green: {
    gradient: "from-emerald-500 to-teal-500",
    glow: "rgba(16,185,129,0.3)",
    bg: isDark => isDark ? "bg-emerald-500/10 border-emerald-500/20" : "bg-emerald-50 border-emerald-100",
    text: "text-emerald-500",
  },
  purple: {
    gradient: "from-violet-500 to-purple-600",
    glow: "rgba(139,92,246,0.3)",
    bg: isDark => isDark ? "bg-violet-500/10 border-violet-500/20" : "bg-violet-50 border-violet-100",
    text: "text-violet-500",
  },
  orange: {
    gradient: "from-orange-500 to-amber-500",
    glow: "rgba(249,115,22,0.3)",
    bg: isDark => isDark ? "bg-orange-500/10 border-orange-500/20" : "bg-orange-50 border-orange-100",
    text: "text-orange-500",
  },
};

const ACTIVITY_ICONS = {
  "sent you a message": { icon: MessageSquare, color: "text-blue-500", bg: "bg-blue-500/15" },
  "started a video call": { icon: Video, color: "text-emerald-500", bg: "bg-emerald-500/15" },
  "joined the group chat": { icon: Users, color: "text-violet-500", bg: "bg-violet-500/15" },
  "shared a file": { icon: ArrowUpRight, color: "text-orange-500", bg: "bg-orange-500/15" },
  "scheduled a meeting": { icon: Calendar, color: "text-pink-500", bg: "bg-pink-500/15" },
};

export default function MainDashboard({
  stats,
  recentActivity,
  aiEnabled,
  setAiEnabled,
  setCurrentView,
  setShowSettingsModal,
}) {
  const { isDark } = useTheme();
  const { user } = useAuth();

  // On small screens, hide the theme toggle in header (App.jsx renders nothing at top-right on mobile)
  // The theme toggle absolute position handles itself on desktop only

  const quickActions = [
    { label: "New Chat", icon: MessageSquare, color: "from-blue-500 to-cyan-500", glow: "rgba(59,130,246,0.25)", action: () => setCurrentView("chat") },
    { label: "Start Call", icon: Video, color: "from-emerald-500 to-teal-500", glow: "rgba(16,185,129,0.25)", action: () => { } },
    { label: "New Group", icon: Users, color: "from-violet-500 to-purple-600", glow: "rgba(139,92,246,0.25)", action: () => { } },
    { label: "Settings", icon: Settings, color: "from-orange-500 to-amber-500", glow: "rgba(249,115,22,0.25)", action: () => setShowSettingsModal(true) },
  ];

  return (
    <div
      className={`relative flex-1 overflow-y-auto min-h-screen transition-colors duration-300 ${isDark ? "bg-[#0a0a14]" : "bg-[#f4f5ff]"
        }`}
    >
      {/* Background: layered mesh gradients + animated orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div
          className="absolute inset-0"
          style={{
            background: isDark
              ? "radial-gradient(ellipse at 20% 10%, rgba(139,92,246,0.18) 0%, transparent 55%), radial-gradient(ellipse at 80% 80%, rgba(236,72,153,0.12) 0%, transparent 55%)"
              : "radial-gradient(ellipse at 20% 10%, rgba(167,139,250,0.25) 0%, transparent 55%), radial-gradient(ellipse at 80% 80%, rgba(244,114,182,0.18) 0%, transparent 55%)",
          }}
        />
        <div
          className={`absolute top-[-80px] right-[10%] w-[380px] h-[380px] rounded-full filter blur-[90px] opacity-20 ${isDark ? "bg-violet-600" : "bg-violet-400"}`}
          style={{ animation: "float 14s ease-in-out infinite" }}
        />
        <div
          className={`absolute bottom-[10%] left-[-60px] w-[300px] h-[300px] rounded-full filter blur-[90px] opacity-15 ${isDark ? "bg-pink-600" : "bg-pink-300"}`}
          style={{ animation: "float 18s ease-in-out infinite", animationDelay: "-7s" }}
        />
        {/* Fine grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(15px, -20px) scale(1.04); }
          66% { transform: translate(-10px, 12px) scale(0.96); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>


      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* Welcome header */}
        <div className="mb-9" style={{ animation: "slideUp 0.4s cubic-bezier(0.16,1,0.3,1) both" }}>
          <div className="flex items-start justify-between">
            <div>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-3 ${isDark ? "bg-violet-500/15 text-violet-400 border border-violet-500/25" : "bg-violet-50 text-violet-600 border border-violet-200"
                }`}>
                <Sparkles size={11} strokeWidth={2.5} />
                Dashboard Overview
              </div>
              <h1 className={`text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight ${isDark ? "text-white" : "text-gray-900"}`}>
                Welcome back,{" "}
                <span className="bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  {user?.name?.split(" ")[0] || "there"}
                </span>{" "}
                👋
              </h1>
              <p className={`mt-2 text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                Here's what's happening with your conversations today
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-6 sm:mb-8">
          {stats.map((stat, index) => {
            const cfg = STAT_CONFIG[stat.color];
            const Icon = stat.icon;

            return (
              <div
                key={index}
                className={`relative rounded-2xl p-4 sm:p-5 border transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 cursor-default overflow-hidden group ${isDark
                  ? "bg-gray-900/70 border-white/8 backdrop-blur-xl"
                  : "bg-white/90 border-white backdrop-blur-xl shadow-sm"
                  }`}
                style={{ animation: `slideUp ${0.4 + index * 0.08}s cubic-bezier(0.16,1,0.3,1) both` }}
              >
                {/* Glow on hover */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{ boxShadow: `inset 0 0 40px ${cfg.glow}` }}
                />
                {/* Top accent */}
                <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${cfg.gradient} opacity-70 rounded-t-2xl`} />

                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-11 h-11 rounded-xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center shadow-md`}
                    style={{ boxShadow: `0 4px 14px ${cfg.glow}` }}
                  >
                    <Icon size={20} className="text-white" strokeWidth={2} />
                  </div>
                  <div className="flex items-center gap-1 bg-emerald-500/15 text-emerald-500 text-xs font-bold px-2 py-1 rounded-full">
                    <TrendingUp size={11} strokeWidth={2.5} />
                    12%
                  </div>
                </div>

                <div className={`text-2xl sm:text-3xl font-extrabold tracking-tight mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>
                  {stat.value}
                </div>
                <div className={`text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Main grid: activity + AI panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">

          {/* Recent Activity */}
          {/* Recent Activity — full width on mobile, 2/3 on lg */}
          <div
            className={`lg:col-span-2 rounded-2xl border backdrop-blur-xl overflow-hidden ${isDark ? "bg-gray-900/70 border-white/8" : "bg-white/90 border-white shadow-sm"
              }`}
          >
            {/* Card top accent */}
            <div className="h-0.5 w-full bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 opacity-70" />

            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-violet-500 to-purple-600 shadow-md`}>
                    <Zap size={14} className="text-white" strokeWidth={2.5} />
                  </div>
                  <h2 className={`text-base font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                    Recent Activity
                  </h2>
                </div>
                <button className={`text-xs font-semibold flex items-center gap-1 transition-colors ${isDark ? "text-violet-400 hover:text-violet-300" : "text-violet-600 hover:text-violet-700"}`}>
                  View all <ArrowRight size={12} />
                </button>
              </div>

              <div className="flex flex-col gap-1">
                {recentActivity.map((activity, index) => {
                  const actionCfg = ACTIVITY_ICONS[activity.action] || { icon: MessageSquare, color: "text-gray-500", bg: "bg-gray-500/15" };
                  const ActionIcon = actionCfg.icon;

                  return (
                    <div
                      key={index}
                      className={`flex items-center gap-4 p-3.5 rounded-xl transition-all duration-200 group cursor-default ${isDark ? "hover:bg-white/[0.04]" : "hover:bg-gray-50"
                        }`}
                    >
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center text-lg shadow-md">
                          {activity.avatar}
                        </div>
                        {/* Action badge */}
                        <div className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center ${actionCfg.bg} ring-2 ${isDark ? "ring-gray-900" : "ring-white"}`}>
                          <ActionIcon size={10} className={actionCfg.color} strokeWidth={2.5} />
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${isDark ? "text-gray-100" : "text-gray-800"}`}>
                          {activity.user}
                        </p>
                        <p className={`text-xs truncate ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                          {activity.action}
                        </p>
                      </div>

                      <span className={`text-xs flex-shrink-0 font-medium tabular-nums ${isDark ? "text-gray-600" : "text-gray-400"}`}>
                        {activity.time}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* AI Assistant Panel */}
          <div className="relative rounded-2xl overflow-hidden" style={{ background: "linear-gradient(145deg, #6d28d9, #7c3aed, #9333ea, #db2777)" }}>
            {/* Noise texture overlay */}
            <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")" }} />
            {/* Glowing orb */}
            <div className="absolute top-[-30px] right-[-30px] w-32 h-32 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute bottom-[-40px] left-[-20px] w-40 h-40 rounded-full bg-pink-500/20 blur-3xl" />

            <div className="relative z-10 p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20">
                  <Bot size={20} className="text-white" strokeWidth={2} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">AI Assistant</h2>
                  <p className="text-xs text-purple-200 font-medium">Powered by GPT</p>
                </div>
                {/* Active dot */}
                <div className="ml-auto flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs text-emerald-300 font-medium">Active</span>
                </div>
              </div>

              <p className="text-sm text-purple-100 leading-relaxed mb-5">
                Your AI-powered chat companion is helping you communicate smarter and faster!
              </p>

              {/* Insights card */}
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 mb-4 border border-white/20">
                <h3 className="text-xs font-bold uppercase tracking-widest text-purple-200 mb-3">Today's Insights</h3>
                <ul className="space-y-2.5">
                  {[
                    { label: "Smart replies suggested", value: "23" },
                    { label: "Messages auto-translated", value: "8" },
                    { label: "Meetings scheduled", value: "5" },
                  ].map((item, i) => (
                    <li key={i} className="flex items-center justify-between">
                      <span className="text-xs text-purple-200">{item.label}</span>
                      <span className="text-xs font-bold text-white bg-white/15 px-2 py-0.5 rounded-full">{item.value}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => setAiEnabled(!aiEnabled)}
                className={`w-full py-3 rounded-xl font-bold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${aiEnabled
                  ? "bg-white text-purple-700 hover:bg-purple-50"
                  : "bg-white/20 text-white border border-white/30 hover:bg-white/30"
                  }`}
              >
                {aiEnabled ? "✓ AI Enabled" : "Enable AI"}
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div
          className={`rounded-2xl border backdrop-blur-xl overflow-hidden ${isDark ? "bg-gray-900/70 border-white/8" : "bg-white/90 border-white shadow-sm"
            }`}
        >
          <div className="h-0.5 w-full bg-gradient-to-r from-violet-500 via-pink-500 to-orange-400 opacity-60" />
          <div className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-orange-500 to-amber-500 shadow-md">
                <Sparkles size={14} className="text-white" strokeWidth={2.5} />
              </div>
              <h2 className={`text-base font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                Quick Actions
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {quickActions.map((action, i) => {
                const Icon = action.icon;
                return (
                  <button
                    key={i}
                    onClick={action.action}
                    className={`group flex flex-col items-center gap-3 p-5 rounded-2xl border transition-all duration-200 hover:scale-[1.03] hover:-translate-y-0.5 active:scale-[0.98] ${isDark
                      ? "bg-white/[0.03] border-white/8 hover:bg-white/[0.07] hover:border-white/15"
                      : "bg-gray-50/80 border-gray-100 hover:bg-white hover:border-gray-200 hover:shadow-md"
                      }`}
                  >
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg transition-transform duration-200 group-hover:scale-110`}
                      style={{ boxShadow: `0 6px 20px ${action.glow}` }}
                    >
                      <Icon size={22} className="text-white" strokeWidth={2} />
                    </div>
                    <p className={`text-sm font-bold ${isDark ? "text-gray-300 group-hover:text-white" : "text-gray-600 group-hover:text-gray-900"} transition-colors`}>
                      {action.label}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
