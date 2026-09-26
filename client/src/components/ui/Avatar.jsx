import { useState } from "react";
import { cn } from "../../lib/cn";

const SIZES = {
  xs: { box: "size-6 text-[10px]", dot: "size-2" },
  sm: { box: "size-8 text-xs", dot: "size-2.5" },
  md: { box: "size-10 text-sm", dot: "size-3" },
  lg: { box: "size-14 text-lg", dot: "size-3.5" },
  xl: { box: "size-20 text-2xl", dot: "size-4" },
  "2xl": { box: "size-28 text-4xl", dot: "size-5" },
};

const GRADIENTS = [
  "from-violet-500 to-fuchsia-500",
  "from-sky-500 to-indigo-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-500",
  "from-cyan-500 to-blue-500",
];

// Same name → same colour, so people are recognisable across the app
const gradientFor = (seed = "") =>
  GRADIENTS[[...seed].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % GRADIENTS.length];

const initialsOf = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase() || "?";

const isImageSrc = (src) =>
  typeof src === "string" && /^(https?:|data:image\/|blob:)/.test(src);

export default function Avatar({
  src,
  name = "",
  size = "md",
  online,
  shape = "circle",
  className,
}) {
  const [failedSrc, setFailedSrc] = useState(null);
  const s = SIZES[size] ?? SIZES.md;
  const rounded = shape === "square" ? "rounded-xl" : "rounded-full";
  const showImage = isImageSrc(src) && failedSrc !== src;

  return (
    <span className={cn("relative inline-flex shrink-0", className)}>
      {showImage ? (
        <img
          src={src}
          alt={name}
          loading="lazy"
          onError={() => setFailedSrc(src)}
          className={cn(s.box, rounded, "object-cover bg-surface-2")}
        />
      ) : (
        <span
          role="img"
          aria-label={name || "User"}
          className={cn(
            s.box,
            rounded,
            "flex items-center justify-center bg-linear-to-br font-bold text-white select-none",
            gradientFor(name),
          )}
        >
          {initialsOf(name)}
        </span>
      )}
      {online && (
        <span
          className={cn(
            s.dot,
            "absolute right-0 bottom-0 rounded-full bg-emerald-500 ring-2 ring-surface",
          )}
          aria-label="Online"
        />
      )}
    </span>
  );
}
