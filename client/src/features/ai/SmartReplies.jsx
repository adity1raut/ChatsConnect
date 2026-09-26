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
          className="h-7 shrink-0 border border-primary/35 bg-primary/[0.07] px-2.5 text-[11px] text-primary transition-colors hover:border-primary hover:bg-primary/15"
        >
          {reply}
        </button>
      ))}
    </div>
  );
}
