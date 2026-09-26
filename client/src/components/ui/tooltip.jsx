import { Tooltip as TooltipPrimitive } from "radix-ui";
import { cn } from "../../lib/utils";

// One provider at the app root shares the open delay between tooltips
export function TooltipProvider({ delayDuration = 300, ...props }) {
  return <TooltipPrimitive.Provider data-slot="tooltip-provider" delayDuration={delayDuration} {...props} />;
}

export function Tooltip(props) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />;
}

export function TooltipTrigger(props) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

export function TooltipContent({ className, sideOffset = 6, children, ...props }) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "z-200 border border-border-strong bg-popover px-2 py-1 text-[10px] font-bold tracking-[0.12em] text-popover-foreground uppercase",
          "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          className,
        )}
        {...props}
      >
        {children}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}
