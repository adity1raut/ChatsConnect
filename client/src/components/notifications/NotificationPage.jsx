import { useState } from "react";
import {
  Heart,
  MessageCircle,
  UserPlus,
  AtSign,
  Bell,
  BellOff,
  CheckCheck,
  Filter,
  Settings,
  Sparkles,
  TrendingUp,
  Users,
  Star,
  Zap,
  MessageSquare,
  Check,
  X,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useNotifications } from "../../context/NotificationContext";
import { useFriends } from "../../context/FriendContext";
import { useNavigate } from "react-router-dom";

/* ─── config for static notification types ─── */
const TYPE_CFG = {
  like: {
    icon: Heart,
    iconClass: "text-rose-400 fill-rose-400",
    bg: "from-rose-500 to-pink-500",
    soft: "bg-rose-500/15",
  },
  comment: {
    icon: MessageCircle,
    iconClass: "text-blue-400",
    bg: "from-blue-500 to-cyan-500",
    soft: "bg-blue-500/15",
  },
  follow: {
    icon: UserPlus,
    iconClass: "text-emerald-400",
    bg: "from-emerald-500 to-teal-500",
    soft: "bg-emerald-500/15",
  },
  mention: {
    icon: AtSign,
    iconClass: "text-violet-400",
    bg: "from-violet-500 to-purple-600",
    soft: "bg-violet-500/15",
  },
  message: {
    icon: MessageSquare,
    iconClass: "text-violet-400",
    bg: "from-violet-500 to-purple-600",
    soft: "bg-violet-500/15",
  },
  groupMessage: {
    icon: Users,
    iconClass: "text-blue-400",
    bg: "from-blue-500 to-cyan-500",
    soft: "bg-blue-500/15",
  },
  friendRequest: {
    icon: UserPlus,
    iconClass: "text-emerald-400",
    bg: "from-emerald-500 to-teal-500",
    soft: "bg-emerald-500/15",
  },
  friendAccepted: {
    icon: Check,
    iconClass: "text-emerald-400",
    bg: "from-emerald-500 to-teal-500",
    soft: "bg-emerald-500/15",
  },
};

const FILTER_TABS = [
  { id: "all", label: "All", icon: Sparkles },
  { id: "unread", label: "Unread", icon: Bell },
  { id: "friendRequest", label: "Friends", icon: UserPlus },
  { id: "message", label: "Messages", icon: MessageSquare },
  { id: "groupMessage", label: "Groups", icon: Users },
];

const ACTIVITY_STATS_CFG = [
  {
    label: "Total",
    key: "total",
    icon: Bell,
    color: "from-violet-500 to-purple-600",
  },
  {
    label: "Unread",
    key: "unread",
    icon: Zap,
    color: "from-rose-500 to-pink-500",
  },
  {
    label: "Messages",
    key: "message",
    icon: MessageSquare,
    color: "from-blue-500 to-cyan-500",
  },
  {
    label: "Groups",
    key: "group",
    icon: Users,
    color: "from-emerald-500 to-teal-500",
  },
];

function timeAgo(date) {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function NotificationPage() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const { notifications, unreadCount, markAllRead, dismiss } =
    useNotifications();
  const { acceptRequest, rejectRequest } = useFriends();
  const [activeFilter, setActiveFilter] = useState("all");
  const [friendActionLoading, setFriendActionLoading] = useState({});

  const filtered = notifications.filter((n) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "unread") return !n.read;
    if (activeFilter === "friendRequest")
      return n.type === "friendRequest" || n.type === "friendAccepted";
    return n.type === activeFilter;
  });

  const stats = {
    total: notifications.length,
    unread: unreadCount,
    message: notifications.filter((n) => n.type === "message").length,
    group: notifications.filter((n) => n.type === "groupMessage").length,
  };

  const handleAccept = async (e, n) => {
    e.stopPropagation();
    setFriendActionLoading((prev) => ({ ...prev, [n.id]: "accept" }));
    try {
      await acceptRequest(n.requestId, n.from._id);
      dismiss(n.id);
    } finally {
      setFriendActionLoading((prev) => {
        const next = { ...prev };
        delete next[n.id];
        return next;
      });
    }
  };

  const handleReject = async (e, n) => {
    e.stopPropagation();
    setFriendActionLoading((prev) => ({ ...prev, [n.id]: "reject" }));
    try {
      await rejectRequest(n.requestId, n.from._id);
      dismiss(n.id);
    } finally {
      setFriendActionLoading((prev) => {
        const next = { ...prev };
        delete next[n.id];
        return next;
      });
    }
  };

  const card = isDark
    ? "bg-gray-900/70 border-white/[0.08] backdrop-blur-xl"
    : "bg-white/90 border-white shadow-sm backdrop-blur-xl";

  const handleNotifClick = (n) => {
    if (n.type === "message" && n.chatId) {
      navigate("/chat", {
        state: {
          openConversationId: n.chatId,
          openChat: {
            id: n.from._id,
            name: n.from.name,
            username: n.from.username,
            avatar: n.from.avatar,
            type: "user",
          },
        },
      });
    } else if (n.type === "groupMessage" && n.groupId) {
      navigate("/chat", {
        state: {
          openGroup: { groupId: n.groupId, type: "group" },
        },
      });
    }
  };

  return (
    <div
      className={`relative min-h-screen overflow-x-hidden transition-colors duration-300 ${isDark ? "bg-[#0a0a14]" : "bg-[#f4f5ff]"}`}
      style={{
        backgroundImage: isDark
          ? "radial-gradient(ellipse at 15% 0%, rgba(139,92,246,0.22) 0%, transparent 50%), radial-gradient(ellipse at 85% 90%, rgba(236,72,153,0.14) 0%, transparent 50%)"
          : "radial-gradient(ellipse at 15% 0%, rgba(167,139,250,0.28) 0%, transparent 50%), radial-gradient(ellipse at 85% 90%, rgba(244,114,182,0.18) 0%, transparent 50%)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
      <div
        className={`pointer-events-none absolute top-[-100px] left-[-80px] w-[420px] h-[420px] rounded-full blur-[110px] opacity-25 ${isDark ? "bg-violet-600" : "bg-violet-400"}`}
        style={{ animation: "float 12s ease-in-out infinite" }}
      />
      <div
        className={`pointer-events-none absolute top-[55%] right-[-80px] w-[320px] h-[320px] rounded-full blur-[90px] opacity-20 ${isDark ? "bg-pink-600" : "bg-pink-300"}`}
        style={{
          animation: "float 16s ease-in-out infinite",
          animationDelay: "-5s",
        }}
      />

      <style>{`
        @keyframes float { 0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(18px,-18px) scale(1.04)}66%{transform:translate(-14px,14px) scale(.96)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div
          className="mb-7"
          style={{ animation: "slideUp .4s cubic-bezier(.16,1,.3,1) both" }}
        >
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-3 border ${isDark ? "bg-violet-500/15 text-violet-400 border-violet-500/25" : "bg-violet-50 text-violet-600 border-violet-200"}`}
          >
            <Bell size={10} strokeWidth={3} /> Activity
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1
                className={`text-2xl sm:text-4xl font-extrabold tracking-tight leading-none ${isDark ? "text-white" : "text-gray-900"}`}
              >
                Notifications
              </h1>
              <p
                className={`text-sm mt-1.5 font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}
              >
                {unreadCount > 0
                  ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
                  : "You're all caught up! ✓"}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all hover:scale-105 ${isDark ? "bg-white/[0.04] border-white/10 text-gray-300 hover:bg-white/[0.08]" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm"}`}
              >
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>
        </div>

        {/* Stat cards */}
        <div
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-6 sm:mb-8"
          style={{
            animation: "slideUp .45s .06s cubic-bezier(.16,1,.3,1) both",
          }}
        >
          {ACTIVITY_STATS_CFG.map((s) => {
            const Icon = s.icon;
            const value = stats[s.key] ?? 0;
            return (
              <div
                key={s.label}
                className={`relative rounded-2xl p-4 sm:p-5 border overflow-hidden transition-all hover:scale-[1.02] hover:-translate-y-0.5 cursor-default ${card}`}
              >
                <div
                  className="absolute top-0 left-0 right-0 h-0.5 opacity-70"
                  style={{
                    background: `linear-gradient(90deg, var(--from), var(--to))`,
                    backgroundImage: `linear-gradient(90deg, ${s.color.includes("violet") ? "#7c3aed" : s.color.includes("rose") ? "#f43f5e" : s.color.includes("blue") ? "#3b82f6" : "#10b981"}, ${s.color.includes("violet") ? "#9333ea" : s.color.includes("rose") ? "#ec4899" : s.color.includes("blue") ? "#06b6d4" : "#14b8a6"})`,
                  }}
                />
                <div
                  className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-4 shadow-lg`}
                >
                  <Icon size={17} className="text-white" strokeWidth={2.5} />
                </div>
                <div
                  className={`text-2xl sm:text-3xl font-extrabold tracking-tight mb-0.5 ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  {value}
                </div>
                <div
                  className={`text-xs font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}
                >
                  {s.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Main grid */}
        <div
          className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6"
          style={{ animation: "slideUp .5s .1s cubic-bezier(.16,1,.3,1) both" }}
        >
          {/* LEFT — notification feed */}
          <div
            className={`lg:col-span-2 rounded-2xl border overflow-hidden ${card}`}
          >
            <div className="h-0.5 w-full bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 opacity-70" />

            {/* Filter bar */}
            <div
              className={`px-5 pt-5 pb-4 border-b ${isDark ? "border-white/[0.05]" : "border-gray-100"}`}
            >
              <div className="flex items-center justify-between mb-3">
                <h2
                  className={`font-bold text-base ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  Recent Activity
                </h2>
                <Filter
                  size={14}
                  className={isDark ? "text-gray-600" : "text-gray-400"}
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-none">
                {FILTER_TABS.map(({ id, label, icon: Icon }) => {
                  const isActive = activeFilter === id;
                  return (
                    <button
                      key={id}
                      onClick={() => setActiveFilter(id)}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all duration-200 border ${isActive
                          ? "text-white border-transparent shadow-sm"
                          : isDark
                            ? "text-gray-500 border-white/8 hover:text-gray-300 hover:bg-white/[0.05]"
                            : "text-gray-500 border-gray-200 bg-white hover:bg-gray-50 shadow-sm"
                        }`}
                      style={
                        isActive
                          ? {
                            background:
                              "linear-gradient(135deg,#7c3aed,#a855f7)",
                          }
                          : {}
                      }
                    >
                      <Icon size={11} strokeWidth={2} />
                      {label}
                      {id === "unread" && unreadCount > 0 && (
                        <span className="min-w-4 h-4 px-1 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                      {id === "friendRequest" &&
                        (() => {
                          const pendingCount = notifications.filter(
                            (n) => n.type === "friendRequest" && !n.read,
                          ).length;
                          return pendingCount > 0 ? (
                            <span className="min-w-4 h-4 px-1 bg-emerald-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                              {pendingCount}
                            </span>
                          ) : null;
                        })()}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* List */}
            {filtered.length > 0 ? (
              <div className={`divide-y ${isDark ? "divide-white/[0.035]" : "divide-gray-100"}`}>
                {filtered.map((n) => {
                  const cfg = TYPE_CFG[n.type] || TYPE_CFG.message;
                  const Icon = cfg.icon;
                  const isMsg =
                    n.type === "message" || n.type === "groupMessage";
                  const isFriend =
                    n.type === "friendRequest" || n.type === "friendAccepted";

                  return (
                    <div
                      key={n.id}
                      onClick={() => !isFriend && handleNotifClick(n)}
                      className={`flex items-start gap-4 px-5 py-4 transition-all duration-200 group relative ${isFriend ? "" : "cursor-pointer"} ${!n.read ? (isDark ? "bg-violet-500/5" : "bg-violet-50/50") : isDark ? "hover:bg-white/2.5" : "hover:bg-gray-50/80"}`}
                    >
                      {!n.read && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-10 rounded-full bg-gradient-to-b from-violet-500 to-purple-600" />
                      )}

                      <div className="relative shrink-0">
                        {n.from?.avatar && n.from.avatar.startsWith("http") ? (
                          <img
                            src={n.from.avatar}
                            alt=""
                            className="w-11 h-11 rounded-full object-cover shadow-md"
                          />
                        ) : (
                          <div
                            className="w-11 h-11 rounded-full flex items-center justify-center text-lg shadow-md text-white font-bold"
                            style={{
                              background:
                                "linear-gradient(135deg,#7c3aed,#a855f7,#ec4899)",
                            }}
                          >
                            {n.from?.name?.charAt(0).toUpperCase() || "?"}
                          </div>
                        )}
                        <div
                          className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center ring-2 ${isDark ? "ring-gray-900" : "ring-white"} ${cfg.soft}`}
                        >
                          <Icon
                            size={10}
                            className={cfg.iconClass}
                            strokeWidth={2.5}
                          />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm ${isDark ? "text-gray-200" : "text-gray-800"}`}
                        >
                          <span className="font-bold">
                            {n.from?.name || "Someone"}
                          </span>{" "}
                          <span
                            className={
                              isDark ? "text-gray-400" : "text-gray-500"
                            }
                          >
                            {n.type === "message"
                              ? "sent you a message"
                              : n.type === "groupMessage"
                                ? "sent a group message"
                                : n.type === "friendRequest"
                                  ? "sent you a friend request"
                                  : n.type === "friendAccepted"
                                    ? "accepted your friend request"
                                    : n.content || ""}
                          </span>
                        </p>
                        {n.content && n.type === "message" && (
                          <p
                            className={`text-xs mt-0.5 line-clamp-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}
                          >
                            {n.content}
                          </p>
                        )}
                        <p
                          className={`text-[10px] mt-1 font-medium ${isDark ? "text-gray-600" : "text-gray-400"}`}
                        >
                          {timeAgo(n.time)}
                        </p>
                        {isMsg && (
                          <div className="flex gap-2 mt-2.5">
                            <button
                              onClick={() => handleNotifClick(n)}
                              className="px-4 py-1.5 rounded-xl text-xs font-bold text-white transition-all hover:scale-105 shadow-md"
                              style={{
                                background:
                                  "linear-gradient(135deg,#7c3aed,#a855f7)",
                              }}
                            >
                              Reply
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                dismiss(n.id);
                              }}
                              className={`px-4 py-1.5 rounded-xl text-xs font-bold border transition-all ${isDark ? "border-white/10 text-gray-400 hover:bg-white/6" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}
                            >
                              Dismiss
                            </button>
                          </div>
                        )}
                        {n.type === "friendRequest" && (
                          <div className="flex gap-2 mt-2.5">
                            <button
                              onClick={(e) => handleAccept(e, n)}
                              disabled={!!friendActionLoading[n.id]}
                              className="flex items-center gap-1 px-4 py-1.5 rounded-xl text-xs font-bold text-white transition-all hover:scale-105 shadow-md disabled:opacity-60"
                              style={{
                                background:
                                  "linear-gradient(135deg,#10b981,#14b8a6)",
                              }}
                            >
                              <Check size={11} strokeWidth={3} />
                              {friendActionLoading[n.id] === "accept"
                                ? "Accepting…"
                                : "Accept"}
                            </button>
                            <button
                              onClick={(e) => handleReject(e, n)}
                              disabled={!!friendActionLoading[n.id]}
                              className={`flex items-center gap-1 px-4 py-1.5 rounded-xl text-xs font-bold border transition-all disabled:opacity-60 ${isDark ? "border-white/10 text-gray-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20" : "border-gray-200 text-gray-500 hover:bg-red-50 hover:text-red-500 hover:border-red-200"}`}
                            >
                              <X size={11} strokeWidth={2.5} />
                              {friendActionLoading[n.id] === "reject"
                                ? "Rejecting…"
                                : "Decline"}
                            </button>
                          </div>
                        )}
                        {n.type === "friendAccepted" && (
                          <div className="mt-2">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${isDark ? "bg-emerald-500/15 text-emerald-400" : "bg-emerald-50 text-emerald-600"}`}
                            >
                              <Check size={10} strokeWidth={3} /> Now friends
                            </span>
                          </div>
                        )}
                      </div>

                      {!n.read && (
                        <div className="shrink-0 w-2 h-2 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 mt-2.5 shadow-sm shadow-violet-500/40" />
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-20 flex flex-col items-center text-center px-6">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                  style={{
                    background: isDark
                      ? "rgba(139,92,246,.1)"
                      : "rgba(167,139,250,.15)",
                    border: `1px solid ${isDark ? "rgba(139,92,246,.2)" : "rgba(139,92,246,.15)"}`,
                  }}
                >
                  <BellOff
                    size={26}
                    className="text-violet-400"
                    strokeWidth={1.5}
                  />
                </div>
                <h3
                  className={`font-bold text-base mb-1 ${isDark ? "text-white" : "text-gray-800"}`}
                >
                  {activeFilter === "unread"
                    ? "All caught up!"
                    : "No notifications yet"}
                </h3>
                <p
                  className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}
                >
                  {activeFilter === "unread"
                    ? "You have no unread notifications"
                    : "Real-time notifications will appear here when someone messages you"}
                </p>
                {activeFilter !== "all" && (
                  <button
                    onClick={() => setActiveFilter("all")}
                    className={`mt-3 px-4 py-1.5 rounded-xl text-xs font-bold border transition-all ${isDark ? "border-white/10 text-gray-300 hover:bg-white/[0.06]" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                  >
                    Show all
                  </button>
                )}
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div className="flex flex-col gap-4">
            {/* Quick actions */}
            <div className={`rounded-2xl border overflow-hidden ${card}`}>
              <div className="h-0.5 w-full bg-gradient-to-r from-violet-500 to-pink-500 opacity-60" />
              <div className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md">
                    <Zap size={13} className="text-white" strokeWidth={2.5} />
                  </div>
                  <h3
                    className={`font-bold text-sm ${isDark ? "text-white" : "text-gray-900"}`}
                  >
                    Quick Actions
                  </h3>
                </div>
                <div className="flex flex-col gap-2">
                  {[
                    {
                      label: "Mark all read",
                      icon: CheckCheck,
                      color: "from-violet-500 to-purple-600",
                      action: markAllRead,
                    },
                    {
                      label: "Clear filter",
                      icon: Filter,
                      color: "from-blue-500 to-cyan-500",
                      action: () => setActiveFilter("all"),
                    },
                    {
                      label: "Go to chat",
                      icon: MessageSquare,
                      color: "from-emerald-500 to-teal-500",
                      action: () => navigate("/chat"),
                    },
                    {
                      label: "Settings",
                      icon: Settings,
                      color: "from-orange-500 to-amber-500",
                      action: () => { },
                    },
                  ].map(({ label, icon: Icon, color, action }) => (
                    <button
                      key={label}
                      onClick={action}
                      className={`group flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 hover:scale-[1.02] w-full text-left ${isDark ? "bg-white/[0.03] border-white/8 hover:bg-white/[0.06] hover:border-white/15" : "bg-gray-50 border-gray-100 hover:bg-white hover:border-gray-200 hover:shadow-sm"}`}
                    >
                      <div
                        className={`w-8 h-8 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center transition-transform group-hover:scale-110 shadow`}
                      >
                        <Icon
                          size={15}
                          className="text-white"
                          strokeWidth={2}
                        />
                      </div>
                      <span
                        className={`text-sm font-semibold ${isDark ? "text-gray-300 group-hover:text-gray-100" : "text-gray-600 group-hover:text-gray-900"}`}
                      >
                        {label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Summary card */}
            <div
              className="relative rounded-2xl overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, #7c3aed 0%, #9333ea 50%, #ec4899 100%)",
              }}
            >
              <div className="absolute top-[-20px] right-[-20px] w-28 h-28 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute bottom-[-30px] left-[-10px] w-32 h-32 rounded-full bg-pink-500/20 blur-3xl" />
              <div className="relative z-10 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Star size={15} className="text-white/80" strokeWidth={2} />
                  <span className="text-xs font-bold text-white/80 uppercase tracking-widest">
                    Summary
                  </span>
                </div>
                <p className="text-white/90 text-sm leading-relaxed mb-4">
                  {notifications.length === 0 ? (
                    "No activity yet. Start chatting!"
                  ) : (
                    <>
                      You have{" "}
                      <span className="font-bold text-white">
                        {notifications.length} notification
                        {notifications.length !== 1 ? "s" : ""}
                      </span>{" "}
                      from messages.
                    </>
                  )}
                </p>
                <div className="flex flex-col gap-2">
                  {[
                    {
                      label: "Direct messages",
                      val: notifications.filter((n) => n.type === "message")
                        .length,
                    },
                    {
                      label: "Group messages",
                      val: notifications.filter(
                        (n) => n.type === "groupMessage",
                      ).length,
                    },
                    { label: "Unread total", val: unreadCount },
                  ].map(({ label, val }) => (
                    <div
                      key={label}
                      className="flex items-center justify-between"
                    >
                      <span className="text-xs text-white/70">{label}</span>
                      <span className="text-sm font-bold text-white bg-white/15 px-2.5 py-0.5 rounded-full">
                        {val}
                      </span>
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
