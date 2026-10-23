"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { SelectField, TextField } from "@/components/ui/Field";
import { esCita } from "@/lib/casos/sugerencias";
import type { TipoVencimiento, Vencimiento } from "@/lib/casos/tipos";
import { CamposHoraLugar } from "./CamposHoraLugar";

export type DatosVencimiento = Pick<Vencimiento, "tipo" | "fecha" | "descripcion" | "hora" | "lugar">;

/**
 * Formulario de un plazo o tarea de la ficha, compartido por el alta y la edición. En el alta
 * (sin `inicial`) se vacía después de guardar, para cargar el siguiente.
 */
export function FormularioVencimiento({
  inicial,
  textoBoton,
  onGuardar,
  onCancelar,
}: {
  inicial?: DatosVencimiento;
  textoBoton: string;
  onGuardar: (datos: DatosVencimiento) => void;
  onCancelar?: () => void;
}) {
  const [tipo, setTipo] = useState<TipoVencimiento>(inicial?.tipo ?? "plazo");
  const [fecha, setFecha] = useState(inicial?.fecha ?? "");
  const [descripcion, setDescripcion] = useState(inicial?.descripcion ?? "");
  const [hora, setHora] = useState(inicial?.hora ?? "");
  const [lugar, setLugar] = useState(inicial?.lugar ?? "");

  const guardar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fecha) return;
    onGuardar({ tipo, fecha, descripcion, hora, lugar: lugar.trim() });
    if (inicial) return;
    setFecha("");
    setDescripcion("");
    setHora("");
    setLugar("");
  };

  return (
    <form onSubmit={guardar} className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="sm:w-28">
          <SelectField label="Tipo" value={tipo} onChange={(e) => setTipo(e.target.value as TipoVencimiento)}>
            <option value="plazo">Plazo</option>
            <option value="tarea">Tarea</option>
          </SelectField>
        </div>
        <div className="sm:w-44">
          <TextField label="Fecha" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
        </div>
        <div className="flex-1">
          <TextField
            label={tipo === "plazo" ? "Qué vence" : "Qué hay que hacer"}
            placeholder={tipo === "plazo" ? 'Ej.: "Contestar traslado"' : 'Ej.: "Llamar al cliente"'}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
        </div>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <CamposHoraLugar hora={hora} lugar={lugar} onHora={setHora} onLugar={setLugar} abrir={esCita(descripcion)} />
        <div className="flex gap-2">
          <Button type="submit">{textoBoton}</Button>
          {onCancelar && (
            <Button variante="secondary" onClick={onCancelar}>
              Cancelar
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
