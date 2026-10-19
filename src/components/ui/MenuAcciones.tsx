"use client";

import { useEffect, useId, useRef, useState } from "react";

export interface Accion {
  etiqueta: string;
  onClick: () => void;
  peligro?: boolean;
}

/**
 * Botón "⋯" que abre un menú chico de acciones. Deja las filas limpias: los datos se leen
 * y las acciones quedan en un solo lugar reconocible. Se cierra con Esc o tocando afuera.
 */
export function MenuAcciones({ acciones, etiqueta }: { acciones: Accion[]; etiqueta: string }) {
  const [abierto, setAbierto] = useState(false);
  const contenedor = useRef<HTMLDivElement>(null);
  const boton = useRef<HTMLButtonElement>(null);
  const id = useId();

  useEffect(() => {
    if (!abierto) return;
    contenedor.current?.querySelector<HTMLButtonElement>("[role=menuitem]")?.focus();
    const fuera = (e: PointerEvent) => {
      if (!contenedor.current?.contains(e.target as Node)) setAbierto(false);
    };
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAbierto(false);
        boton.current?.focus();
      }
    };
    document.addEventListener("pointerdown", fuera);
    document.addEventListener("keydown", tecla);
    return () => {
      document.removeEventListener("pointerdown", fuera);
      document.removeEventListener("keydown", tecla);
    };
  }, [abierto]);

  if (acciones.length === 0) return null;

  return (
    <div ref={contenedor} className="relative shrink-0">
      <button
        ref={boton}
        type="button"
        aria-label={etiqueta}
        aria-haspopup="menu"
        aria-expanded={abierto}
        aria-controls={id}
        onClick={() => setAbierto((a) => !a)}
        className="flex size-8 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-fondo hover:text-tinta"
      >
        <svg viewBox="0 0 16 16" className="size-4" fill="currentColor" aria-hidden>
          <circle cx="3" cy="8" r="1.5" />
          <circle cx="8" cy="8" r="1.5" />
          <circle cx="13" cy="8" r="1.5" />
        </svg>
      </button>
      {abierto && (
        <div
          id={id}
          role="menu"
          className="absolute right-0 top-9 z-20 flex min-w-52 flex-col rounded-2xl border border-linea bg-white p-1 shadow-lg"
        >
          {acciones.map((a) => (
            <button
              key={a.etiqueta}
              type="button"
              role="menuitem"
              onClick={() => {
                setAbierto(false);
                a.onClick();
              }}
              className={`rounded-xl px-3 py-2 text-left text-sm font-medium hover:bg-fondo focus:bg-fondo focus:outline-none ${
                a.peligro ? "text-red-700" : "text-tinta"
              }`}
            >
              {a.etiqueta}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
