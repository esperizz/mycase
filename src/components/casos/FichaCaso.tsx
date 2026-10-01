"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { SelectField, TextAreaField, TextField } from "@/components/ui/Field";
import { useCasos } from "@/lib/casos/CasosProvider";
import { diasHasta, formatearFecha } from "@/lib/casos/formato";
import { ESTADO_LABEL, ESTADOS } from "@/lib/casos/tipos";
import { EstadoBadge } from "./EstadoBadge";

function Dato({ label, valor }: { label: string; valor: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
      <p className="text-gray-900">{valor}</p>
    </div>
  );
}

export function FichaCaso({ id }: { id: string }) {
  const { casos, listo, actualizar, agregarVencimiento, marcarVencimiento, quitarVencimiento } = useCasos();
  const caso = casos.find((c) => c.id === id);

  const [fechaVto, setFechaVto] = useState("");
  const [descVto, setDescVto] = useState("");
  const [notas, setNotas] = useState(caso?.notas ?? "");

  if (!listo) return null;

  if (!caso) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center gap-4 px-4 py-16 text-center">
        <p className="text-lg font-semibold text-gray-900">No encontramos ese caso</p>
        <Link href="/" className="text-sm font-semibold text-gray-900 underline underline-offset-2">
          Volver a la lista
        </Link>
      </main>
    );
  }

  const guardarVencimiento = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fechaVto) return;
    agregarVencimiento(caso.id, { fecha: fechaVto, descripcion: descVto });
    setFechaVto("");
    setDescVto("");
  };

  const guardarNotas = () => {
    actualizar(caso.id, (c) => ({ ...c, notas }));
  };

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-8">
      <div className="flex flex-col gap-3">
        <Link href="/" className="w-fit text-sm font-medium text-gray-500 hover:text-gray-900">
          ← Volver a mis casos
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">{caso.cliente}</h1>
          <EstadoBadge estado={caso.estado} />
        </div>
      </div>

      <section className="grid grid-cols-2 gap-4 rounded-xl border border-gray-200 bg-white p-5">
        <Dato label="Empleador" valor={caso.empleador} />
        <Dato label="Tipo de reclamo" valor={caso.tipoReclamo} />
        <Dato label="Contacto" valor={caso.contacto || "—"} />
        <Dato label="Caso abierto el" valor={formatearFecha(caso.fechaApertura)} />
      </section>

      <section className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="font-semibold text-gray-900">Estado del caso</h2>
        <SelectField
          label="Etapa actual"
          value={caso.estado}
          onChange={(e) => actualizar(caso.id, (c) => ({ ...c, estado: e.target.value as typeof c.estado }))}
        >
          {ESTADOS.map((e) => (
            <option key={e} value={e}>
              {ESTADO_LABEL[e]}
            </option>
          ))}
        </SelectField>
      </section>

      <section className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="font-semibold text-gray-900">Vencimientos</h2>
        {caso.vencimientos.length === 0 ? (
          <p className="text-sm text-gray-500">No hay ningún vencimiento cargado para este caso.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {[...caso.vencimientos]
              .sort((a, b) => a.fecha.localeCompare(b.fecha))
              .map((v) => {
                const dias = diasHasta(v.fecha);
                const urgencia = v.cumplido
                  ? "bg-gray-50 text-gray-400"
                  : dias < 0
                    ? "bg-red-50 text-red-700"
                    : dias <= 3
                      ? "bg-amber-50 text-amber-800"
                      : "bg-gray-50 text-gray-700";
                return (
                  <li key={v.id} className={`flex items-center gap-3 rounded-lg px-4 py-3 ${urgencia}`}>
                    <input
                      type="checkbox"
                      checked={v.cumplido}
                      onChange={(e) => marcarVencimiento(caso.id, v.id, e.target.checked)}
                      className="size-4"
                      aria-label={`Marcar "${v.descripcion}" como cumplido`}
                    />
                    <div className={`flex-1 ${v.cumplido ? "line-through" : ""}`}>
                      <p className="font-semibold">{formatearFecha(v.fecha)}</p>
                      <p className="text-sm">{v.descripcion}</p>
                    </div>
                    <Button variante="secondary" onClick={() => quitarVencimiento(caso.id, v.id)}>
                      Quitar
                    </Button>
                  </li>
                );
              })}
          </ul>
        )}
        <form onSubmit={guardarVencimiento} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <TextField label="Fecha" type="date" value={fechaVto} onChange={(e) => setFechaVto(e.target.value)} />
          </div>
          <div className="flex-[2]">
            <TextField
              label="Qué vence"
              placeholder='Ej.: "Contestar demanda"'
              value={descVto}
              onChange={(e) => setDescVto(e.target.value)}
            />
          </div>
          <Button type="submit">Agregar</Button>
        </form>
      </section>

      <section className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5">
        <TextAreaField
          label="Notas"
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          onBlur={guardarNotas}
          placeholder="Apuntes sobre el caso, conversaciones con el cliente, etc."
        />
      </section>
    </main>
  );
}
