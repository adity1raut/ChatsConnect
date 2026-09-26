import { Sparkles } from "lucide-react";
import { cn } from "../../lib/utils";

export default function Brand({ subtitle, className }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-violet-600 via-purple-500 to-pink-500 shadow-lg shadow-violet-500/25">
        <Sparkles className="size-4 text-white" strokeWidth={2.5} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="bg-linear-to-r from-violet-600 to-purple-500 bg-clip-text text-lg font-extrabold tracking-tight text-transparent dark:from-violet-400 dark:to-fuchsia-400">
          ChatsConnect
        </p>
        {subtitle && <p className="-mt-0.5 text-[11px] font-medium text-faint">{subtitle}</p>}
      </div>
    </div>
  );
}
