import { useTheme } from "../context/ThemeContext";
import {
  MessageSquare,
  Users,
  Zap,
  Shield,
  Video,
  Bell,
  Search,
  Sparkles,
  Github,
  Globe,
  Database,
  Server,
  Code2,
  Cpu,
} from "lucide-react";

const FEATURES = [
  {
    icon: MessageSquare,
    title: "Real-Time Messaging",
    desc: "Instant DMs and group chats powered by Socket.io with typing indicators and online status.",
    color: "violet",
  },
  {
    icon: Sparkles,
    title: "AI Smart Replies",
    desc: "Context-aware reply suggestions and message summarization via Anthropic Claude.",
    color: "purple",
  },
  {
    icon: Video,
    title: "Video Calls",
    desc: "1-on-1 and group video calls with WebRTC, supporting screen sharing.",
    color: "blue",
  },
  {
    icon: Users,
    title: "Group Chats",
    desc: "Create and manage groups, add/remove members, and assign admin roles.",
    color: "green",
  },
  {
    icon: Bell,
    title: "Notifications",
    desc: "Live unread badge counts and deep-link notifications that jump straight to the chat.",
    color: "orange",
  },
  {
    icon: Search,
    title: "User Search",
    desc: "Find users by name or username with recent-search history saved locally.",
    color: "pink",
  },
  {
    icon: Shield,
    title: "Secure Auth",
    desc: "JWT access + refresh tokens, OTP-based email verification, and GitHub OAuth.",
    color: "red",
  },
  {
    icon: Zap,
    title: "Redis Caching",
    desc: "Upstash Redis for rate limiting, session caching, and fast data retrieval.",
    color: "yellow",
  },
];

const STACK = [
  {
    layer: "Frontend",
    icon: Code2,
    items: ["React 18 + Vite", "Tailwind CSS", "React Router v6", "Socket.io Client", "Axios"],
    gradient: "from-violet-500 to-purple-600",
  },
  {
    layer: "Backend",
    icon: Server,
    items: ["Node.js (ESM)", "Express 5", "Socket.io", "Passport (GitHub OAuth)", "Nodemailer"],
    gradient: "from-blue-500 to-cyan-600",
  },
  {
    layer: "Database & Cache",
    icon: Database,
    items: ["MongoDB Atlas", "Mongoose ODM", "Upstash Redis", "Cloudinary (media)"],
    gradient: "from-green-500 to-emerald-600",
  },
  {
    layer: "AI",
    icon: Cpu,
    items: ["Anthropic Claude SDK", "claude-sonnet-4-6 (main)", "claude-haiku-4-5 (fast)", "Tool-use agent loop"],
    gradient: "from-orange-500 to-pink-600",
  },
];

const COLOR_MAP = {
  violet: { bg: "bg-violet-500/10", text: "text-violet-400", ring: "ring-violet-500/20" },
  purple: { bg: "bg-purple-500/10", text: "text-purple-400", ring: "ring-purple-500/20" },
  blue: { bg: "bg-blue-500/10", text: "text-blue-400", ring: "ring-blue-500/20" },
  green: { bg: "bg-green-500/10", text: "text-green-400", ring: "ring-green-500/20" },
  orange: { bg: "bg-orange-500/10", text: "text-orange-400", ring: "ring-orange-500/20" },
  pink: { bg: "bg-pink-500/10", text: "text-pink-400", ring: "ring-pink-500/20" },
  red: { bg: "bg-red-500/10", text: "text-red-400", ring: "ring-red-500/20" },
  yellow: { bg: "bg-yellow-500/10", text: "text-yellow-400", ring: "ring-yellow-500/20" },
};

export default function About() {
  const { isDark } = useTheme();

  const card = isDark
    ? "bg-gray-900/70 border border-white/[0.08] backdrop-blur-xl"
    : "bg-white/90 border border-white shadow-sm backdrop-blur-xl";

  const muted = isDark ? "text-gray-400" : "text-gray-500";
  const subtle = isDark ? "text-gray-500" : "text-gray-400";

  return (
    <div
      className={`relative min-h-screen overflow-x-hidden transition-colors duration-300 ${isDark ? "bg-[#0a0a14] text-gray-100" : "bg-[#f4f5ff] text-gray-900"}`}
      style={{
        backgroundImage: isDark
          ? "radial-gradient(ellipse at 15% 0%, rgba(139,92,246,0.22) 0%, transparent 50%), radial-gradient(ellipse at 85% 90%, rgba(236,72,153,0.14) 0%, transparent 50%)"
          : "radial-gradient(ellipse at 15% 0%, rgba(167,139,250,0.28) 0%, transparent 50%), radial-gradient(ellipse at 85% 90%, rgba(244,114,182,0.18) 0%, transparent 50%)",
      }}
    >
      {/* Floating orbs */}
      <div
        className={`pointer-events-none absolute top-[-100px] left-[-80px] w-[420px] h-[420px] rounded-full blur-[110px] opacity-25 ${isDark ? "bg-violet-600" : "bg-violet-400"}`}
        style={{ animation: "float 12s ease-in-out infinite" }}
      />
      <div
        className={`pointer-events-none absolute top-[55%] right-[-80px] w-[320px] h-[320px] rounded-full blur-[90px] opacity-20 ${isDark ? "bg-pink-600" : "bg-pink-300"}`}
        style={{ animation: "float 16s ease-in-out infinite", animationDelay: "-5s" }}
      />
      {/* Fine grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      <style>{`
        @keyframes float { 0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(18px,-18px) scale(1.04)}66%{transform:translate(-14px,14px) scale(.96)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-10 pb-20">

        {/* ── Hero ── */}
        <div className="text-center mb-12" style={{ animation: "slideUp 0.4s cubic-bezier(0.16,1,0.3,1) both" }}>
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-5 border ${isDark ? "bg-violet-500/15 text-violet-400 border-violet-500/25" : "bg-violet-50 text-violet-600 border-violet-200"}`}
          >
            <Sparkles size={11} strokeWidth={2.5} /> Platform
          </div>
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl shadow-xl mb-5 block mx-auto"
            style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7, #ec4899)" }}
          >
            <Sparkles size={28} className="text-white" strokeWidth={2.5} />
          </div>
          <h1
            className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent mb-3"
            style={{ backgroundImage: "linear-gradient(135deg, #7c3aed, #a855f7, #ec4899)" }}
          >
            ChatsConnect
          </h1>
          <p className={`text-base sm:text-lg max-w-xl mx-auto leading-relaxed ${muted}`}>
            A full-stack real-time chat platform with AI-powered smart replies,
            video calls, and group messaging — built as a mini-project by Aditya Raut.
          </p>

          {/* Links */}
          <div className="flex items-center justify-center gap-3 mt-5 flex-wrap">
            <a
              href="https://github.com/adity1raut/MiniProject-"
              target="_blank"
              rel="noreferrer"
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 ${isDark
                ? "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white"
                : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm"
                }`}
            >
              <Github size={15} /> GitHub Repo
            </a>
            <a
              href="https://mini-project-omega-ochre.vercel.app"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 hover:scale-105 shadow-md"
              style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}
            >
              <Globe size={15} /> Live Frontend
            </a>
          </div>
        </div>

        {/* ── Features grid ── */}
        <section className="mb-12" style={{ animation: "slideUp 0.45s 0.06s cubic-bezier(0.16,1,0.3,1) both" }}>
          <h2 className={`text-xs font-bold uppercase tracking-widest mb-5 ${subtle}`}>
            Features
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FEATURES.map(({ icon: Icon, title, desc, color }) => {
              const c = COLOR_MAP[color];
              return (
                <div key={title} className={`${card} rounded-2xl p-5 flex gap-4`}>
                  <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ring-1 ${c.bg} ${c.ring}`}>
                    <Icon size={18} className={c.text} strokeWidth={2} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm mb-1">{title}</p>
                    <p className={`text-sm leading-relaxed ${muted}`}>{desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Tech stack ── */}
        <section className="mb-12" style={{ animation: "slideUp 0.5s 0.1s cubic-bezier(0.16,1,0.3,1) both" }}>
          <h2 className={`text-xs font-bold uppercase tracking-widest mb-5 ${subtle}`}>
            Tech Stack
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {STACK.map(({ layer, icon: Icon, items, gradient }) => (
              <div key={layer} className={`${card} rounded-2xl p-5`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br ${gradient}`}>
                    <Icon size={15} className="text-white" strokeWidth={2.5} />
                  </div>
                  <span className="font-bold text-sm">{layer}</span>
                </div>
                <ul className="space-y-1.5">
                  {items.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-500 flex-shrink-0" />
                      <span className={`text-sm ${muted}`}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ── Architecture note ── */}
        <section className="mb-12" style={{ animation: "slideUp 0.55s 0.14s cubic-bezier(0.16,1,0.3,1) both" }}>
          <h2 className={`text-xs font-bold uppercase tracking-widest mb-5 ${subtle}`}>
            Architecture
          </h2>
          <div className={`${card} rounded-2xl p-6`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              {[
                { label: "React + Vite", sub: "Vercel", color: "violet" },
                { label: "→", sub: "HTTPS / WSS", color: null },
                { label: "Node.js + Express", sub: "Azure App Service", color: "blue" },
                { label: "→", sub: "Mongoose / ioredis", color: null },
                { label: "MongoDB + Redis", sub: "Atlas + Upstash", color: "green" },
              ].map((node, i) =>
                node.color ? (
                  <div key={i} className="flex flex-col items-center gap-1 flex-1">
                    <span
                      className={`text-sm font-bold px-3 py-1.5 rounded-lg ${COLOR_MAP[node.color].bg} ${COLOR_MAP[node.color].text}`}
                    >
                      {node.label}
                    </span>
                    <span className={`text-[11px] font-medium ${subtle}`}>{node.sub}</span>
                  </div>
                ) : (
                  <span key={i} className={`text-lg font-bold ${subtle} hidden sm:block`}>
                    {node.label}
                  </span>
                )
              )}
            </div>
            <p className={`mt-5 text-sm leading-relaxed ${muted}`}>
              The frontend is deployed on <strong className="font-semibold">Vercel</strong> and communicates
              with the backend over HTTPS REST and WebSocket (Socket.io). The backend runs on{" "}
              <strong className="font-semibold">Azure App Service (B1, Central India)</strong>, connects to
              MongoDB Atlas for persistence, and uses Upstash Redis for caching and rate limiting.
              AI features are handled inline by the Node server via the{" "}
              <strong className="font-semibold">Anthropic SDK</strong> — no separate microservice.
            </p>
          </div>
        </section>

        {/* ── Author ── */}
        <section style={{ animation: "slideUp 0.6s 0.18s cubic-bezier(0.16,1,0.3,1) both" }}>
          <h2 className={`text-xs font-bold uppercase tracking-widest mb-5 ${subtle}`}>
            Author
          </h2>
          <div className={`${card} rounded-2xl p-6 flex items-center gap-5`}>
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl font-black text-white shadow-lg"
              style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}
            >
              A
            </div>
            <div>
              <p className="font-bold text-base">Aditya Raut</p>
              <p className={`text-sm ${muted} mb-2`}>Full-Stack Developer · Mini Project</p>
              <a
                href="https://github.com/adity1raut"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors"
              >
                <Github size={13} /> @adity1raut
              </a>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
