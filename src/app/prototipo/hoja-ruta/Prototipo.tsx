"use client";

// PROTOTIPO — descartable. Estado en memoria compartido por las tres variantes.

import { useState } from "react";
import { PrototypeSwitcher } from "@/components/ui/PrototypeSwitcher";
import { hoyIso } from "@/lib/casos/formato";
import type { Acciones } from "./comun";
import { armarHojaDeRuta, estadoInicial, type Estado } from "./datos";
import { nombre as nombreA, VariantA } from "./VariantA";
import { nombre as nombreB, VariantB } from "./VariantB";
import { nombre as nombreC, VariantC } from "./VariantC";

const VARIANTES = [
  { clave: "A", nombre: nombreA },
  { clave: "B", nombre: nombreB },
  { clave: "C", nombre: nombreC },
];

export function Prototipo({ variante }: { variante: string }) {
  const [estado, setEstado] = useState<Estado>(estadoInicial);
  const pasos = armarHojaDeRuta(estado);

  const acciones: Acciones = {
    cumplir: (id) => setEstado((e) => ({ ...e, cumplidos: { ...e.cumplidos, [id]: hoyIso() } })),
    deshacer: (id) =>
      setEstado((e) => {
        const cumplidos = { ...e.cumplidos };
        delete cumplidos[id];
        return { cumplidos, rechazo: id === "respuesta" ? false : e.rechazo };
      }),
    responderArt: (rechazo) =>
      setEstado((e) => ({ rechazo, cumplidos: { ...e.cumplidos, respuesta: hoyIso() } })),
    reiniciar: () => setEstado(estadoInicial()),
  };

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 pb-24">
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-lg border border-dashed border-fuchsia-400 bg-fuchsia-50 p-4 text-sm text-fuchsia-900">
        <p>
          <strong>Prototipo descartable.</strong> Hoja de ruta de un caso de ART, con datos de ejemplo y nada guardado. Marcá
          pasos del lado de la abogada y mirá cómo cambia lo que ve el cliente. Cambiá de variante con la barra de abajo o
          las flechas ← →.
        </p>
        <button type="button" onClick={acciones.reiniciar} className="rounded-md border border-fuchsia-400 px-3 py-1 font-semibold">
          Reiniciar caso
        </button>
      </div>
      {variante === "A" && <VariantA pasos={pasos} acciones={acciones} />}
      {variante === "B" && <VariantB pasos={pasos} acciones={acciones} />}
      {variante === "C" && <VariantC pasos={pasos} acciones={acciones} />}
      <PrototypeSwitcher variantes={VARIANTES} actual={variante} />
    </main>
  );
}
