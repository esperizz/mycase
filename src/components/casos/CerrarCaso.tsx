"use client";

import { DialogoConfirmar } from "@/components/ui/DialogoConfirmar";
import { useCasos } from "@/lib/casos/CasosProvider";
import { pendientesDe } from "@/lib/casos/panel";
import type { Caso } from "@/lib/casos/tipos";

function cuantos(n: number, singular: string, plural: string) {
  return `${n} ${n === 1 ? singular : plural}`;
}

/** Confirmación para cerrar un caso: avisa si le quedan plazos o tareas sin cumplir. */
export function DialogoCerrarCaso({ caso, abierto, onCerrar }: { caso: Caso; abierto: boolean; onCerrar: () => void }) {
  const { actualizar } = useCasos();
  const { plazos, tareas } = pendientesDe(caso);
  const total = plazos + tareas;
  const quedan = [plazos && cuantos(plazos, "plazo", "plazos"), tareas && cuantos(tareas, "tarea", "tareas")]
    .filter(Boolean)
    .join(" y ");

  return (
    <DialogoConfirmar
      abierto={abierto}
      titulo={`¿Cerrar el caso de ${caso.cliente}?`}
      textoConfirmar="Cerrar caso"
      onCancelar={onCerrar}
      onConfirmar={() => {
        actualizar(caso.id, (c) => ({ ...c, estado: "cerrado" }));
        onCerrar();
      }}
    >
      {quedan && (
        <p className="rounded-2xl bg-amber-50 p-3 text-amber-900">
          Tiene {quedan} sin cumplir: al cerrarlo {total === 1 ? "deja" : "dejan"} de aparecer en el panel.
        </p>
      )}
      <p>Sale del panel y pasa a “Cerrados” en tus casos. No se borra nada y podés reabrirlo cuando quieras.</p>
    </DialogoConfirmar>
  );
}
