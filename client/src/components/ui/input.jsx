import { cn } from "../../lib/utils";

export const controlClass =
  "w-full min-w-0 border border-input bg-background text-sm text-foreground transition-[border-color,box-shadow] outline-none " +
  "placeholder:text-faint hover:border-border-strong focus-visible:border-primary focus-visible:shadow-[0_0_0_1px_var(--primary)] " +
  "aria-invalid:border-destructive aria-invalid:focus-visible:shadow-[0_0_0_1px_var(--destructive)] " +
  "disabled:cursor-not-allowed disabled:opacity-50";

export function Input({ className, type, ...props }) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        controlClass,
        "h-10 px-3 file:border-0 file:bg-transparent file:text-xs file:font-bold file:text-foreground",
        className,
      )}
      {...props}
    />
  );
}
