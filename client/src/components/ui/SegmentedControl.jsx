import { cn } from "../../lib/cn";

// Single-choice pill group, e.g. Light / Dark / System
export default function SegmentedControl({
  options,
  value,
  onChange,
  label,
  size = "md",
  className,
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        "inline-flex items-center gap-1 rounded-xl border border-line bg-surface-2 p-1",
        className,
      )}
    >
      {options.map(({ value: optValue, label: optLabel, icon: Icon }) => {
        const selected = optValue === value;
        return (
          <button
            key={optValue}
            type="button"
            role="radio"
            aria-checked={selected}
            title={optLabel}
            onClick={() => onChange(optValue)}
            className={cn(
              "inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold transition-colors duration-150",
              size === "sm" ? "h-7 px-2 text-xs" : "h-8 px-3 text-sm",
              selected
                ? "bg-surface text-fg shadow-sm"
                : "text-muted hover:text-fg",
            )}
          >
            {Icon && <Icon className="size-3.5" aria-hidden="true" />}
            {size !== "sm" || !Icon ? optLabel : (
              <span className="sr-only">{optLabel}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
