import { Switch as SwitchPrimitive } from "radix-ui";
import { cn } from "../../lib/utils";

// Square on/off switch
export function Switch({ className, ...props }) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-5.5 w-10 shrink-0 items-center border p-0.5 transition-colors outline-none",
        "border-border-strong bg-muted data-[state=checked]:border-primary/60 data-[state=checked]:bg-primary/15",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block size-4 bg-faint transition-[translate,background-color] duration-150",
          "data-[state=checked]:translate-x-[1.125rem] data-[state=checked]:bg-primary data-[state=checked]:shadow-[0_0_8px_var(--glow)]",
        )}
      />
    </SwitchPrimitive.Root>
  );
}
