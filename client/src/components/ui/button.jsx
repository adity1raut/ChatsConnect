import { Slot } from "radix-ui";
import { cva } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

export const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 border font-bold whitespace-nowrap uppercase tracking-[0.12em] select-none " +
    "transition-[color,background-color,border-color,box-shadow] duration-150 " +
    "disabled:pointer-events-none disabled:opacity-45 aria-busy:cursor-progress " +
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        // Teal outline with a faint fill — the reference's "OPEN WORKSPACE"
        default:
          "border-primary/55 bg-primary/[0.07] text-primary hover:border-primary hover:bg-primary/15 hover:glow",
        solid:
          "border-primary bg-primary text-primary-foreground hover:bg-primary/90 hover:glow",
        outline:
          "border-border-strong bg-transparent text-foreground hover:border-primary/50 hover:bg-accent",
        secondary:
          "border-border bg-muted text-foreground hover:border-border-strong hover:bg-accent",
        ghost:
          "border-transparent text-muted-foreground hover:border-border hover:bg-accent hover:text-foreground",
        destructive:
          "border-destructive/50 bg-destructive/[0.07] text-destructive hover:border-destructive hover:bg-destructive/15",
        link: "h-auto border-transparent px-0 normal-case tracking-normal text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 px-3 text-[10px]",
        default: "h-10 px-4 text-[11px]",
        lg: "h-12 px-6 text-xs",
        icon: "size-10",
        "icon-sm": "size-8",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

/**
 * shadcn/ui button on a Radix Slot. Extras: `loading` swaps the leading icon
 * for a spinner, `icon` / `iconRight` take a lucide component, `fullWidth`.
 */
export function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  icon: Icon,
  iconRight: IconRight,
  fullWidth = false,
  type,
  disabled,
  children,
  ...props
}) {
  const Comp = asChild ? Slot.Root : "button";
  return (
    <Comp
      data-slot="button"
      type={asChild ? undefined : (type ?? "button")}
      disabled={asChild ? undefined : disabled || loading}
      aria-busy={loading || undefined}
      className={cn(buttonVariants({ variant, size }), fullWidth && "w-full", className)}
      {...props}
    >
      {loading ? (
        <Loader2 className="animate-spin" aria-hidden="true" />
      ) : (
        Icon && <Icon aria-hidden="true" />
      )}
      <Slot.Slottable>{children}</Slot.Slottable>
      {IconRight && !loading && <IconRight aria-hidden="true" />}
    </Comp>
  );
}
