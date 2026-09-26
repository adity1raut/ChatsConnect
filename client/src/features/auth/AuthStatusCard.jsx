import { Link } from "react-router-dom";
import { AlertCircle, Loader2 } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

// Full-screen card for auth hand-off pages: a spinner while working, or an error with a way back
export default function AuthStatusCard({ title, error }) {
  const { isDark } = useTheme();

  return (
    <div
      className={`min-h-dvh flex items-center justify-center p-4 ${isDark ? "bg-[#0a0a14] text-gray-100" : "bg-[#f4f5ff] text-gray-900"}`}
    >
      <div
        className={`w-full max-w-sm rounded-2xl border p-8 text-center shadow-xl ${isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-200"}`}
      >
        {error ? (
          <>
            <AlertCircle className="mx-auto mb-4 h-10 w-10 text-red-500" />
            <h1 className="mb-2 text-lg font-bold">Sign-in failed</h1>
            <p
              className={`mb-6 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}
            >
              {error}
            </p>
            <Link
              to="/login"
              replace
              className="inline-flex items-center justify-center rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-500"
            >
              Back to login
            </Link>
          </>
        ) : (
          <>
            <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-violet-500" />
            <h1 className="text-lg font-bold">{title}</h1>
          </>
        )}
      </div>
    </div>
  );
}
