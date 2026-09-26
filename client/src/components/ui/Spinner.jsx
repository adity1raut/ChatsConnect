import { Loader2 } from "lucide-react";
import { cn } from "../../lib/cn";

export default function Spinner({ label = "Loading", className }) {
  return (
    <span role="status" className="inline-flex items-center">
      <Loader2
        className={cn("size-5 animate-spin text-accent", className)}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}
