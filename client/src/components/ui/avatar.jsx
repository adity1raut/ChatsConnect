import { Avatar as AvatarPrimitive } from "radix-ui";
import { cn } from "../../lib/utils";

export function Avatar({ className, ...props }) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn("relative flex size-10 shrink-0 overflow-hidden border border-border", className)}
      {...props}
    />
  );
}

export function AvatarImage({ className, ...props }) {
  return <AvatarPrimitive.Image data-slot="avatar-image" className={cn("size-full object-cover", className)} {...props} />;
}

export function AvatarFallback({ className, ...props }) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn("flex size-full items-center justify-center bg-muted font-bold select-none", className)}
      {...props}
    />
  );
}

const SIZES = {
  xs: { box: "size-6 text-[9px]", dot: "size-1.5" },
  sm: { box: "size-8 text-[11px]", dot: "size-2" },
  md: { box: "size-10 text-xs", dot: "size-2.5" },
  lg: { box: "size-14 text-base", dot: "size-3" },
  xl: { box: "size-20 text-xl", dot: "size-3.5" },
  "2xl": { box: "size-28 text-3xl", dot: "size-4" },
};

// Same name → same tint, so people are recognisable across the app
const TINTS = [
  "bg-primary/12 text-primary",
  "bg-info/12 text-info",
  "bg-warning/12 text-warning",
  "bg-destructive/12 text-destructive",
  "bg-foreground/8 text-foreground",
];
const tintFor = (seed = "") =>
  TINTS[[...seed].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % TINTS.length];

const initialsOf = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase() || "?";

const isImageSrc = (src) => typeof src === "string" && /^(https?:|data:image\/|blob:)/.test(src);

// A person or group: photo when there is one, initials otherwise, optional online dot
export function UserAvatar({ src, name = "", size = "md", online, className }) {
  const s = SIZES[size] ?? SIZES.md;
  return (
    <span className={cn("relative inline-flex shrink-0", className)}>
      <Avatar className={s.box}>
        {isImageSrc(src) && <AvatarImage src={src} alt={name} loading="lazy" />}
        <AvatarFallback role="img" aria-label={name || "User"} className={tintFor(name)}>
          {initialsOf(name)}
        </AvatarFallback>
      </Avatar>
      {online && (
        <span
          className={cn(s.dot, "absolute -right-0.5 -bottom-0.5 bg-success shadow-[0_0_6px_var(--glow)] ring-2 ring-background")}
          aria-label="Online"
        />
      )}
    </span>
  );
}
