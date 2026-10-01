import { useId } from "react";

const control =
  "w-full rounded-lg border border-gray-300 bg-white px-3 h-10 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900";

interface CampoProps {
  label: string;
  opcional?: boolean;
}

function Campo({
  id,
  label,
  opcional,
  children,
}: CampoProps & { id: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-gray-900">
        {label}
        {opcional && <span className="font-normal text-gray-400"> (opcional)</span>}
      </label>
      {children}
    </div>
  );
}

export function TextField({
  label,
  opcional,
  ...input
}: CampoProps & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <Campo id={id} label={label} opcional={opcional}>
      <input id={id} className={control} {...input} />
    </Campo>
  );
}

export function SelectField({
  label,
  opcional,
  children,
  ...select
}: CampoProps & React.SelectHTMLAttributes<HTMLSelectElement>) {
  const id = useId();
  return (
    <Campo id={id} label={label} opcional={opcional}>
      <select id={id} className={control} {...select}>
        {children}
      </select>
    </Campo>
  );
}

export function TextAreaField({
  label,
  opcional,
  ...area
}: CampoProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId();
  return (
    <Campo id={id} label={label} opcional={opcional}>
      <textarea id={id} className={`${control} h-auto min-h-24 py-2`} {...area} />
    </Campo>
  );
}
