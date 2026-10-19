import { useId } from "react";

const control =
  "w-full rounded-2xl border border-linea bg-white px-4 h-11 text-sm text-tinta placeholder:text-tenue focus:border-acento-tinta focus:outline-none focus:ring-1 focus:ring-acento-tinta";

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
      <label htmlFor={id} className="text-sm font-semibold text-tinta">
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
}: CampoProps & React.ComponentProps<"input">) {
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
}: CampoProps & React.ComponentProps<"select">) {
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
}: CampoProps & React.ComponentProps<"textarea">) {
  const id = useId();
  return (
    <Campo id={id} label={label} opcional={opcional}>
      <textarea id={id} className={`${control} h-auto min-h-24 py-2`} {...area} />
    </Campo>
  );
}
