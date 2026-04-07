import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { Sparkles, Github, Moon, Sun } from "lucide-react";

export default function LandingNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, setThemeMode } = useTheme();

  const isLogin = location.pathname === "/login";
  const isRegister = location.pathname === "/registration";

  return (
    <header
      className="absolute top-0 inset-x-0 z-50 flex items-center justify-between px-5 py-3.5"
    >
      {/* Logo */}
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2.5 group"
      >
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform"
          style={{
            background: "linear-gradient(135deg, #7c3aed, #a855f7, #ec4899)",
          }}
        >
          <Sparkles size={14} className="text-white" strokeWidth={2.5} />
        </div>
        <span className="text-base font-extrabold tracking-tight text-white drop-shadow">
          ChatsConnect
        </span>
      </button>

      {/* Actions */}
      <div className="flex items-center gap-1.5">
        {/* Theme toggle */}
        <button
          onClick={() => setThemeMode(isDark ? "light" : "dark")}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all"
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* GitHub */}
        <a
          href="https://github.com/adity1raut/MiniProject-"
          target="_blank"
          rel="noreferrer"
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all"
        >
          <Github size={16} />
        </a>

        {/* Context-aware CTA */}
        {isLogin && (
          <button
            onClick={() => navigate("/registration")}
            className="ml-1 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-white/15 hover:bg-white/25 backdrop-blur border border-white/20 transition-all"
          >
            Sign up
          </button>
        )}
        {isRegister && (
          <button
            onClick={() => navigate("/login")}
            className="ml-1 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-white/15 hover:bg-white/25 backdrop-blur border border-white/20 transition-all"
          >
            Login
          </button>
        )}
      </div>
    </header>
  );
}
