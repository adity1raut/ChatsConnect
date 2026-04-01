import { useTheme } from "../../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import {
  MessageSquare, Video, Users, Bot, Bell, Shield,
  Code2, Layers, Cpu, Globe, Sparkles, Star, ArrowRight,
  Info, BookOpen,
} from "lucide-react";

const FEATURES = [
  {
    icon: MessageSquare,
    title: "Real-Time Messaging",
    desc: "Instant DMs and group chats powered by WebSockets with typing indicators, read receipts, and rich media sharing.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Bot,
    title: "AI-Powered Features",
    desc: "Smart replies, auto-translate, sentiment analysis, and conversation summaries via Groq LLaMA-3.3-70b.",
    color: "from-violet-500 to-purple-600",
  },
  {
    icon: Video,
    title: "Video & Voice Calls",
    desc: "Crystal-clear 1-on-1 and group video calls with screen sharing support, built on WebRTC.",
    color: "from-rose-500 to-pink-500",
  },
  {
    icon: Users,
    title: "Groups & Communities",
    desc: "Create and manage groups with custom avatars, role management, and dedicated group video rooms.",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    desc: "Real-time push notifications with deep-link navigation directly into conversations.",
    color: "from-orange-500 to-amber-500",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    desc: "JWT auth with OTP email verification, GitHub OAuth, refresh token rotation, and encrypted sessions.",
    color: "from-indigo-500 to-blue-600",
  },
];

const TECH = [
  { label: "React + Vite", cat: "Frontend" },
  { label: "Tailwind CSS v4", cat: "Styling" },
  { label: "Node.js / Express 5", cat: "Backend" },
  { label: "MongoDB Atlas", cat: "Database" },
  { label: "Socket.io", cat: "Real-time" },
  { label: "FastAPI", cat: "AI Service" },
  { label: "Groq / LLaMA-3.3", cat: "AI Model" },
  { label: "WebRTC", cat: "Video" },
  { label: "Cloudinary", cat: "Media" },
  { label: "JWT + OAuth", cat: "Auth" },
  { label: "Docker", cat: "DevOps" },
  { label: "GitHub Actions", cat: "CI/CD" },
];

export default function AboutPage() {
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const card = isDark
    ? "bg-gray-900/70 border-white/[0.08] backdrop-blur-xl"
    : "bg-white/90 border-white shadow-sm backdrop-blur-xl";

  return (
    <div
      className={`relative min-h-screen overflow-x-hidden transition-colors duration-300 ${isDark ? "bg-[#0a0a14]" : "bg-[#f4f5ff]"}`}
      style={{
        backgroundImage: isDark
          ? "radial-gradient(ellipse at 20% 0%, rgba(139,92,246,0.22) 0%, transparent 55%), radial-gradient(ellipse at 80% 90%, rgba(236,72,153,0.14) 0%, transparent 50%)"
          : "radial-gradient(ellipse at 20% 0%, rgba(167,139,250,0.28) 0%, transparent 55%), radial-gradient(ellipse at 80% 90%, rgba(244,114,182,0.18) 0%, transparent 50%)",
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
        style={{ animation: "float 16s ease-in-out infinite", animationDelay: "-5s" }}
      />

      <style>{`
        @keyframes float { 0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(18px,-18px) scale(1.04)}66%{transform:translate(-14px,14px) scale(.96)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

        {/* Hero */}
        <div className="text-center mb-12" style={{ animation: "slideUp .4s cubic-bezier(.16,1,.3,1) both" }}>
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 border ${isDark ? "bg-violet-500/15 text-violet-400 border-violet-500/25" : "bg-violet-50 text-violet-600 border-violet-200"}`}>
            <Info size={10} strokeWidth={3} /> About
          </div>
          <h1 className={`text-4xl sm:text-6xl font-extrabold tracking-tight leading-none mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
            A Modern{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(135deg, #7c3aed, #a855f7, #ec4899)" }}
            >
              Chat Platform
            </span>
          </h1>
          <p className={`text-base sm:text-lg max-w-2xl mx-auto leading-relaxed ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            ChatsConnect is a full-stack real-time messaging platform built as a mini-project, featuring
            AI-powered assistance, group video calls, and a sleek responsive interface.
          </p>
        </div>

        {/* Stats */}
        <div
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-12"
          style={{ animation: "slideUp .45s .06s cubic-bezier(.16,1,.3,1) both" }}
        >
          {[
            { value: "12+", label: "API Endpoints",  icon: Code2,   color: "from-violet-500 to-purple-600" },
            { value: "6",   label: "Core Features",  icon: Layers,  color: "from-blue-500 to-cyan-500" },
            { value: "3",   label: "Services",       icon: Cpu,     color: "from-emerald-500 to-teal-500" },
            { value: "∞",   label: "Possibilities",  icon: Globe,   color: "from-rose-500 to-pink-500" },
          ].map(({ value, label, icon: Icon, color }) => (
            <div key={label} className={`rounded-2xl p-5 border text-center transition-all hover:scale-[1.02] hover:-translate-y-0.5 ${card}`}>
              <div className={`w-10 h-10 mx-auto rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3 shadow-lg`}>
                <Icon size={18} className="text-white" strokeWidth={2} />
              </div>
              <div className={`text-2xl sm:text-3xl font-extrabold tracking-tight mb-0.5 ${isDark ? "text-white" : "text-gray-900"}`}>{value}</div>
              <div className={`text-xs font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>{label}</div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="mb-12" style={{ animation: "slideUp .5s .1s cubic-bezier(.16,1,.3,1) both" }}>
          <div className="mb-6">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-2 border ${isDark ? "bg-blue-500/15 text-blue-400 border-blue-500/25" : "bg-blue-50 text-blue-600 border-blue-200"}`}>
              <Star size={10} strokeWidth={3} /> Features
            </div>
            <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
              Everything you need to connect
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className={`rounded-2xl p-5 border transition-all hover:scale-[1.01] hover:-translate-y-0.5 ${card}`}>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-lg`}>
                  <Icon size={18} className="text-white" strokeWidth={2} />
                </div>
                <h3 className={`font-bold text-sm mb-1.5 ${isDark ? "text-white" : "text-gray-900"}`}>{title}</h3>
                <p className={`text-xs leading-relaxed ${isDark ? "text-gray-400" : "text-gray-500"}`}>{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div
          className={`rounded-2xl border mb-8 overflow-hidden ${card}`}
          style={{ animation: "slideUp .55s .14s cubic-bezier(.16,1,.3,1) both" }}
        >
          <div className="h-0.5 w-full bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 opacity-70" />
          <div className="p-6 sm:p-8">
            <div className="mb-5">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-2 border ${isDark ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" : "bg-emerald-50 text-emerald-600 border-emerald-200"}`}>
                <Code2 size={10} strokeWidth={3} /> Tech Stack
              </div>
              <h2 className={`text-xl sm:text-2xl font-extrabold tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
                Built with modern technologies
              </h2>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {TECH.map(({ label, cat }) => (
                <div
                  key={label}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-medium transition-all hover:scale-[1.03] cursor-default ${isDark ? "bg-white/[0.04] border-white/10 text-gray-300 hover:bg-white/[0.08]" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm"}`}
                >
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${isDark ? "bg-violet-500/20 text-violet-400" : "bg-violet-100 text-violet-600"}`}>
                    {cat}
                  </span>
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Banner */}
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #7c3aed 0%, #9333ea 50%, #ec4899 100%)",
            animation: "slideUp .6s .18s cubic-bezier(.16,1,.3,1) both",
          }}
        >
          <div className="absolute top-[-30px] right-[-30px] w-44 h-44 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute bottom-[-40px] left-[-15px] w-52 h-52 rounded-full bg-pink-500/20 blur-3xl pointer-events-none" />
          <div className="relative z-10 p-8 text-center">
            <Sparkles size={28} className="text-white/80 mx-auto mb-3" strokeWidth={1.5} />
            <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-2">Start chatting today</h2>
            <p className="text-white/70 text-sm mb-6 max-w-md mx-auto">
              Experience real-time messaging, AI-powered features, and seamless group video calls — all in one place.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-violet-700 rounded-xl font-bold text-sm hover:bg-violet-50 transition-all hover:scale-105 shadow-lg"
              >
                <MessageSquare size={15} /> Dashboard
              </button>
              <button
                onClick={() => navigate("/chat")}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/15 text-white rounded-xl font-bold text-sm hover:bg-white/25 transition-all hover:scale-105 border border-white/20"
              >
                Open Chat <ArrowRight size={14} />
              </button>
              <button
                onClick={() => navigate("/blog")}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/10 text-white/80 rounded-xl font-bold text-sm hover:bg-white/20 transition-all hover:scale-105 border border-white/15"
              >
                <BookOpen size={14} /> Read Blog
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
