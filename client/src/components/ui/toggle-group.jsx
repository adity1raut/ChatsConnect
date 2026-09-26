import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui";
import { cn } from "../../lib/utils";

export function ToggleGroup({ className, ...props }) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      className={cn("inline-flex w-fit items-stretch border border-border bg-card", className)}
      {...props}
    />
  );
}

export function ToggleGroupItem({ className, ...props }) {
  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      className={cn(
        "inline-flex items-center justify-center gap-1.5 border-r border-border px-3 text-[10px] font-bold tracking-[0.12em] whitespace-nowrap text-muted-foreground uppercase transition-colors last:border-r-0",
        "hover:bg-accent hover:text-foreground data-[state=on]:bg-primary/12 data-[state=on]:text-primary data-[state=on]:shadow-[inset_0_-2px_0_var(--primary)]",
        "disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-3.5 [&_svg]:shrink-0",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Single-choice segmented control (Light / Dark / System) on a Radix
 * ToggleGroup. Clicking the selected option keeps it selected.
 */
export function SegmentedControl({ options, value, onChange, label, size = "md", className }) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(next) => next && onChange(next)}
      aria-label={label}
      className={cn(size === "sm" ? "h-8" : "h-9", className)}
    >
      {options.map(({ value: optValue, label: optLabel, icon: Icon }) => (
        <ToggleGroupItem
          key={optValue}
          value={optValue}
          aria-label={optLabel}
          title={Icon && size === "sm" ? optLabel : undefined}
          className={size === "sm" && Icon ? "px-2.5" : undefined}
        >
          {Icon && <Icon aria-hidden="true" />}
          {(size !== "sm" || !Icon) && optLabel}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
