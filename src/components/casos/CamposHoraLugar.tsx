"use client";

import { useState } from "react";
import { BotonTexto } from "@/components/ui/Button";
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
      <BotonTexto estilo="body-sm" className="w-fit" onClick={() => setAbierto(true)}>
        + Agregar hora y lugar
      </BotonTexto>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-3 sm:flex-row">
      <div className="sm:w-36">
        <TextField label="Hora" opcional type="time" value={hora} onChange={(e) => onHora(e.target.value)} />
      </div>
      <div className="flex-1">
        <TextField
          label="Lugar"
          opcional
          placeholder='Ej.: "Juzgado 45" o "por Zoom"'
          value={lugar}
          onChange={(e) => onLugar(e.target.value)}
        />
      </div>
    </div>
  );
}
