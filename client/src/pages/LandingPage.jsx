import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import {
  MessageSquare,
  Users,
  Zap,
  Shield,
  Video,
  Sparkles,
  ArrowRight,
  Github,
  Moon,
  Sun,
} from "lucide-react";

const FEATURES = [
  {
    icon: MessageSquare,
    title: "Real-Time Messaging",
    desc: "Instant DMs and group chats with typing indicators and online presence.",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    icon: Sparkles,
    title: "AI Smart Replies",
    desc: "Context-aware reply suggestions powered by Anthropic Claude.",
    gradient: "from-pink-500 to-rose-600",
  },
  {
    icon: Video,
    title: "Video Calls",
    desc: "1-on-1 and group video calls with WebRTC, right inside the chat.",
    gradient: "from-blue-500 to-cyan-600",
  },
  {
    icon: Users,
    title: "Group Chats",
    desc: "Create groups, manage members, and keep everyone in sync.",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    icon: Shield,
    title: "Secure Auth",
    desc: "OTP email verification, JWT tokens, and GitHub OAuth login.",
    gradient: "from-orange-500 to-amber-600",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    desc: "Redis caching, optimistic UI, and sub-100ms message delivery.",
    gradient: "from-yellow-500 to-orange-500",
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { isDark, themeMode, setThemeMode } = useTheme();
  const { isAuthenticated } = useAuth();

  const handleGetStarted = () => {
    if (isAuthenticated()) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 ${isDark ? "bg-[#0a0a14] text-gray-100" : "bg-[#f4f5ff] text-gray-900"
        }`}
    >
      {/* ── Navbar ── */}
      <header
        className={`sticky top-0 z-50 flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b ${isDark
          ? "bg-[#0a0a14]/90 border-white/[0.06]"
          : "bg-[#f4f5ff]/90 border-gray-200"
          }`}
        style={{ backdropFilter: "blur(20px)" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #a855f7, #ec4899)",
            }}
          >
            <Sparkles size={14} className="text-white" strokeWidth={2.5} />
          </div>
          <span
            className="text-base font-extrabold tracking-tight bg-clip-text text-transparent"
            style={{
              backgroundImage: "linear-gradient(135deg, #7c3aed, #a855f7)",
            }}
          >
            ChatsConnect
          </span>
        </div>

        {/* Nav actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Theme toggle */}
          <button
            onClick={() => setThemeMode(isDark ? "light" : "dark")}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${isDark
              ? "text-gray-400 hover:text-white hover:bg-white/8"
              : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              }`}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <a
            href="https://github.com/adity1raut/MiniProject-"
            target="_blank"
            rel="noreferrer"
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${isDark
              ? "text-gray-400 hover:text-white hover:bg-white/8"
              : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              }`}
          >
            <Github size={16} />
          </a>

          {isAuthenticated() ? (
            <button
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #a855f7)",
              }}
            >
              Dashboard
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/login")}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${isDark
                  ? "text-gray-300 hover:text-white hover:bg-white/8"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
              >
                Login
              </button>
              <button
                onClick={() => navigate("/registration")}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                }}
              >
                Sign up
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-16 sm:py-24 relative overflow-hidden">
        {/* Background blobs */}
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{
            background: "radial-gradient(circle, #7c3aed, transparent 70%)",
          }}
        />
        <div
          className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{
            background: "radial-gradient(circle, #ec4899, transparent 70%)",
          }}
        />

        {/* Badge */}
        <div
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6 ring-1 ${isDark
            ? "bg-violet-500/10 text-violet-300 ring-violet-500/20"
            : "bg-violet-50 text-violet-600 ring-violet-200"
            }`}
        >
          <Sparkles size={11} />
          AI-Powered Chat Platform
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight mb-5 max-w-2xl">
          Chat smarter,{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(135deg, #7c3aed, #a855f7, #ec4899)",
            }}
          >
            connect faster
          </span>
        </h1>

        <p
          className={`text-lg max-w-xl leading-relaxed mb-10 ${isDark ? "text-gray-400" : "text-gray-500"
            }`}
        >
          Real-time messaging with AI smart replies, group chats, video calls,
          and end-to-end security — all in one beautifully designed platform.
        </p>

        <div className="flex flex-col xs:flex-row items-center gap-3 flex-wrap justify-center w-full max-w-sm mx-auto sm:max-w-none sm:w-auto">
          <button
            onClick={handleGetStarted}
            className="w-full xs:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-100"
            style={{
              background:
                "linear-gradient(135deg, #7c3aed, #a855f7, #ec4899)",
              boxShadow: "0 8px 32px rgba(124,58,237,0.35)",
            }}
          >
            Get Started Free
            <ArrowRight size={16} />
          </button>
          <button
            onClick={() => navigate("/about")}
            className={`w-full xs:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold ring-1 transition-all hover:scale-105 active:scale-100 ${isDark
              ? "text-gray-300 ring-white/10 hover:bg-white/5"
              : "text-gray-700 ring-gray-200 hover:bg-gray-50"
              }`}
          >
            Learn More
          </button>
        </div>
      </section>

      {/* ── Features ── */}
      <section
        className={`px-4 py-20 ${isDark ? "bg-gray-900/40" : "bg-white/50"}`}
      >
        <div className="max-w-4xl mx-auto">
          <p
            className={`text-xs font-bold uppercase tracking-widest text-center mb-3 ${isDark ? "text-gray-500" : "text-gray-400"
              }`}
          >
            Everything you need
          </p>
          <h2 className="text-3xl font-extrabold tracking-tight text-center mb-12">
            Built for modern teams
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, title, desc, gradient }) => (
              <div
                key={title}
                className={`rounded-2xl p-5 transition-all hover:-translate-y-0.5 ${isDark
                  ? "bg-gray-900/60 border border-white/[0.06] hover:border-white/10"
                  : "bg-white/90 border border-gray-200 hover:shadow-md hover:bg-white"
                  }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br ${gradient}`}
                >
                  <Icon size={18} className="text-white" strokeWidth={2} />
                </div>
                <p className="font-bold text-sm mb-1.5">{title}</p>
                <p
                  className={`text-sm leading-relaxed ${isDark ? "text-gray-400" : "text-gray-500"
                    }`}
                >
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-4 py-20 text-center">
        <div className="max-w-lg mx-auto">
          <h2 className="text-3xl font-extrabold tracking-tight mb-4">
            Ready to connect?
          </h2>
          <p
            className={`text-base mb-8 ${isDark ? "text-gray-400" : "text-gray-500"
              }`}
          >
            Join ChatsConnect today and experience the future of team communication.
          </p>
          <button
            onClick={handleGetStarted}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl text-sm font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-100"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #a855f7, #ec4899)",
              boxShadow: "0 8px 32px rgba(124,58,237,0.35)",
            }}
          >
            Start chatting now
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        className={`px-4 sm:px-6 py-6 border-t text-center text-xs ${isDark
          ? "border-white/[0.06] text-gray-600"
          : "border-gray-200/60 text-gray-400"
          }`}
      >
        Built by{" "}
        <a
          href="https://github.com/adity1raut"
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-violet-500 hover:text-violet-400 transition-colors"
        >
          Aditya Raut
        </a>{" "}
        · ChatsConnect Mini Project
      </footer>
    </div>
  );
}
