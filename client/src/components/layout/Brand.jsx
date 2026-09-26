import { MessagesSquare } from "lucide-react";
import { cn } from "../../lib/utils";

// Boxed glyph + italic wordmark, as in the reference's "IPSEC PRISM"
export default function Brand({ subtitle, compact = false, className }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="flex size-9 shrink-0 items-center justify-center border border-primary/50 bg-primary/10 text-primary shadow-[0_0_14px_var(--glow)]">
        <MessagesSquare className="size-4" strokeWidth={2.25} aria-hidden="true" />
      </span>
      {!compact && (
        <div className="min-w-0">
          <p className="-skew-x-12 text-[15px] leading-none font-extrabold tracking-[0.16em] text-foreground uppercase italic">
            ChatsConnect
          </p>
          {subtitle && <p className="eyebrow mt-1.5 text-faint">{subtitle}</p>}
        </div>
      )}
    </div>
  );
}
