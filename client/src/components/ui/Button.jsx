import { Loader2 } from "lucide-react";
import { cn } from "../../lib/cn";

const VARIANTS = {
  primary: "bg-accent text-white hover:bg-accent-hover shadow-sm shadow-accent/25",
  gradient:
    "text-white bg-linear-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 shadow-md shadow-violet-500/25",
  secondary:
    "bg-surface-2 text-fg border border-line hover:border-line-strong hover:bg-surface",
  ghost: "text-muted hover:text-fg hover:bg-surface-2",
  danger: "bg-red-600 text-white hover:bg-red-500 shadow-sm shadow-red-600/25",
  "danger-soft":
    "text-red-600 dark:text-red-400 bg-red-500/10 hover:bg-red-500/15",
};

const SIZES = {
  sm: "h-8 px-3 text-xs gap-1.5 rounded-lg",
  md: "h-10 px-4 text-sm gap-2 rounded-xl",
  lg: "h-12 px-5 text-sm gap-2 rounded-xl",
};

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon: Icon,
  iconRight: IconRight,
  fullWidth = false,
  type = "button",
  disabled,
  className,
  children,
  ref,
  ...props
}) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex items-center justify-center font-semibold whitespace-nowrap select-none",
        "transition-[background-color,border-color,color,box-shadow,transform] duration-150",
        "active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100",
        VARIANTS[variant],
        SIZES[size],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        Icon && <Icon className="size-4 shrink-0" aria-hidden="true" />
      )}
      {children}
      {IconRight && !loading && (
        <IconRight className="size-4 shrink-0" aria-hidden="true" />
      )}
    </button>
  );
}
