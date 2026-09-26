import { useEffect, useId, useRef, useState } from "react";
import { cn } from "../../lib/cn";

/**
 * Dropdown menu. `trigger` receives the props to spread on its button;
 * items: { label, icon, onSelect, danger } or { divider: true }.
 */
export default function Menu({ trigger, items, align = "right", className }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      {trigger({
        "aria-haspopup": "menu",
        "aria-expanded": open,
        "aria-controls": open ? menuId : undefined,
        onClick: () => setOpen((v) => !v),
      })}
      {open && (
        <div
          id={menuId}
          role="menu"
          className={cn(
            "absolute top-full z-50 mt-1.5 min-w-48 rounded-xl border border-line bg-elevated p-1 shadow-2xl animate-scale-in",
            align === "right" ? "right-0" : "left-0",
          )}
        >
          {items.filter(Boolean).map((item, i) =>
            item.divider ? (
              <div key={`d${i}`} className="my-1 h-px bg-line" />
            ) : (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  item.onSelect();
                }}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors",
                  item.danger
                    ? "text-red-600 hover:bg-red-500/10 dark:text-red-400"
                    : "text-fg hover:bg-surface-2",
                )}
              >
                {item.icon && <item.icon className="size-4 shrink-0 opacity-70" aria-hidden="true" />}
                {item.label}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
}
