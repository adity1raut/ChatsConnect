import React, { useState } from "react";
import {
  Heart, MessageCircle, UserPlus, AtSign, Bell, BellOff,
  CheckCheck, Filter, Settings, Sparkles, TrendingUp, Clock,
  Users, Star, Zap,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import ThemeToggle from "../common/ThemeToggle";

/* ─── config ─── */
const TYPE_CFG = {
  like: { icon: Heart, iconClass: "text-rose-400 fill-rose-400", bg: "from-rose-500 to-pink-500", soft: "bg-rose-500/15" },
  comment: { icon: MessageCircle, iconClass: "text-blue-400", bg: "from-blue-500 to-cyan-500", soft: "bg-blue-500/15" },
  follow: { icon: UserPlus, iconClass: "text-emerald-400", bg: "from-emerald-500 to-teal-500", soft: "bg-emerald-500/15" },
  mention: { icon: AtSign, iconClass: "text-violet-400", bg: "from-violet-500 to-purple-600", soft: "bg-violet-500/15" },
};

const NOTIFICATIONS_DATA = [
  { id: 1, type: "like", user: { name: "Sarah Wilson", avatar: "👩" }, action: "liked your post", content: "Amazing sunset photo! 🌅", time: "2m ago", read: false },
  { id: 2, type: "comment", user: { name: "Mike Johnson", avatar: "👨" }, action: "commented on your post", content: "This looks incredible! Where was this taken?", time: "15m ago", read: false },
  { id: 3, type: "follow", user: { name: "Emma Davis", avatar: "👧" }, action: "started following you", time: "1h ago", read: false },
  { id: 4, type: "mention", user: { name: "Alex Chen", avatar: "🧑" }, action: "mentioned you in a comment", content: "@you Check out this amazing work!", time: "2h ago", read: true },
  { id: 5, type: "like", user: { name: "Jessica Brown", avatar: "👩‍🦰" }, action: "liked your comment", content: "Great perspective on this topic!", time: "3h ago", read: true },
  { id: 6, type: "comment", user: { name: "David Lee", avatar: "🧔" }, action: "replied to your comment", content: "I totally agree with your point about...", time: "5h ago", read: true },
  { id: 7, type: "follow", user: { name: "Sophia Garcia", avatar: "👩‍💼" }, action: "started following you", time: "1d ago", read: true },
  { id: 8, type: "like", user: { name: "James Martinez", avatar: "👨‍💻" }, action: "liked your post", content: "Beautiful composition! Love the colors.", time: "2d ago", read: true },
];

const FILTER_TABS = [
  { id: "all", label: "All", icon: Sparkles },
  { id: "unread", label: "Unread", icon: Bell },
  { id: "like", label: "Likes", icon: Heart },
  { id: "comment", label: "Comments", icon: MessageCircle },
  { id: "follow", label: "Follows", icon: UserPlus },
  { id: "mention", label: "Mentions", icon: AtSign },
];

const ACTIVITY_STATS = [
  { label: "Total Alerts", value: "8", trend: "+3", icon: Bell, color: "from-violet-500 to-purple-600" },
  { label: "Unread", value: "3", trend: "+1", icon: Zap, color: "from-rose-500 to-pink-500" },
  { label: "New Followers", value: "2", trend: "+2", icon: Users, color: "from-emerald-500 to-teal-500" },
  { label: "Mentions", value: "1", trend: "—", icon: AtSign, color: "from-blue-500 to-cyan-500" },
];

export default function NotificationPage() {
  const { isDark } = useTheme();
  const [activeFilter, setActiveFilter] = useState("all");
  const [notifs, setNotifs] = useState(NOTIFICATIONS_DATA);

  const unreadCount = notifs.filter((n) => !n.read).length;
  const filtered = notifs.filter((n) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "unread") return !n.read;
    return n.type === activeFilter;
  });

  const markAllRead = () => setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  const dismiss = (id) => setNotifs((prev) => prev.filter((n) => n.id !== id));

  /* ── shared token shortcuts ── */
  const card = isDark
    ? "bg-gray-900/70 border-white/[0.08] backdrop-blur-xl"
    : "bg-white/90 border-white shadow-sm backdrop-blur-xl";

  return (
    <div
      className={`relative min-h-screen overflow-x-hidden transition-colors duration-300 ${isDark ? "bg-[#0a0a14]" : "bg-[#f4f5ff]"}`}
      style={{
        backgroundImage: isDark
          ? "radial-gradient(ellipse at 15% 0%, rgba(139,92,246,0.22) 0%, transparent 50%), radial-gradient(ellipse at 85% 90%, rgba(236,72,153,0.14) 0%, transparent 50%)"
          : "radial-gradient(ellipse at 15% 0%, rgba(167,139,250,0.28) 0%, transparent 50%), radial-gradient(ellipse at 85% 90%, rgba(244,114,182,0.18) 0%, transparent 50%)",
      }}
    >
      {/* grid overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)", backgroundSize: "56px 56px" }} />

      {/* animated background orbs */}
      <div className={`pointer-events-none absolute top-[-100px] left-[-80px] w-[420px] h-[420px] rounded-full blur-[110px] opacity-25 ${isDark ? "bg-violet-600" : "bg-violet-400"}`}
        style={{ animation: "float 12s ease-in-out infinite" }} />
      <div className={`pointer-events-none absolute top-[55%] right-[-80px] w-[320px] h-[320px] rounded-full blur-[90px] opacity-20 ${isDark ? "bg-pink-600" : "bg-pink-300"}`}
        style={{ animation: "float 16s ease-in-out infinite", animationDelay: "-5s" }} />

      <style>{`
        @keyframes float { 0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(18px,-18px) scale(1.04)}66%{transform:translate(-14px,14px) scale(.96)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* theme toggle — desktop */}
      <div className="fixed top-5 right-5 z-[100] hidden md:block"><ThemeToggle /></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-24 md:pb-10">

        {/* ── Header ── */}
        <div className="mb-7" style={{ animation: "slideUp .4s cubic-bezier(.16,1,.3,1) both" }}>
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-3 border ${isDark ? "bg-violet-500/15 text-violet-400 border-violet-500/25" : "bg-violet-50 text-violet-600 border-violet-200"
            }`}>
            <Bell size={10} strokeWidth={3} /> Activity
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className={`text-2xl sm:text-4xl font-extrabold tracking-tight leading-none ${isDark ? "text-white" : "text-gray-900"}`}>
                Notifications
              </h1>
              <p className={`text-sm mt-1.5 font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}` : "You're all caught up! ✓"}
              </p>
            </div>
            {unreadCount > 0 && (
              <button onClick={markAllRead}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all hover:scale-105 ${isDark ? "bg-white/[0.04] border-white/10 text-gray-300 hover:bg-white/[0.08]" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm"
                  }`}>
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-6 sm:mb-8" style={{ animation: "slideUp .45s .06s cubic-bezier(.16,1,.3,1) both" }}>
          {ACTIVITY_STATS.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className={`relative rounded-2xl p-4 sm:p-5 border overflow-hidden transition-all hover:scale-[1.02] hover:-translate-y-0.5 cursor-default group ${card}`}>
                <div className="absolute top-0 left-0 right-0 h-0.5 opacity-70" style={{ background: `linear-gradient(90deg, ${s.color.replace("from-", "").replace(/ to-.*/, "")}, ${s.color.replace(/.*to-/, "")})` }} />
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <Icon size={17} className="text-white" strokeWidth={2.5} />
                </div>
                <div className={`text-2xl sm:text-3xl font-extrabold tracking-tight mb-0.5 ${isDark ? "text-white" : "text-gray-900"}`}>{s.value}</div>
                <div className={`text-xs font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>{s.label}</div>
                <div className="absolute top-4 right-4 flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/15 border border-emerald-500/20 px-1.5 py-0.5 rounded-full">
                  {s.trend !== "—" && <TrendingUp size={9} />}{s.trend}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Main two-column grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6" style={{ animation: "slideUp .5s .1s cubic-bezier(.16,1,.3,1) both" }}>

          {/* LEFT — notification feed */}
          <div className={`lg:col-span-2 rounded-2xl border overflow-hidden ${card}`}>
            <div className="h-0.5 w-full bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 opacity-70" />

            {/* filter bar */}
            <div className={`px-5 pt-5 pb-4 border-b ${isDark ? "border-white/[0.05]" : "border-gray-100"}`}>
              <div className="flex items-center justify-between mb-3">
                <h2 className={`font-bold text-base ${isDark ? "text-white" : "text-gray-900"}`}>Recent Activity</h2>
                <Filter size={14} className={isDark ? "text-gray-600" : "text-gray-400"} />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-none">
                {FILTER_TABS.map(({ id, label, icon: Icon }) => {
                  const isActive = activeFilter === id;
                  return (
                    <button key={id} onClick={() => setActiveFilter(id)}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex-shrink-0 transition-all duration-200 border ${isActive
                          ? "text-white border-transparent shadow-sm"
                          : isDark ? "text-gray-500 border-white/8 hover:text-gray-300 hover:bg-white/[0.05]" : "text-gray-500 border-gray-200 bg-white hover:bg-gray-50 shadow-sm"
                        }`}
                      style={isActive ? { background: "linear-gradient(135deg,#7c3aed,#a855f7)" } : {}}>
                      <Icon size={11} strokeWidth={2} />
                      {label}
                      {id === "unread" && unreadCount > 0 && (
                        <span className="min-w-[16px] h-4 px-1 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* list */}
            {filtered.length > 0 ? (
              <div className="divide-y divide-white/[0.035]">
                {filtered.map((n) => {
                  const cfg = TYPE_CFG[n.type];
                  const Icon = cfg.icon;
                  return (
                    <div key={n.id}
                      className={`flex items-start gap-4 px-5 py-4 transition-all duration-200 cursor-pointer group relative ${!n.read ? isDark ? "bg-violet-500/[0.05]" : "bg-violet-50/50" : isDark ? "hover:bg-white/[0.025]" : "hover:bg-gray-50/80"
                        }`}>
                      {!n.read && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-10 rounded-full bg-gradient-to-b from-violet-500 to-purple-600" />}

                      <div className="relative flex-shrink-0">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-400 via-purple-500 to-pink-400 flex items-center justify-center text-lg shadow-md">
                          {n.user.avatar}
                        </div>
                        <div className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center ring-2 ${isDark ? "ring-gray-900" : "ring-white"} ${cfg.soft}`}>
                          <Icon size={10} className={cfg.iconClass} strokeWidth={2.5} />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                          <span className="font-bold">{n.user.name}</span>{" "}
                          <span className={isDark ? "text-gray-400" : "text-gray-500"}>{n.action}</span>
                        </p>
                        {n.content && <p className={`text-xs mt-0.5 line-clamp-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>{n.content}</p>}
                        <p className={`text-[10px] mt-1 font-medium ${isDark ? "text-gray-600" : "text-gray-400"}`}>{n.time}</p>

                        {n.type === "follow" && !n.read && (
                          <div className="flex gap-2 mt-2.5">
                            <button className="px-4 py-1.5 rounded-xl text-xs font-bold text-white transition-all hover:scale-105 shadow-md"
                              style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}>Follow Back</button>
                            <button onClick={() => dismiss(n.id)}
                              className={`px-4 py-1.5 rounded-xl text-xs font-bold border transition-all ${isDark ? "border-white/10 text-gray-400 hover:bg-white/[0.06]" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                              Dismiss
                            </button>
                          </div>
                        )}
                      </div>

                      {!n.read && <div className="flex-shrink-0 w-2 h-2 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 mt-2.5 shadow-sm shadow-violet-500/40" />}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-20 flex flex-col items-center text-center px-6">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: isDark ? "rgba(139,92,246,.1)" : "rgba(167,139,250,.15)", border: `1px solid ${isDark ? "rgba(139,92,246,.2)" : "rgba(139,92,246,.15)"}` }}>
                  <BellOff size={26} className="text-violet-400" strokeWidth={1.5} />
                </div>
                <h3 className={`font-bold text-base mb-1 ${isDark ? "text-white" : "text-gray-800"}`}>Nothing here</h3>
                <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>No notifications match this filter</p>
                <button onClick={() => setActiveFilter("all")} className={`mt-3 px-4 py-1.5 rounded-xl text-xs font-bold border transition-all ${isDark ? "border-white/10 text-gray-300 hover:bg-white/[0.06]" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                  Show all
                </button>
              </div>
            )}
          </div>

          {/* RIGHT — quick actions + summary */}
          <div className="flex flex-col gap-4">

            {/* Quick actions */}
            <div className={`rounded-2xl border overflow-hidden ${card}`}>
              <div className="h-0.5 w-full bg-gradient-to-r from-violet-500 to-pink-500 opacity-60" />
              <div className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md">
                    <Zap size={13} className="text-white" strokeWidth={2.5} />
                  </div>
                  <h3 className={`font-bold text-sm ${isDark ? "text-white" : "text-gray-900"}`}>Quick Actions</h3>
                </div>
                <div className="flex flex-col gap-2">
                  {[
                    { label: "Mark all read", icon: CheckCheck, color: "from-violet-500 to-purple-600", glow: "rgba(124,58,237,.25)", action: markAllRead },
                    { label: "Clear filter", icon: Filter, color: "from-blue-500 to-cyan-500", glow: "rgba(59,130,246,.25)", action: () => setActiveFilter("all") },
                    { label: "Settings", icon: Settings, color: "from-orange-500 to-amber-500", glow: "rgba(249,115,22,.25)", action: () => { } },
                  ].map(({ label, icon: Icon, color, glow, action }) => (
                    <button key={label} onClick={action}
                      className={`group flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 hover:scale-[1.02] w-full text-left ${isDark ? "bg-white/[0.03] border-white/8 hover:bg-white/[0.06] hover:border-white/15" : "bg-gray-50 border-gray-100 hover:bg-white hover:border-gray-200 hover:shadow-sm"
                        }`}>
                      <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center transition-transform group-hover:scale-110 shadow`} style={{ boxShadow: `0 4px 12px ${glow}` }}>
                        <Icon size={15} className="text-white" strokeWidth={2} />
                      </div>
                      <span className={`text-sm font-semibold ${isDark ? "text-gray-300 group-hover:text-gray-100" : "text-gray-600 group-hover:text-gray-900"}`}>{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Notification summary */}
            <div className="relative rounded-2xl overflow-hidden"
              style={{ background: "linear-gradient(135deg, #7c3aed 0%, #9333ea 50%, #ec4899 100%)" }}>
              <div className="absolute top-[-20px] right-[-20px] w-28 h-28 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute bottom-[-30px] left-[-10px] w-32 h-32 rounded-full bg-pink-500/20 blur-3xl" />
              <div className="relative z-10 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Star size={15} className="text-white/80" strokeWidth={2} />
                  <span className="text-xs font-bold text-white/80 uppercase tracking-widest">Summary</span>
                </div>
                <p className="text-white/90 text-sm leading-relaxed mb-4">
                  You've had <span className="font-bold text-white">{notifs.length} interactions</span> this week. Keep engaging with your community!
                </p>
                <div className="flex flex-col gap-2">
                  {[
                    { label: "Likes received", val: notifs.filter(n => n.type === "like").length },
                    { label: "New followers", val: notifs.filter(n => n.type === "follow").length },
                    { label: "Mentions", val: notifs.filter(n => n.type === "mention").length },
                  ].map(({ label, val }) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-xs text-white/70">{label}</span>
                      <span className="text-sm font-bold text-white bg-white/15 px-2.5 py-0.5 rounded-full">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}