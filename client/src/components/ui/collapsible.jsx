import { Collapsible as CollapsiblePrimitive } from "radix-ui";
import { cn } from "../../lib/utils";

export function Collapsible(props) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />;
}

export function CollapsibleTrigger(props) {
  return <CollapsiblePrimitive.Trigger data-slot="collapsible-trigger" {...props} />;
}

export function CollapsibleContent({ className, ...props }) {
  return (
    <CollapsiblePrimitive.Content
      data-slot="collapsible-content"
      className={cn(
        "overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down",
        className,
      )}
      {...props}
    />
  );
}
