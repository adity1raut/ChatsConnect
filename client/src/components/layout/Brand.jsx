import { cn } from "../../lib/utils";
import LogoMark from "./LogoMark";

// Mark + italic wordmark, as in the reference's "IPSEC PRISM"
export default function Brand({ subtitle, compact = false, className }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <LogoMark className="size-9 shrink-0 text-primary drop-shadow-[0_0_8px_var(--glow)]" />
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
