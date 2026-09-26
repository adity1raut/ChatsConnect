import { Tabs as TabsPrimitive } from "radix-ui";
import { cn } from "../../lib/utils";

export function Tabs({ className, ...props }) {
  return <TabsPrimitive.Root data-slot="tabs" className={cn("flex flex-col gap-5", className)} {...props} />;
}

// Underlined tab strip that scrolls sideways on narrow screens
export function TabsList({ className, ...props }) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn("flex w-full gap-1 overflow-x-auto border-b border-border scrollbar-none", className)}
      {...props}
    />
  );
}

export function TabsTrigger({ className, ...props }) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "relative -mb-px inline-flex shrink-0 items-center gap-2 border-b-2 border-transparent px-3 py-2.5 text-[11px] font-bold tracking-[0.14em] whitespace-nowrap text-muted-foreground uppercase transition-colors",
        "hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-primary disabled:pointer-events-none disabled:opacity-50",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
        className,
      )}
      {...props}
    />
  );
}

export function TabsContent({ className, ...props }) {
  return <TabsPrimitive.Content data-slot="tabs-content" className={cn("outline-none", className)} {...props} />;
}
