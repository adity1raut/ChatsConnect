import { cn } from "../../lib/utils";
import { Corners } from "./hud";

export function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn("flex flex-col items-center justify-center px-6 py-12 text-center", className)}>
      {Icon && (
        <div className="relative mb-5 flex size-14 items-center justify-center border border-border bg-card text-primary">
          <Corners size="size-2" />
          <Icon className="size-6" aria-hidden="true" />
        </div>
      )}
      <h3 className="text-xs font-bold tracking-[0.16em] text-foreground uppercase">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-xs leading-relaxed text-muted-foreground">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
