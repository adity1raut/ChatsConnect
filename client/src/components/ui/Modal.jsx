import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "../../lib/cn";
import IconButton from "./IconButton";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const SIZES = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-2xl",
};

// Keep Tab / Shift+Tab inside the dialog
function trapFocus(event, container) {
  const nodes = container?.querySelectorAll(FOCUSABLE);
  if (!nodes?.length) return;
  const first = nodes[0];
  const last = nodes[nodes.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

/**
 * Accessible dialog: portal, backdrop click / Escape to close, focus trap,
 * body scroll lock and focus restore. Renders as a bottom sheet on phones.
 */
export default function Modal({
  open,
  onClose,
  title,
  description,
  footer,
  size = "md",
  className,
  bodyClassName,
  children,
}) {
  const panelRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const titleId = useId();
  const descriptionId = useId();

  // Latest onClose without re-running the open/close effect on every render
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event) => {
      if (event.key === "Escape") onCloseRef.current?.();
      else if (event.key === "Tab") trapFocus(event, panelRef.current);
    };
    document.addEventListener("keydown", onKeyDown);

    const frame = requestAnimationFrame(() => {
      const panel = panelRef.current;
      const target =
        panel?.querySelector("[data-autofocus]") ||
        panel?.querySelector(FOCUSABLE) ||
        panel;
      target?.focus();
    });

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4">
      <div
        className="absolute inset-0 bg-overlay backdrop-blur-sm animate-fade-in"
        onClick={() => onCloseRef.current?.()}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn(
          "relative flex max-h-[92dvh] w-full flex-col border border-line bg-elevated text-fg shadow-2xl outline-none",
          "rounded-t-3xl animate-slide-up sm:rounded-2xl sm:animate-scale-in",
          SIZES[size],
          className,
        )}
      >
        {title && (
          <header className="flex items-start justify-between gap-4 px-5 pt-5 pb-3 sm:px-6">
            <div className="min-w-0">
              <h2 id={titleId} className="text-lg font-bold tracking-tight">
                {title}
              </h2>
              {description && (
                <p id={descriptionId} className="mt-0.5 text-sm text-muted">
                  {description}
                </p>
              )}
            </div>
            <IconButton
              icon={X}
              label="Close"
              size="sm"
              onClick={() => onCloseRef.current?.()}
            />
          </header>
        )}
        <div
          className={cn(
            "flex-1 overflow-y-auto scrollbar-thin px-5 pb-5 sm:px-6",
            !title && "pt-5",
            bodyClassName,
          )}
        >
          {children}
        </div>
        {footer && (
          <footer className="flex flex-wrap justify-end gap-2 border-t border-line px-5 py-4 sm:px-6">
            {footer}
          </footer>
        )}
      </div>
    </div>,
    document.body,
  );
}
