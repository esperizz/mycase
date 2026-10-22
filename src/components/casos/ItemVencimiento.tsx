"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { SelectField, TextField } from "@/components/ui/Field";
import { useCasos } from "@/lib/casos/CasosProvider";
import { TipoTag } from "./TipoTag";
import { diasHasta, formatearFecha, horaYLugar } from "@/lib/casos/formato";
import type { TipoVencimiento, Vencimiento } from "@/lib/casos/tipos";

/** Un plazo o tarea de la ficha: se tilda, se edita (tipo, fecha y texto) o se quita. */
export function ItemVencimiento({ casoId, vencimiento: v }: { casoId: string; vencimiento: Vencimiento }) {
  const { actualizar, marcarVencimiento, quitarVencimiento } = useCasos();
  const [editando, setEditando] = useState(false);
  const [fecha, setFecha] = useState(v.fecha);
  const [descripcion, setDescripcion] = useState(v.descripcion);
  const [tipo, setTipo] = useState<TipoVencimiento>(v.tipo);
  const [hora, setHora] = useState(v.hora ?? "");
  const [lugar, setLugar] = useState(v.lugar ?? "");

  if (editando) {
    const guardar = (e: React.FormEvent) => {
      e.preventDefault();
      if (!fecha) return;
      actualizar(casoId, (c) => ({
        ...c,
        vencimientos: c.vencimientos.map((x) => (x.id === v.id ? { ...x, fecha, descripcion, tipo, hora, lugar: lugar.trim() } : x)),
      }));
      setEditando(false);
    };
    return (
      <li className="rounded-2xl bg-fondo px-4 py-3">
        <form onSubmit={guardar} className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="sm:w-28">
            <SelectField label="Tipo" value={tipo} onChange={(e) => setTipo(e.target.value as TipoVencimiento)}>
              <option value="plazo">Plazo</option>
              <option value="tarea">Tarea</option>
            </SelectField>
          </div>
          <div className="flex-1">
            <TextField label="Fecha" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
          </div>
          <div className="flex-[2]">
            <TextField label={tipo === "plazo" ? "Qué vence" : "Qué hay que hacer"} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
          </div>
          <div className="sm:w-32">
            <TextField label="Hora" opcional type="time" value={hora} onChange={(e) => setHora(e.target.value)} />
          </div>
          <div className="flex-1">
            <TextField label="Lugar" opcional value={lugar} onChange={(e) => setLugar(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <Button type="submit">Guardar</Button>
            <Button
              variante="secondary"
              onClick={() => {
                setFecha(v.fecha);
                setDescripcion(v.descripcion);
                setTipo(v.tipo);
                setHora(v.hora ?? "");
                setLugar(v.lugar ?? "");
                setEditando(false);
              }}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </li>
    );
  }

  const dias = diasHasta(v.fecha);
  const tarea = v.tipo === "tarea";
  // Una tarea atrasada no es tan grave como un plazo vencido.
  const urgencia = v.cumplido
    ? "bg-fondo text-gray-400"
    : dias < 0
      ? tarea
        ? "bg-amber-50 text-amber-800"
        : "bg-red-50 text-red-700"
      : dias <= 3
        ? "bg-amber-50 text-amber-800"
        : "bg-fondo text-gray-700";

  return (
    <li className={`flex flex-wrap items-center gap-3 rounded-2xl px-4 py-3 ${urgencia}`}>
      <input
        type="checkbox"
        checked={v.cumplido}
        onChange={(e) => marcarVencimiento(casoId, v.id, e.target.checked)}
        className="size-4"
        aria-label={`Marcar "${v.descripcion}" como cumplido`}
      />
      <div className={`min-w-40 flex-1 ${v.cumplido ? "line-through" : ""}`}>
        <p className="font-semibold">
          {formatearFecha(v.fecha)}
          {horaYLugar(v) && <span className="font-normal"> · {horaYLugar(v)}</span>}
        </p>
        <p className="text-sm">
          {v.descripcion}
          <TipoTag tipo={v.tipo} />
        </p>
      </div>
      <div className="flex gap-2">
        <Button variante="secondary" onClick={() => setEditando(true)}>
          Editar
        </Button>
        <Button variante="secondary" onClick={() => quitarVencimiento(casoId, v.id)}>
          Quitar
        </Button>
      </div>
    </li>
  );
}
