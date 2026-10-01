"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { EstadoBadge } from "@/components/casos/EstadoBadge";
import { Button } from "@/components/ui/Button";
import { SelectField, TextAreaField, TextField } from "@/components/ui/Field";
import { Header } from "@/components/ui/Header";
import { useCasos } from "@/lib/casos/CasosProvider";
import { formatearFecha } from "@/lib/casos/formato";
import { ESTADO_LABEL, ESTADOS } from "@/lib/casos/tipos";

function Dato({ label, valor }: { label: string; valor: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
      <p className="text-gray-900">{valor}</p>
    </div>
  );
}

export default function FichaCasoPage() {
  const { id } = useParams<{ id: string }>();
  const { casos, listo, actualizar } = useCasos();
  const caso = casos.find((c) => c.id === id);

  const [fechaVto, setFechaVto] = useState("");
  const [descVto, setDescVto] = useState("");
  const [notas, setNotas] = useState(caso?.notas ?? "");

  if (!listo) return null;

  if (!caso) {
    return (
      <>
        <Header />
        <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center gap-4 px-4 py-16 text-center">
          <p className="text-lg font-semibold text-gray-900">No encontramos ese caso</p>
          <Link href="/" className="text-sm font-semibold text-gray-900 underline underline-offset-2">
            Volver a la lista
          </Link>
        </main>
      </>
    );
  }

  const guardarVencimiento = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fechaVto) return;
    actualizar(caso.id, (c) => ({ ...c, proximoVencimiento: { fecha: fechaVto, descripcion: descVto } }));
    setFechaVto("");
    setDescVto("");
  };

  const quitarVencimiento = () => {
    actualizar(caso.id, (c) => ({ ...c, proximoVencimiento: null }));
  };

  const guardarNotas = () => {
    actualizar(caso.id, (c) => ({ ...c, notas }));
  };

  return (
    <>
      <Header />
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
          <h2 className="font-semibold text-gray-900">Próximo vencimiento</h2>
          {caso.proximoVencimiento ? (
            <div className="flex items-center justify-between rounded-lg bg-amber-50 px-4 py-3">
              <div>
                <p className="font-semibold text-gray-900">{formatearFecha(caso.proximoVencimiento.fecha)}</p>
                <p className="text-sm text-gray-600">{caso.proximoVencimiento.descripcion}</p>
              </div>
              <Button variante="secondary" onClick={quitarVencimiento}>
                Quitar
              </Button>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No hay ningún vencimiento cargado para este caso.</p>
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
            <Button type="submit">Guardar</Button>
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
    </>
  );
}
