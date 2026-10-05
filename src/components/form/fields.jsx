"use client";

import { useState } from "react";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// Form fields with a visible label, an optional hint and an error message.
// Each input's id is also its name, so the form's values match the schema.

function Field({ id, label, hint, error, children, className }) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      {children}
      <FieldMessages id={id} hint={hint} error={error} />
    </div>
  );
}

function FieldMessages({ id, hint, error }) {
  return (
    <>
      {hint && (
        <p id={`${id}-hint`} className="text-sm text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="flex items-center gap-1.5 text-sm font-medium text-destructive">
          <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </>
  );
}

/** Props that link an input to its hint and error, so screen readers read them out. */
function describedBy(id, hint, error) {
  const ids = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean);
  return {
    "aria-invalid": error ? true : undefined,
    "aria-describedby": ids.length ? ids.join(" ") : undefined,
  };
}

const controlClass =
  "w-full rounded-lg border border-input bg-card px-3 text-base outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 disabled:opacity-50";

export function TextField({ id, label, hint, error, className, ...inputProps }) {
  return (
    <Field id={id} label={label} hint={hint} error={error} className={className}>
      <input id={id} name={id} className={cn(controlClass, "h-11")} {...describedBy(id, hint, error)} {...inputProps} />
    </Field>
  );
}

export function PasswordField({ id, label, hint, error, className, ...inputProps }) {
  const [visible, setVisible] = useState(false);

  return (
    <Field id={id} label={label} hint={hint} error={error} className={className}>
      <div className="relative">
        <input
          id={id}
          name={id}
          type={visible ? "text" : "password"}
          className={cn(controlClass, "h-11 pr-12")}
          {...describedBy(id, hint, error)}
          {...inputProps}
        />
        <button
          type="button"
          onClick={() => setVisible((shown) => !shown)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {visible ? <EyeOff className="size-5" aria-hidden="true" /> : <Eye className="size-5" aria-hidden="true" />}
        </button>
      </div>
    </Field>
  );
}

export function TextAreaField({ id, label, hint, error, className, rows = 4, ...textareaProps }) {
  return (
    <Field id={id} label={label} hint={hint} error={error} className={className}>
      <textarea
        id={id}
        name={id}
        rows={rows}
        className={cn(controlClass, "py-2.5 leading-relaxed")}
        {...describedBy(id, hint, error)}
        {...textareaProps}
      />
    </Field>
  );
}

/** A native drop-down. `options` is a list of { value, label }. */
export function SelectField({ id, label, hint, error, className, options, placeholder, ...selectProps }) {
  return (
    <Field id={id} label={label} hint={hint} error={error} className={className}>
      <select id={id} name={id} className={cn(controlClass, "h-11 cursor-pointer")} {...describedBy(id, hint, error)} {...selectProps}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

/** One tick box with its label beside it. */
export function CheckboxField({ id, label, hint, error, className, ...inputProps }) {
  return (
    <div className={cn("space-y-1", className)}>
      <label htmlFor={id} className="flex cursor-pointer items-start gap-3">
        <input
          id={id}
          name={id}
          type="checkbox"
          className="mt-0.5 size-5 shrink-0 cursor-pointer accent-primary"
          {...describedBy(id, hint, error)}
          {...inputProps}
        />
        <span className="text-sm font-medium">{label}</span>
      </label>
      <div className="pl-8">
        <FieldMessages id={id} hint={hint} error={error} />
      </div>
    </div>
  );
}

/** Several tick boxes that share one name, such as the emirates a mentor knows. */
export function CheckboxGroup({ id, label, hint, error, className, options, defaultValues = [] }) {
  return (
    <fieldset className={cn("space-y-2", className)} {...describedBy(id, hint, error)}>
      <legend className="text-sm font-medium">{label}</legend>
      <div className="grid gap-x-6 sm:grid-cols-2">
        {options.map((option) => (
          <label key={option.value} className="flex min-h-11 cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              name={id}
              value={option.value}
              defaultChecked={defaultValues.includes(option.value)}
              className="size-5 shrink-0 cursor-pointer accent-primary"
            />
            <span className="text-sm">{option.label}</span>
          </label>
        ))}
      </div>
      <FieldMessages id={id} hint={hint} error={error} />
    </fieldset>
  );
}
