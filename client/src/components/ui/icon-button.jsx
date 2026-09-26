import { Button } from "./button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";
import { cn } from "../../lib/utils";

const SIZES = { sm: "icon-sm", md: "icon", lg: "icon-lg" };

/**
 * Square icon-only button. `label` is required: it is the accessible name and
 * the tooltip text. Props from a wrapping Radix trigger (asChild) pass through.
 */
export function IconButton({
  icon: Icon,
  label,
  variant = "ghost",
  size = "md",
  active = false,
  badge,
  tooltip = true,
  className,
  ...props
}) {
  const button = (
    <Button
      variant={variant}
      size={SIZES[size]}
      aria-label={label}
      className={cn(
        "relative tracking-normal",
        active && "border-primary/50 bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary",
        className,
      )}
      {...props}
    >
      <Icon aria-hidden="true" className={size === "lg" ? "size-5" : size === "sm" ? "size-4" : "size-[18px]"} />
      {badge ? (
        <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center bg-destructive px-1 text-[9px] font-bold text-white ring-2 ring-background">
          {badge}
        </span>
      ) : null}
    </Button>
  );

  if (!tooltip) return button;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
