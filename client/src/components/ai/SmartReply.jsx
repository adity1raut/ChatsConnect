import React from "react";
import { Sparkles } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAI } from "../../context/AIContext";

export default function SmartReply({ onSelect }) {
  const { isDark } = useTheme();
  const { smartReplies, aiEnabled } = useAI();

  if (!aiEnabled || !smartReplies.length) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-2 overflow-x-auto scrollbar-none">
      <Sparkles size={12} className="text-violet-500 flex-shrink-0" />
      {smartReplies.map((reply, i) => (
        <button
          key={i}
          onClick={() => onSelect(reply)}
          className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors ${
            isDark
              ? "border-violet-500/30 text-violet-400 hover:bg-violet-500/10"
              : "border-violet-300 text-violet-600 hover:bg-violet-50"
          }`}
        >
          {reply}
        </button>
      ))}
    </div>
  );
}
