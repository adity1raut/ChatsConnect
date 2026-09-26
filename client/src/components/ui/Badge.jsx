import { cn } from "../../lib/cn";

const VARIANTS = {
  neutral: "bg-surface-2 text-muted border border-line",
  accent: "bg-accent-soft text-accent-fg",
  success: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
  warning: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  danger: "bg-red-500/12 text-red-700 dark:text-red-300",
};

export default function Badge({
  variant = "neutral",
  icon: Icon,
  className,
  children,
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
        VARIANTS[variant],
        className,
      )}
    >
      {Icon && <Icon className="size-3" aria-hidden="true" />}
      {children}
    </span>
  );
}

// Red unread counter, capped at "9+"
export function CountBadge({ count, className }) {
  if (!count) return null;
  return (
    <span
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white",
        className,
      )}
      aria-label={`${count} unread`}
    >
      {count > 9 ? "9+" : count}
    </span>
  );
}
