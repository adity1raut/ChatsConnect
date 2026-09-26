import { cn } from "../../lib/cn";

// Surface container: rounded, bordered, themed
export default function Card({
  as: Tag = "div",
  padded = true,
  interactive = false,
  className,
  ...props
}) {
  return (
    <Tag
      className={cn(
        "rounded-2xl border border-line bg-surface shadow-sm",
        padded && "p-5",
        interactive &&
          "transition-[border-color,box-shadow] hover:border-line-strong hover:shadow-md",
        className,
      )}
      {...props}
    />
  );
}
