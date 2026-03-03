import React from "react";
import { Trash2, AlertTriangle, ShieldOff, Info } from "lucide-react";

export default function DangerZoneTab({ isDark, onDeleteClick }) {
  return (
    <div className="tab-enter">
      {/* Section header */}
      <div className="flex items-start gap-4 mb-8 pb-6 border-b border-dashed border-red-500/20">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-red-500 to-rose-600 shadow-md shadow-red-500/25">
          <ShieldOff size={18} className="text-white" strokeWidth={2} />
        </div>
        <div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight leading-tight text-red-500">
            Danger Zone
          </h3>
          <p className={`text-sm mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
            Irreversible actions — please proceed with extreme caution
          </p>
        </div>
      </div>

      {/* Warning banner */}
      <div
        className={`flex items-start gap-3 p-4 rounded-xl mb-6 text-sm border ${isDark
            ? "bg-amber-500/8 border-amber-500/20 text-amber-400"
            : "bg-amber-50 border-amber-200 text-amber-700"
          }`}
      >
        <Info size={15} className="flex-shrink-0 mt-0.5" />
        <span className="leading-relaxed">
          Actions in this section are <strong>permanent</strong> and cannot be reversed. Please make sure you understand the consequences before proceeding.
        </span>
      </div>

      {/* Delete account card */}
      <div
        className={`relative rounded-2xl border-2 overflow-hidden transition-colors ${isDark ? "bg-red-500/[0.06] border-red-500/20" : "bg-red-50/80 border-red-200"
          }`}
      >
        {/* Top accent */}
        <div className="h-0.5 w-full bg-gradient-to-r from-red-500 to-rose-600 opacity-60" />

        <div className="flex flex-col sm:flex-row gap-5 p-6">
          {/* Icon */}
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 self-start ${isDark ? "bg-red-500/20" : "bg-red-100"
              }`}
          >
            <AlertTriangle size={22} className="text-red-500" strokeWidth={2} />
          </div>

          {/* Content */}
          <div className="flex-1">
            <h4 className={`font-bold text-base mb-1.5 ${isDark ? "text-white" : "text-gray-900"}`}>
              Delete Account
            </h4>
            <p className={`text-sm leading-relaxed mb-5 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Permanently deletes your account and removes all associated data including your messages, settings, profile, and conversation history. <strong className="text-red-400">This cannot be undone.</strong>
            </p>

            {/* What gets deleted list */}
            <div className={`flex flex-wrap gap-2 mb-5 text-xs`}>
              {["All messages", "Profile data", "Account settings", "Chat history"].map((item) => (
                <span
                  key={item}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full border ${isDark
                      ? "bg-red-500/10 border-red-500/20 text-red-400"
                      : "bg-red-50 border-red-200 text-red-600"
                    }`}
                >
                  <span className="w-1 h-1 rounded-full bg-current opacity-60" />
                  {item}
                </span>
              ))}
            </div>

            <button
              onClick={onDeleteClick}
              className="group flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-bold text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-red-500/30"
              style={{ background: "linear-gradient(135deg, #dc2626, #e11d48)" }}
            >
              <Trash2 size={15} strokeWidth={2.5} className="transition-transform duration-200 group-hover:rotate-6" />
              Delete My Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}