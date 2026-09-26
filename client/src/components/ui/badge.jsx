import { Slot } from "radix-ui";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

export const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center gap-1 border px-1.5 py-0.5 text-[10px] leading-none font-bold tracking-[0.12em] whitespace-nowrap uppercase [&>svg]:size-3 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "border-primary/40 bg-primary/10 text-primary",
        secondary: "border-border bg-muted text-muted-foreground",
        outline: "border-border-strong text-foreground",
        destructive: "border-destructive/40 bg-destructive/10 text-destructive",
        success: "border-success/40 bg-success/10 text-success",
        warning: "border-warning/40 bg-warning/10 text-warning",
        info: "border-info/40 bg-info/10 text-info",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export function Badge({ className, variant, asChild = false, icon: Icon, children, ...props }) {
  const Comp = asChild ? Slot.Root : "span";
  return (
    <Comp data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props}>
      {Icon && <Icon aria-hidden="true" />}
      <Slot.Slottable>{children}</Slot.Slottable>
    </Comp>
  );
}

// Unread counter, capped at "9+"
export function CountBadge({ count, className }) {
  if (!count) return null;
  return (
    <span
      className={cn(
        "inline-flex h-4.5 min-w-4.5 items-center justify-center bg-destructive px-1 text-[10px] leading-none font-bold text-white tabular-nums",
        className,
      )}
      aria-label={`${count} unread`}
    >
      {count > 9 ? "9+" : count}
    </span>
  );
}
