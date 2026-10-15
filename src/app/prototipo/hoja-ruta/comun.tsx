// PROTOTIPO — descartable. Piezas mínimas compartidas por las variantes.

import { formatearFecha, textoDias } from "@/lib/casos/formato";
import type { PasoVista } from "./datos";

export interface Acciones {
  cumplir: (id: string) => void;
  deshacer: (id: string) => void;
  /** Solo para el paso "respuesta": la ART aceptó o rechazó. */
  responderArt: (rechazo: boolean) => void;
  reiniciar: () => void;
}

export interface VarianteProps {
  pasos: PasoVista[];
  acciones: Acciones;
}

/** Marco de celular para la vista del cliente. */
export function Telefono({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[360px] rounded-[2rem] border-8 border-gray-900 bg-white shadow-xl">
      <div className="flex h-6 items-center justify-center bg-gray-900">
        <div className="h-1.5 w-16 rounded-full bg-gray-700" />
      </div>
      <div className="h-[640px] overflow-y-auto">{children}</div>
    </div>
  );
}

export function Columnas({ abogado, cliente }: { abogado: React.ReactNode; cliente: React.ReactNode }) {
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <section className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Lo que ve la abogada</p>
        {abogado}
      </section>
      <section className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Lo que ve el cliente (link por WhatsApp)
        </p>
        {cliente}
      </section>
    </div>
  );
}

/** Texto del plazo que corre en un paso, con color según urgencia. */
export function Plazo({ paso }: { paso: PasoVista }) {
  if (!paso.vence || paso.diasRestantes === undefined || !paso.plazo) return null;
  const urgente = paso.diasRestantes <= 2;
  return (
    <span
      className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${
        urgente ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-900"
      }`}
    >
      {paso.plazo.texto}: {textoDias(paso.diasRestantes).toLowerCase()} ({formatearFecha(paso.vence)})
    </span>
  );
}

/** Botones para el paso actual: "Cumplido", o Aceptó / Rechazó si es la respuesta de la ART. */
export function AccionPaso({ paso, acciones, grande = false }: { paso: PasoVista; acciones: Acciones; grande?: boolean }) {
  const tam = grande ? "h-12 px-5 text-base" : "h-9 px-3 text-sm";
  if (paso.id === "respuesta") {
    return (
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => acciones.responderArt(false)} className={`${tam} rounded-lg bg-green-700 font-semibold text-white`}>
          La ART aceptó
        </button>
        <button type="button" onClick={() => acciones.responderArt(true)} className={`${tam} rounded-lg bg-red-700 font-semibold text-white`}>
          La ART rechazó
        </button>
      </div>
    );
  }
  return (
    <button type="button" onClick={() => acciones.cumplir(paso.id)} className={`${tam} rounded-lg bg-gray-900 font-semibold text-white`}>
      ✓ Marcar cumplido
    </button>
  );
}
