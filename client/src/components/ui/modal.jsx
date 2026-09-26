import { VisuallyHidden } from "radix-ui";
import { cn } from "../../lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";

const SIZES = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-2xl",
};

// Focus [data-autofocus] when the dialog opens, else Radix's first focusable
const focusPreferred = (event) => {
  const preferred = event.currentTarget?.querySelector?.("[data-autofocus]");
  if (preferred) {
    event.preventDefault();
    preferred.focus();
  }
};

/**
 * Controlled dialog with the usual layout: title bar, scrolling body, footer.
 * Built from the shadcn Dialog parts — compose those directly for anything else.
 */
export function Modal({
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
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose?.()}>
      <DialogContent
        className={cn(SIZES[size], className)}
        onOpenAutoFocus={focusPreferred}
        {...(description ? {} : { "aria-describedby": undefined })}
      >
        {title ? (
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
        ) : (
          <VisuallyHidden.Root asChild>
            <DialogTitle>Dialog</DialogTitle>
          </VisuallyHidden.Root>
        )}
        <div className={cn("flex-1 overflow-y-auto px-5 py-5 scrollbar-thin sm:px-6", bodyClassName)}>
          {children}
        </div>
        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
}
