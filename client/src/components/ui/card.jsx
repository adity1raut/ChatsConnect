import { Slot } from "radix-ui";
import { cn } from "../../lib/utils";

// Bordered square panel. Pad it directly (className="p-5") or compose the parts below.
export function Card({ className, asChild = false, interactive = false, ...props }) {
  const Comp = asChild ? Slot.Root : "div";
  return (
    <Comp
      data-slot="card"
      className={cn(
        "relative border border-border bg-card text-card-foreground",
        interactive && "transition-[border-color,background-color] hover:border-primary/40 hover:bg-accent/40",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-5 pt-5 has-data-[slot=card-action]:grid-cols-[1fr_auto]",
        className,
      )}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }) {
  return <div data-slot="card-title" className={cn("eyebrow text-primary", className)} {...props} />;
}

export function CardDescription({ className, ...props }) {
  return <div data-slot="card-description" className={cn("text-xs leading-relaxed text-muted-foreground", className)} {...props} />;
}

export function CardAction({ className, ...props }) {
  return (
    <div
      data-slot="card-action"
      className={cn("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className)}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }) {
  return <div data-slot="card-content" className={cn("px-5 py-5", className)} {...props} />;
}

export function CardFooter({ className, ...props }) {
  return <div data-slot="card-footer" className={cn("flex items-center border-t border-border px-5 py-4", className)} {...props} />;
}
