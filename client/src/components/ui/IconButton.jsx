import { cn } from "../../lib/cn";

const VARIANTS = {
  ghost: "text-muted hover:text-fg hover:bg-surface-2",
  soft: "bg-surface-2 text-fg hover:bg-accent-soft hover:text-accent-fg",
  primary: "bg-accent text-white hover:bg-accent-hover",
  danger: "text-red-500 hover:bg-red-500/10",
};

const SIZES = {
  sm: { button: "size-8 rounded-lg", icon: "size-4" },
  md: { button: "size-10 rounded-xl", icon: "size-[18px]" },
  lg: { button: "size-11 rounded-xl", icon: "size-5" },
};

// Square icon-only button; `label` is required for screen readers and tooltips
export default function IconButton({
  icon: Icon,
  label,
  variant = "ghost",
  size = "md",
  active = false,
  badge,
  className,
  type = "button",
  ref,
  ...props
}) {
  const s = SIZES[size];
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center transition-colors duration-150 disabled:opacity-50",
        s.button,
        active ? "bg-accent-soft text-accent-fg" : VARIANTS[variant],
        className,
      )}
      {...props}
    >
      <Icon className={s.icon} aria-hidden="true" />
      {badge ? (
        <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white ring-2 ring-surface">
          {badge}
        </span>
      ) : null}
    </button>
  );
}
