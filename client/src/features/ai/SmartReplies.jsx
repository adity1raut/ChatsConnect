import { Sparkles } from "lucide-react";
import { useAI } from "../../context/AIContext";

// AI reply suggestions above the composer; tapping one fills the draft
export default function SmartReplies({ onSelect }) {
  const { smartReplies, aiEnabled } = useAI();
  if (!aiEnabled || !smartReplies.length) return null;

  return (
    <div className="flex shrink-0 items-center gap-2 overflow-x-auto px-4 pt-2 scrollbar-none" aria-label="Suggested replies">
      <Sparkles className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
      {smartReplies.map((reply) => (
        <button
          key={reply}
          type="button"
          onClick={() => onSelect(reply)}
          className="shrink-0 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition-colors hover:border-primary"
        >
          {reply}
        </button>
      ))}
    </div>
  );
}
