import { useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { dismissToast, getToasts, subscribeToasts } from "../../lib/toast";
import { cn } from "../../lib/cn";
import Avatar from "./Avatar";

function ToastItem({ toast }) {
  const { id, title, description, avatar, icon: Icon, onClick, variant, duration } = toast;

  useEffect(() => {
    if (!duration) return;
    const timer = setTimeout(() => dismissToast(id), duration);
    return () => clearTimeout(timer);
  }, [id, duration]);

  const clickable = typeof onClick === "function";
  const Body = clickable ? "button" : "div";

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={cn(
        "pointer-events-auto flex w-full items-start gap-3 rounded-2xl border bg-elevated p-3 pr-2 shadow-2xl animate-fade-in-right",
        variant === "error" ? "border-red-500/40" : "border-line",
      )}
    >
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
          <Avatar src={avatar.src} name={avatar.name} size="sm" />
        ) : Icon ? (
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-fg">
            <Icon className="size-4" aria-hidden="true" />
          </span>
        ) : null}
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-fg">{title}</span>
          {description && (
            <span className="line-clamp-2 block text-xs text-muted">{description}</span>
          )}
        </span>
      </Body>
      <button
        type="button"
        onClick={() => dismissToast(id)}
        aria-label="Dismiss"
        className="flex size-7 shrink-0 items-center justify-center rounded-lg text-subtle hover:bg-surface-2 hover:text-fg"
      >
        <X className="size-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}

// Render once near the app root
export default function Toaster() {
  const toasts = useSyncExternalStore(subscribeToasts, getToasts);
  if (!toasts.length) return null;

  return createPortal(
    <div
      aria-live="polite"
      className="pointer-events-none fixed top-4 right-4 left-4 z-[150] flex flex-col items-end gap-2 sm:top-20 sm:left-auto sm:w-96"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>,
    document.body,
  );
}
