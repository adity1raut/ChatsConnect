import React from "react";
import { AlertTriangle, X, Trash2 } from "lucide-react";

export default function DeleteModal({
  isDark,
  deleteConfirmText,
  setDeleteConfirmText,
  loading,
  onConfirm,
  onCancel,
}) {
  const isConfirmed = deleteConfirmText === "DELETE";

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[150] p-4"
      style={{
        backgroundColor: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        className={`relative w-full max-w-[440px] rounded-3xl shadow-2xl overflow-hidden transition-all ${
          isDark
            ? "bg-gray-900 border border-white/10"
            : "bg-white border border-gray-200"
        }`}
        style={{ animation: "slideUp 0.3s cubic-bezier(0.16,1,0.3,1) both" }}
      >
        {/* Top danger accent */}
        <div className="h-1 w-full bg-gradient-to-r from-red-500 to-rose-600" />

        <div className="p-8 sm:p-10">
          {/* Close button */}
          <button
            className={`absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 ${
              isDark
                ? "text-gray-500 hover:bg-white/10 hover:text-white"
                : "text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            }`}
            onClick={onCancel}
          >
            <X size={16} />
          </button>

          {/* Icon */}
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 relative ${
              isDark ? "bg-red-500/15" : "bg-red-50"
            }`}
          >
            <div
              className="absolute inset-0 rounded-2xl bg-red-500/10 animate-ping"
              style={{ animationDuration: "2s" }}
            />
            <AlertTriangle
              size={26}
              className="text-red-500 relative z-10"
              strokeWidth={2}
            />
          </div>

          <h3
            className={`text-2xl font-bold mb-2 tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}
          >
            Delete your account?
          </h3>
          <p
            className={`text-sm leading-relaxed mb-6 ${isDark ? "text-gray-400" : "text-gray-500"}`}
          >
            This action is{" "}
            <strong className="text-red-400">permanent and irreversible</strong>
            . All your data, messages, and settings will be permanently deleted.
            Type{" "}
            <span
              className={`inline font-mono font-bold px-1.5 py-0.5 rounded text-red-500 ${
                isDark ? "bg-red-500/15" : "bg-red-50"
              }`}
            >
              DELETE
            </span>{" "}
            below to confirm.
          </p>

          <div className="relative mb-6">
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type DELETE to confirm"
              className={`w-full px-4 py-3.5 text-sm font-mono rounded-xl border outline-none transition-all duration-200 ${
                isDark
                  ? `bg-white/[0.04] text-white placeholder-gray-600 ${
                      isConfirmed
                        ? "border-red-500/60 ring-4 ring-red-500/10"
                        : "border-white/8 focus:border-red-500/60 focus:ring-4 focus:ring-red-500/10"
                    }`
                  : `bg-gray-50 text-gray-900 placeholder-gray-400 ${
                      isConfirmed
                        ? "border-red-400 ring-4 ring-red-500/8"
                        : "border-gray-200 focus:border-red-400 focus:ring-4 focus:ring-red-500/8"
                    }`
              }`}
            />
            {isConfirmed && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-red-400">
                <Trash2 size={15} />
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                isDark
                  ? "bg-white/8 text-gray-300 hover:bg-white/15 hover:text-white border border-white/8"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900 border border-gray-200"
              }`}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading || !isConfirmed}
              className="flex-1 py-3 rounded-xl font-bold text-sm text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-red-500/30 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-md relative overflow-hidden group"
              style={{
                background: "linear-gradient(135deg, #dc2626, #e11d48)",
              }}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="white"
                      strokeWidth="3"
                      strokeOpacity="0.3"
                    />
                    <path
                      d="M12 2a10 10 0 0 1 10 10"
                      stroke="white"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                  Deleting…
                </span>
              ) : (
                "Delete Account"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
