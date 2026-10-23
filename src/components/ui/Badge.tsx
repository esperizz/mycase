import { unir } from "./Texto";

export type TonoBadge = "neutral" | "accent" | "info" | "success" | "warning" | "danger" | "special" | "art";

const TONOS: Record<TonoBadge, string> = {
  neutral: "bg-surface-tertiary text-secondary",
  accent: "bg-surface-accent-subtle text-accent",
  info: "bg-surface-info text-info",
  success: "bg-surface-success text-success",
  warning: "bg-surface-warning text-warning",
  danger: "bg-surface-danger text-danger",
  special: "bg-surface-special text-special",
  art: "bg-surface-art text-art",
};

/** Etiqueta chica en píldora: la etapa de un caso, si una carta se envió, si algo es plazo o tarea. */
export function Badge({
  tono = "neutral",
  className,
  children,
}: {
  tono?: TonoBadge;
  /** Solo para ubicarlo (por ejemplo, separarlo del texto que acompaña). */
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={unir(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-caption font-semibold",
        TONOS[tono],
        className,
      )}
    >
      {children}
    </span>
  );
}
