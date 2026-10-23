import Link from "next/link";
import { Rotulo, Texto, unir } from "./Texto";

/** Un dato con su rótulo arriba: "EMPLEADOR / Acme SA". */
export function Dato({ label, valor }: { label: string; valor: string }) {
  return (
    <div>
      <Rotulo>{label}</Rotulo>
      <Texto tono="primary">{valor}</Texto>
    </div>
  );
}

export type TonoIndicador = "neutral" | "accent" | "warning" | "danger";

const TONOS_INDICADOR: Record<TonoIndicador, string> = {
  neutral: "border-secondary bg-surface-primary text-primary",
  accent: "border-accent bg-surface-accent text-accent",
  warning: "border-warning bg-surface-warning text-warning",
  danger: "border-danger bg-surface-danger text-danger",
};

/**
 * Número grande arriba de una pantalla (el próximo plazo): algo que la lista no dice, y que lleva
 * a una acción al tocarlo. El tono dice cuán urgente es; `accent` es lo que hay que mirar primero
 * cuando no hay urgencia.
 */
export function Indicador({
  etiqueta,
  valor,
  detalle,
  href,
  tono = "neutral",
}: {
  etiqueta: string;
  valor: string;
  detalle: string;
  href: string;
  tono?: TonoIndicador;
}) {
  return (
    <Link
      href={href}
      className={unir(
        "flex min-w-0 flex-col gap-0.5 rounded-card border p-4 transition-colors hover:border-secondary-hover sm:px-5",
        TONOS_INDICADOR[tono],
      )}
    >
      <p className="text-caption font-medium sm:text-body-sm">{etiqueta}</p>
      <p className="text-metric">{valor}</p>
      <p className="truncate text-caption sm:text-body-sm">{detalle}</p>
    </Link>
  );
}

export type EstadoPaso = "cumplido" | "actual" | "pendiente";

/** Círculo de un paso en una secuencia: tildado, el actual (borde grueso) o pendiente. */
export function MarcadorPaso({ estado }: { estado: EstadoPaso }) {
  return (
    <span
      aria-hidden
      className={unir(
        "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-caption",
        estado === "cumplido" && "bg-fill-success text-on-fill",
        estado === "actual" && "border-2 border-primary",
        estado === "pendiente" && "border border-secondary",
      )}
    >
      {estado === "cumplido" ? "✓" : ""}
    </span>
  );
}
