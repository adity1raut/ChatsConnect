import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "../../lib/utils";
import { Input } from "./input";
import { Label } from "./label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { Textarea } from "./textarea";

// Label + control + hint/error, with ids wired for screen readers
function Field({ id, label, hint, error, className, children }) {
  return (
    <div data-slot="field" className={cn("space-y-2", className)}>
      {label && <Label htmlFor={id}>{label}</Label>}
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-faint">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

const describedBy = (id, error, hint) => (error ? `${id}-error` : hint ? `${id}-hint` : undefined);

export function InputField({
  label,
  hint,
  error,
  icon: Icon,
  trailing,
  className,
  wrapperClassName,
  id: idProp,
  ...props
}) {
  const autoId = useId();
  const id = idProp || autoId;
  return (
    <Field id={id} label={label} hint={hint} error={error} className={wrapperClassName}>
      <div className="relative">
        {Icon && (
          <Icon
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-faint"
            aria-hidden="true"
          />
        )}
        <Input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, error, hint)}
          className={cn("h-11", Icon && "pl-9", trailing && "pr-11", className)}
          {...props}
        />
        {trailing && <div className="absolute top-1/2 right-1.5 -translate-y-1/2">{trailing}</div>}
      </div>
    </Field>
  );
}

export function PasswordField(props) {
  const [visible, setVisible] = useState(false);
  const Icon = visible ? EyeOff : Eye;
  return (
    <InputField
      type={visible ? "text" : "password"}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="flex size-8 items-center justify-center text-faint transition-colors hover:bg-accent hover:text-foreground"
        >
          <Icon className="size-4" aria-hidden="true" />
        </button>
      }
      {...props}
    />
  );
}

export function TextareaField({ label, hint, error, className, wrapperClassName, id: idProp, ...props }) {
  const autoId = useId();
  const id = idProp || autoId;
  return (
    <Field id={id} label={label} hint={hint} error={error} className={wrapperClassName}>
      <Textarea
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        className={className}
        {...props}
      />
    </Field>
  );
}

// options: ["en", …] or [{ value, label }, …]; onValueChange receives the value
export function SelectField({
  label,
  hint,
  error,
  options,
  value,
  onValueChange,
  placeholder,
  disabled,
  className,
  wrapperClassName,
  id: idProp,
}) {
  const autoId = useId();
  const id = idProp || autoId;
  return (
    <Field id={id} label={label} hint={hint} error={error} className={wrapperClassName}>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, error, hint)}
          className={cn("h-11", className)}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => {
            const { value: optValue, label: optLabel } =
              typeof opt === "string" ? { value: opt, label: opt } : opt;
            return (
              <SelectItem key={optValue} value={optValue}>
                {optLabel}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </Field>
  );
}
