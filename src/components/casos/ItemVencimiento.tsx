"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { useCasos } from "@/lib/casos/CasosProvider";
import { diasHasta, formatearFecha } from "@/lib/casos/formato";
import type { Vencimiento } from "@/lib/casos/tipos";

/** Un vencimiento de la ficha: se tilda, se edita (fecha y texto) o se quita. */
export function ItemVencimiento({ casoId, vencimiento: v }: { casoId: string; vencimiento: Vencimiento }) {
  const { actualizar, marcarVencimiento, quitarVencimiento } = useCasos();
  const [editando, setEditando] = useState(false);
  const [fecha, setFecha] = useState(v.fecha);
  const [descripcion, setDescripcion] = useState(v.descripcion);

  if (editando) {
    const guardar = (e: React.FormEvent) => {
      e.preventDefault();
      if (!fecha) return;
      actualizar(casoId, (c) => ({
        ...c,
        vencimientos: c.vencimientos.map((x) => (x.id === v.id ? { ...x, fecha, descripcion } : x)),
      }));
      setEditando(false);
    };
    return (
      <li className="rounded-lg bg-gray-50 px-4 py-3">
        <form onSubmit={guardar} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <TextField label="Fecha" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
          </div>
          <div className="flex-[2]">
            <TextField label="Qué vence" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <Button type="submit">Guardar</Button>
            <Button
              variante="secondary"
              onClick={() => {
                setFecha(v.fecha);
                setDescripcion(v.descripcion);
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
  const urgencia = v.cumplido
    ? "bg-gray-50 text-gray-400"
    : dias < 0
      ? "bg-red-50 text-red-700"
      : dias <= 3
        ? "bg-amber-50 text-amber-800"
        : "bg-gray-50 text-gray-700";

  return (
    <li className={`flex flex-wrap items-center gap-3 rounded-lg px-4 py-3 ${urgencia}`}>
      <input
        type="checkbox"
        checked={v.cumplido}
        onChange={(e) => marcarVencimiento(casoId, v.id, e.target.checked)}
        className="size-4"
        aria-label={`Marcar "${v.descripcion}" como cumplido`}
      />
      <div className={`min-w-40 flex-1 ${v.cumplido ? "line-through" : ""}`}>
        <p className="font-semibold">{formatearFecha(v.fecha)}</p>
        <p className="text-sm">{v.descripcion}</p>
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
