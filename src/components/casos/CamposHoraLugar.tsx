"use client";

import { useState } from "react";
import { TextField } from "@/components/ui/Field";

/**
 * Hora y lugar de un plazo o tarea. Solo hacen falta para lo que es una cita (audiencias,
 * exámenes), así que quedan detrás de un link salvo que ya tengan algo o se pida `abrir`.
 */
export function CamposHoraLugar({
  hora,
  lugar,
  onHora,
  onLugar,
  abrir = false,
}: {
  hora: string;
  lugar: string;
  onHora: (hora: string) => void;
  onLugar: (lugar: string) => void;
  /** Mostrarlos sin esperar al link: por ejemplo, cuando se eligió "Audiencia". */
  abrir?: boolean;
}) {
  const [abierto, setAbierto] = useState(false);

  if (!abierto && !abrir && !hora && !lugar) {
    return (
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="w-fit text-sm font-semibold text-tinta underline-offset-2 hover:underline"
      >
        + Agregar hora y lugar
      </button>
    );
  }

  return (
    <div className="grid flex-1 gap-3 sm:grid-cols-[9rem_1fr]">
      <TextField label="Hora" opcional type="time" value={hora} onChange={(e) => onHora(e.target.value)} />
      <TextField
        label="Lugar"
        opcional
        placeholder='Ej.: "Juzgado 45" o "por Zoom"'
        value={lugar}
        onChange={(e) => onLugar(e.target.value)}
      />
    </div>
  );
}
