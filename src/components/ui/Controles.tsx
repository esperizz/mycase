"use client";

import { useId } from "react";
import { unir } from "./Texto";

interface Opcion<T extends string> {
  valor: T;
  etiqueta: string;
}

/**
 * Elegir una entre pocas opciones (dos o tres), todas a la vista. Se usa en lugar de un selector
 * cuando conviene ver las alternativas sin abrir nada.
 */
export function Segmentado<T extends string>({
  label,
  ocultarLabel = false,
  ayuda,
  opciones,
  valor,
  onChange,
}: {
  label: string;
  /** El label queda solo para lectores de pantalla, cuando el contexto ya lo dice. */
  ocultarLabel?: boolean;
  ayuda?: React.ReactNode;
  opciones: Opcion<T>[];
  valor: T;
  onChange: (valor: T) => void;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-2">
      <p id={`${id}-label`} className={ocultarLabel ? "sr-only" : "text-label text-primary"}>
        {label}
      </p>
      <div
        role="radiogroup"
        aria-labelledby={`${id}-label`}
        aria-describedby={ayuda ? `${id}-ayuda` : undefined}
        className="grid w-full max-w-xs auto-cols-fr grid-flow-col rounded-control border border-secondary bg-surface-primary p-1"
      >
        {opciones.map((o) => (
          <button
            key={o.valor}
            type="button"
            role="radio"
            aria-checked={valor === o.valor}
            onClick={() => onChange(o.valor)}
            className={unir(
              "rounded-option px-2 py-1.5 text-label transition-colors",
              valor === o.valor ? "bg-fill-primary text-on-fill" : "text-secondary hover:bg-surface-primary-hover",
            )}
          >
            {o.etiqueta}
          </button>
        ))}
      </div>
      {ayuda && (
        <p id={`${id}-ayuda`} className="text-caption text-secondary">
          {ayuda}
        </p>
      )}
    </div>
  );
}

/** Opción en píldora que se prende y se apaga: sugerencias y atajos de fecha. */
export function Chip({ activo, onClick, children }: { activo: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activo}
      className={unir(
        "rounded-full border px-3 py-1.5 text-body-sm font-medium transition-colors",
        activo ? "border-primary bg-fill-primary text-on-fill" : "border-secondary bg-surface-primary text-primary hover:bg-surface-primary-hover",
      )}
    >
      {children}
    </button>
  );
}

/**
 * Pestañas con su panel. Las flechas izquierda/derecha pasan de una a otra (patrón de tabs
 * accesibles). `children` es el contenido de la pestaña elegida.
 */
export function Pestanias<T extends string>({
  etiqueta,
  opciones,
  valor,
  onChange,
  children,
}: {
  etiqueta: string;
  opciones: (Opcion<T> & { cantidad?: number })[];
  valor: T;
  onChange: (valor: T) => void;
  children: React.ReactNode;
}) {
  const id = useId();
  const idPestania = (v: T) => `${id}-${v}`;

  const teclas = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    const i = opciones.findIndex((o) => o.valor === valor);
    const paso = e.key === "ArrowRight" ? 1 : -1;
    const otra = opciones[(i + paso + opciones.length) % opciones.length].valor;
    onChange(otra);
    document.getElementById(idPestania(otra))?.focus();
  };

  return (
    <>
      <div role="tablist" aria-label={etiqueta} className="flex gap-6 border-b border-secondary" onKeyDown={teclas}>
        {opciones.map((o) => {
          const elegida = valor === o.valor;
          return (
            <button
              key={o.valor}
              id={idPestania(o.valor)}
              type="button"
              role="tab"
              aria-selected={elegida}
              aria-controls={`${id}-panel`}
              tabIndex={elegida ? 0 : -1}
              onClick={() => onChange(o.valor)}
              className={unir(
                "-mb-px border-b-2 pb-2 text-label transition-colors",
                elegida ? "border-primary text-primary" : "border-transparent text-secondary hover:text-secondary-hover",
              )}
            >
              {o.etiqueta}
              {o.cantidad !== undefined && <span className="font-regular text-tertiary"> ({o.cantidad})</span>}
            </button>
          );
        })}
      </div>
      <div id={`${id}-panel`} role="tabpanel" aria-labelledby={idPestania(valor)} className="flex flex-col gap-3">
        {children}
      </div>
    </>
  );
}

/** Casilla de verificación. Con `etiqueta`, el texto también la tilda al tocarlo. */
export function Casilla({
  etiqueta,
  className,
  ...input
}: { etiqueta?: React.ReactNode } & Omit<React.ComponentProps<"input">, "type">) {
  const control = (
    <input type="checkbox" className={unir("size-4 shrink-0 accent-primary", !etiqueta && className)} {...input} />
  );
  if (!etiqueta) return control;
  return <label className={unir("flex items-center gap-3 text-body-sm text-primary", className)}>{control}{etiqueta}</label>;
}
