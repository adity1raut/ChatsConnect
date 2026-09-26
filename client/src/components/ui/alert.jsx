import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

export const alertVariants = cva(
  "relative grid w-full grid-cols-[0_1fr] items-start gap-y-1 border px-4 py-3 text-xs has-[>svg]:grid-cols-[1rem_1fr] has-[>svg]:gap-x-3 [&>svg]:size-4 [&>svg]:translate-y-px [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "border-border bg-card text-card-foreground",
        destructive: "border-destructive/45 bg-destructive/[0.06] text-destructive",
        success: "border-success/45 bg-success/[0.06] text-success",
        warning: "border-warning/45 bg-warning/[0.06] text-warning",
        info: "border-info/45 bg-info/[0.06] text-info",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

// Bordered notice box: title in the variant colour, body in muted text
export function Alert({ className, variant, ...props }) {
  return <div data-slot="alert" role="alert" className={cn(alertVariants({ variant }), className)} {...props} />;
}

export function AlertTitle({ className, ...props }) {
  return <div data-slot="alert-title" className={cn("col-start-2 font-bold", className)} {...props} />;
}

export function AlertDescription({ className, ...props }) {
  return (
    <div
      data-slot="alert-description"
      className={cn("col-start-2 leading-relaxed text-muted-foreground [&_p]:leading-relaxed", className)}
      {...props}
    />
  );
}
