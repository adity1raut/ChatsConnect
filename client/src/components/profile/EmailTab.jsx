import React from "react";
import { Mail, Save, Info, ArrowRight } from "lucide-react";

export default function EmailTab({ isDark, user, newEmail, setNewEmail, loading, onSave }) {
  return (
    <div className="tab-enter">
      {/* Section header */}
      <div className="flex items-start gap-4 mb-8 pb-6 border-b border-dashed border-gray-500/15">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-blue-500 to-cyan-500 shadow-md shadow-blue-500/25">
          <Mail size={18} className="text-white" strokeWidth={2} />
        </div>
        <div>
          <h3 className={`text-xl sm:text-2xl font-bold tracking-tight leading-tight ${isDark ? "text-white" : "text-gray-900"}`}>
            Email Settings
          </h3>
          <p className={`text-sm mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
            Update the email address linked to your account
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {/* Current email display */}
        <div className="flex flex-col gap-2">
          <label className={`text-xs font-bold uppercase tracking-widest ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            Current Email
          </label>
          <div
            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm border ${isDark
                ? "bg-white/[0.03] border-white/5 text-gray-300"
                : "bg-gray-100/80 border-gray-200/50 text-gray-600"
              }`}
          >
            <Mail size={15} className={`flex-shrink-0 ${isDark ? "text-gray-600" : "text-gray-400"}`} />
            <span className="font-medium tracking-tight">{user?.email}</span>
            <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${isDark ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/20" : "bg-emerald-50 text-emerald-600 border border-emerald-200"
              }`}>
              Active
            </span>
          </div>
        </div>

        {/* Arrow divider */}
        <div className="flex items-center justify-center gap-3">
          <div className={`flex-1 h-px ${isDark ? "bg-white/5" : "bg-gray-100"}`} />
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDark ? "bg-white/5 text-gray-500" : "bg-gray-100 text-gray-400"
              }`}
          >
            <ArrowRight size={13} />
          </div>
          <div className={`flex-1 h-px ${isDark ? "bg-white/5" : "bg-gray-100"}`} />
        </div>

        {/* New email input */}
        <div className="flex flex-col gap-2">
          <label className={`text-xs font-bold uppercase tracking-widest ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            New Email Address
          </label>
          <div className="relative group">
            <Mail
              className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors duration-200 ${isDark ? "text-gray-600 group-focus-within:text-blue-400" : "text-gray-400 group-focus-within:text-blue-500"
                }`}
            />
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="new@example.com"
              className={`w-full pl-11 pr-4 py-3.5 text-sm rounded-xl border outline-none transition-all duration-200 ${isDark
                  ? "bg-white/[0.04] border-white/8 text-white placeholder-gray-600 focus:border-blue-500/60 focus:bg-blue-500/[0.06] focus:ring-4 focus:ring-blue-500/10"
                  : "bg-gray-50/80 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/8"
                }`}
            />
          </div>
        </div>

        {/* Info note */}
        <div
          className={`flex items-start gap-3 p-3.5 rounded-xl text-xs leading-relaxed ${isDark
              ? "bg-blue-500/8 border border-blue-500/15 text-blue-400"
              : "bg-blue-50 border border-blue-100 text-blue-600"
            }`}
        >
          <Info size={14} className="flex-shrink-0 mt-0.5" />
          <span>You may need to verify your new email address before the change takes effect.</span>
        </div>

        <button
          onClick={onSave}
          disabled={loading}
          className="relative flex items-center justify-center gap-2.5 w-full py-4 mt-1 rounded-xl font-bold text-white overflow-hidden transition-all duration-200 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg hover:shadow-blue-500/25 group"
          style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)" }}
        >
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          <Save size={16} strokeWidth={2.5} />
          {loading ? "Updating…" : "Update Email"}
        </button>
      </div>
    </div>
  );
}