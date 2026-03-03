import React from "react";
import { User, AtSign, Save, Sparkles } from "lucide-react";

function FormField({ label, hint, icon: Icon, isDark, children }) {
  return (
    <div className="flex flex-col gap-2">
      <label className={`text-xs font-bold uppercase tracking-widest ${isDark ? "text-gray-400" : "text-gray-500"}`}>
        {label}
      </label>
      <div className="relative group">
        {Icon && (
          <Icon
            className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors duration-200 ${isDark ? "text-gray-600 group-focus-within:text-violet-400" : "text-gray-400 group-focus-within:text-violet-500"
              }`}
          />
        )}
        {children}
      </div>
      {hint && (
        <p className={`text-xs leading-relaxed ${isDark ? "text-gray-600" : "text-gray-400"}`}>{hint}</p>
      )}
    </div>
  );
}

const inputClass = (isDark, hasIcon = true) =>
  `w-full ${hasIcon ? "pl-11" : "pl-4"} pr-4 py-3.5 text-sm rounded-xl border outline-none transition-all duration-200 ${isDark
    ? "bg-white/[0.04] border-white/8 text-white placeholder-gray-600 focus:border-violet-500/60 focus:bg-violet-500/[0.06] focus:ring-4 focus:ring-violet-500/10"
    : "bg-gray-50/80 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-500/8"
  }`;

export default function ProfileTab({ isDark, name, setName, username, setUsername, bio, setBio, loading, onSave }) {
  return (
    <div className="tab-enter">
      {/* Section header */}
      <div className="flex items-start gap-4 mb-8 pb-6 border-b border-dashed border-gray-500/15">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-violet-500 to-purple-600 shadow-md shadow-violet-500/25`}>
          <User size={18} className="text-white" strokeWidth={2} />
        </div>
        <div>
          <h3 className={`text-xl sm:text-2xl font-bold tracking-tight leading-tight ${isDark ? "text-white" : "text-gray-900"}`}>
            Profile Information
          </h3>
          <p className={`text-sm mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
            Update your name, username, and personal bio
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <FormField label="Full Name" icon={User} isDark={isDark}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            className={inputClass(isDark)}
          />
        </FormField>

        <FormField
          label="Username"
          icon={AtSign}
          isDark={isDark}
          hint="3–20 characters: letters, numbers, or underscore"
        >
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            placeholder="yourhandle"
            className={inputClass(isDark)}
          />
        </FormField>

        <div className="flex flex-col gap-2">
          <label className={`text-xs font-bold uppercase tracking-widest ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            maxLength={200}
            placeholder="Tell us a little about yourself…"
            className={`w-full p-4 text-sm rounded-xl border outline-none transition-all duration-200 resize-none ${isDark
                ? "bg-white/[0.04] border-white/8 text-white placeholder-gray-600 focus:border-violet-500/60 focus:bg-violet-500/[0.06] focus:ring-4 focus:ring-violet-500/10"
                : "bg-gray-50/80 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-500/8"
              }`}
          />
          <div className="flex items-center justify-between">
            <span className={`text-xs ${isDark ? "text-gray-600" : "text-gray-400"}`}>Supports plain text only</span>
            <span className={`text-xs tabular-nums font-medium ${bio.length > 180 ? "text-orange-400" : isDark ? "text-gray-600" : "text-gray-400"}`}>
              {bio.length} / 200
            </span>
          </div>
        </div>

        <button
          onClick={onSave}
          disabled={loading}
          className="relative flex items-center justify-center gap-2.5 w-full py-4 mt-2 rounded-xl font-bold text-white overflow-hidden transition-all duration-200 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg hover:shadow-violet-500/25 group"
          style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7, #ec4899)" }}
        >
          {/* Shimmer overlay */}
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          <Save size={16} strokeWidth={2.5} />
          {loading ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}