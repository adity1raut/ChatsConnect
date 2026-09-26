import { cn } from "../../lib/utils";

// Placeholder block shown while content loads
export function Skeleton({ className, ...props }) {
  return <div data-slot="skeleton" className={cn("animate-pulse bg-muted", className)} {...props} />;
}
