import { cn } from "../../lib/cn";

// Underlined tab bar; pair each tab with a panel rendered by the caller
export default function Tabs({ tabs, value, onChange, label, className }) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn("flex gap-1 overflow-x-auto border-b border-line scrollbar-none", className)}
    >
      {tabs.map(({ value: tabValue, label: tabLabel, icon: Icon }) => {
        const selected = tabValue === value;
        return (
          <button
            key={tabValue}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(tabValue)}
            className={cn(
              "relative -mb-px inline-flex shrink-0 items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-semibold transition-colors",
              selected
                ? "border-accent text-fg"
                : "border-transparent text-muted hover:text-fg",
            )}
          >
            {Icon && <Icon className="size-4" aria-hidden="true" />}
            {tabLabel}
          </button>
        );
      })}
    </div>
  );
}
