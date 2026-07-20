import { type InputHTMLAttributes, type SelectHTMLAttributes } from "react";
import { clsx } from "clsx";

type BaseProps = { label: string; id: string; error?: string; hint?: string; required?: boolean };
type InputProps = BaseProps & InputHTMLAttributes<HTMLInputElement> & { as?: "input" };
type SelectProps = BaseProps & SelectHTMLAttributes<HTMLSelectElement> & { as: "select"; children: React.ReactNode };
type TextareaProps = BaseProps & InputHTMLAttributes<HTMLTextAreaElement> & { as: "textarea"; rows?: number };
type FormFieldProps = InputProps | SelectProps | TextareaProps;

export default function FormField(props: FormFieldProps) {
  const { label, id, error, hint, required, as = "input", ...rest } = props;
  const baseClass = clsx(
    "w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400",
    "focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent",
    "disabled:bg-gray-50 disabled:text-gray-500",
    error ? "border-red-400 bg-red-50" : "border-gray-300 bg-white hover:border-gray-400"
  );
  const describedBy = [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(" ") || undefined;

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}{required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
      </label>
      {hint && <p id={`${id}-hint`} className="text-xs text-gray-500">{hint}</p>}
      {as === "select" ? (
        <select id={id} className={baseClass} aria-describedby={describedBy} aria-invalid={error ? "true" : undefined} required={required} {...(rest as SelectHTMLAttributes<HTMLSelectElement>)}>
          {(props as SelectProps).children}
        </select>
      ) : as === "textarea" ? (
        <textarea id={id} className={baseClass} rows={(props as TextareaProps).rows ?? 4} aria-describedby={describedBy} aria-invalid={error ? "true" : undefined} required={required} {...(rest as InputHTMLAttributes<HTMLTextAreaElement>)} />
      ) : (
        <input id={id} className={baseClass} aria-describedby={describedBy} aria-invalid={error ? "true" : undefined} required={required} {...(rest as InputHTMLAttributes<HTMLInputElement>)} />
      )}
      {error && <p id={`${id}-error`} className="text-xs text-red-600" role="alert">{error}</p>}
    </div>
  );
}
