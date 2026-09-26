import { cn } from "../../lib/utils";

/**
 * Decorative pieces of the terminal look: corner brackets, section
 * eyebrows ("001 / TITLE ———"), status dots and the signal meter.
 */

// Bracket ticks in two opposite corners of a `relative` parent
export function Corners({ size = "size-3", className }) {
  const tick = cn("pointer-events-none absolute border-primary/70", size);
  return (
    <span aria-hidden="true" className={className}>
      <span className={cn(tick, "-top-px -left-px border-t border-l")} />
      <span className={cn(tick, "-right-px -bottom-px border-r border-b")} />
    </span>
  );
}

// Small uppercase label, optionally numbered and followed by a rule
export function Eyebrow({ index, rule = false, className, children }) {
  return (
    <div className={cn("flex items-center gap-3 text-primary", className)}>
      {rule && <span aria-hidden="true" className="h-px w-8 bg-primary/60" />}
      <p className="eyebrow">
        {index && <span className="text-faint">{index} / </span>}
        {children}
      </p>
      {rule && <span aria-hidden="true" className="h-px flex-1 bg-border" />}
    </div>
  );
}

// Glowing square status light
export function StatusDot({ tone = "success", pulse = false, className }) {
  const tones = {
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-destructive",
    idle: "bg-faint",
  };
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block size-1.5 shrink-0 shadow-[0_0_6px_currentColor]",
        tones[tone],
        pulse && "animate-pulse",
        className,
      )}
    />
  );
}

// Animated bar meter from the reference's status bar
export function SignalBars({ active = true, className }) {
  const heights = ["h-1.5", "h-3", "h-2", "h-3.5", "h-2.5", "h-4", "h-2", "h-3"];
  return (
    <span aria-hidden="true" className={cn("inline-flex h-4 items-end gap-[3px]", className)}>
      {heights.map((h, i) => (
        <span
          key={i}
          className={cn("w-[3px] origin-bottom", h, active ? "bg-primary/70 animate-scan" : "bg-faint/50")}
          style={active ? { animationDelay: `${i * 0.13}s` } : undefined}
        />
      ))}
    </span>
  );
}

// Page title block: eyebrow, big uppercase heading, optional description and actions
export function PageHeader({ eyebrow, title, description, actions, className }) {
  return (
    <header className={cn("flex flex-wrap items-end justify-between gap-4", className)}>
      <div className="min-w-0 border-l border-dashed border-border-strong pl-4">
        {eyebrow && <p className="eyebrow mb-2 text-faint">{eyebrow}</p>}
        <h1 className="text-2xl font-extrabold tracking-[0.06em] text-foreground uppercase sm:text-3xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-xs leading-relaxed text-muted-foreground sm:text-sm">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}
