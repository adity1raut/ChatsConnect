import { cn } from "../../lib/utils";
import { controlClass } from "./input";

export function Textarea({ className, ...props }) {
  return <textarea data-slot="textarea" className={cn(controlClass, "min-h-24 resize-y px-3 py-2.5 leading-relaxed", className)} {...props} />;
}
