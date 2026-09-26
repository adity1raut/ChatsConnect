import { useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { dismissToast, getToasts, subscribeToasts } from "../../lib/toast";
import { cn } from "../../lib/utils";
import { UserAvatar } from "./avatar";

function ToastItem({ toast }) {
  const { id, title, description, avatar, icon: Icon, onClick, variant, duration } = toast;
  const isError = variant === "error";

  useEffect(() => {
    if (!duration) return;
    const timer = setTimeout(() => dismissToast(id), duration);
    return () => clearTimeout(timer);
  }, [id, duration]);

  const clickable = typeof onClick === "function";
  const Body = clickable ? "button" : "div";

  return (
    <div
      role={isError ? "alert" : "status"}
      className={cn(
        "pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden border bg-popover p-3 pr-2 shadow-float animate-fade-in-right",
        isError ? "border-destructive/50" : "border-border-strong",
      )}
    >
      <span aria-hidden="true" className={cn("absolute inset-y-0 left-0 w-0.5", isError ? "bg-destructive" : "bg-primary")} />
      <Body
        {...(clickable
          ? {
              type: "button",
              onClick: () => {
                onClick();
                dismissToast(id);
              },
            }
          : {})}
        className="flex min-w-0 flex-1 items-start gap-3 text-left"
      >
        {avatar ? (
          <UserAvatar src={avatar.src} name={avatar.name} size="sm" />
        ) : Icon ? (
          <span
            className={cn(
              "flex size-8 shrink-0 items-center justify-center border",
              isError ? "border-destructive/40 text-destructive" : "border-primary/40 bg-primary/10 text-primary",
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
          </span>
        ) : null}
        <span className="min-w-0 flex-1">
          <span className="block truncate text-xs font-bold text-foreground">{title}</span>
          {description && <span className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">{description}</span>}
        </span>
      </Body>
      <button
        type="button"
        onClick={() => dismissToast(id)}
        aria-label="Dismiss"
        className="flex size-7 shrink-0 items-center justify-center text-faint transition-colors hover:bg-accent hover:text-foreground"
      >
        <X className="size-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}

// Render once near the app root
export function Toaster() {
  const toasts = useSyncExternalStore(subscribeToasts, getToasts);
  if (!toasts.length) return null;

  return createPortal(
    <div
      aria-live="polite"
      className="pointer-events-none fixed top-4 right-4 left-4 z-150 flex flex-col items-end gap-2 sm:top-6 sm:left-auto sm:w-96"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>,
    document.body,
  );
}
