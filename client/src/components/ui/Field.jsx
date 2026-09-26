import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "../../lib/cn";

const CONTROL =
  "w-full rounded-xl border border-line bg-surface text-sm text-fg placeholder:text-subtle outline-none " +
  "transition-[border-color,box-shadow] duration-150 focus:border-accent focus:ring-4 focus:ring-accent/15 " +
  "disabled:cursor-not-allowed disabled:opacity-60";
const INVALID = "border-red-500 focus:border-red-500 focus:ring-red-500/15";

// Label + control + hint/error, with ids wired for accessibility
function FieldShell({ id, label, hint, error, className, children }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold text-muted">
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-red-500">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-subtle">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

const describedBy = (id, error, hint) =>
  error ? `${id}-error` : hint ? `${id}-hint` : undefined;

export function Input({
  label,
  hint,
  error,
  icon: Icon,
  trailing,
  className,
  wrapperClassName,
  id: idProp,
  ref,
  ...props
}) {
  const autoId = useId();
  const id = idProp || autoId;
  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      error={error}
      className={wrapperClassName}
    >
      <div className="relative">
        {Icon && (
          <Icon
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-subtle"
            aria-hidden="true"
          />
        )}
        <input
          ref={ref}
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, error, hint)}
          className={cn(
            CONTROL,
            "h-11",
            Icon ? "pl-10" : "pl-3.5",
            trailing ? "pr-11" : "pr-3.5",
            error && INVALID,
            className,
          )}
          {...props}
        />
        {trailing && (
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
            {trailing}
          </div>
        )}
      </div>
    </FieldShell>
  );
}

export function PasswordInput(props) {
  const [visible, setVisible] = useState(false);
  const Icon = visible ? EyeOff : Eye;
  return (
    <Input
      type={visible ? "text" : "password"}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="flex size-8 items-center justify-center rounded-lg text-subtle hover:bg-surface-2 hover:text-fg"
        >
          <Icon className="size-4" aria-hidden="true" />
        </button>
      }
      {...props}
    />
  );
}

export function Textarea({
  label,
  hint,
  error,
  className,
  wrapperClassName,
  id: idProp,
  ref,
  ...props
}) {
  const autoId = useId();
  const id = idProp || autoId;
  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      error={error}
      className={wrapperClassName}
    >
      <textarea
        ref={ref}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        className={cn(CONTROL, "min-h-24 resize-y px-3.5 py-3", error && INVALID, className)}
        {...props}
      />
    </FieldShell>
  );
}

export function Select({
  label,
  hint,
  error,
  options,
  className,
  wrapperClassName,
  id: idProp,
  ref,
  ...props
}) {
  const autoId = useId();
  const id = idProp || autoId;
  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      error={error}
      className={wrapperClassName}
    >
      <select
        ref={ref}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        className={cn(CONTROL, "h-11 px-3.5", error && INVALID, className)}
        {...props}
      >
        {options.map((opt) => {
          const { value, label: optLabel } =
            typeof opt === "string" ? { value: opt, label: opt } : opt;
          return (
            <option key={value} value={value}>
              {optLabel}
            </option>
          );
        })}
      </select>
    </FieldShell>
  );
}
