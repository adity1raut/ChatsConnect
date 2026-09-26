import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Join class names and let later Tailwind classes win: cn("px-2", cond && "px-4")
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
