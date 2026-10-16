"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { EtapaBadge } from "@/components/casos/EstadoBadge";
import { FormularioCaso } from "@/components/casos/FormularioCaso";
import { HojaRutaArt } from "@/components/casos/HojaRutaArt";
import { ItemVencimiento } from "@/components/casos/ItemVencimiento";
import { Button } from "@/components/ui/Button";
import { SelectField, TextAreaField, TextField } from "@/components/ui/Field";
import { Header } from "@/components/ui/Header";
import { useCasos } from "@/lib/casos/CasosProvider";
import { formatearFecha } from "@/lib/casos/formato";
import { esArt, etapaArt } from "@/lib/casos/hojaRuta";
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
  const router = useRouter();
  const { casos, listo, actualizar, eliminar, agregarVencimiento } = useCasos();
  const caso = casos.find((c) => c.id === id);

  const [fechaVto, setFechaVto] = useState("");
  const [descVto, setDescVto] = useState("");
  const [notas, setNotas] = useState(caso?.notas ?? "");
  const [editando, setEditando] = useState(false);

  if (!listo) return null;

  if (!caso) {
    return (
      <>
        <Header />
        <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center gap-4 px-4 py-16 text-center">
          <p className="text-lg font-semibold text-gray-900">No encontramos ese caso</p>
          <Link href="/casos" className="text-sm font-semibold text-gray-900 underline underline-offset-2">
            Volver a la lista
          </Link>
        </main>
      </>
    );
  }

  const art = esArt(caso);

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

  const borrarCaso = () => {
    if (!window.confirm(`¿Eliminar el caso de ${caso.cliente}? No se puede deshacer.`)) return;
    eliminar(caso.id);
    router.push("/casos");
  };

  return (
    <>
      <Header />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-8">
        <div className="flex flex-col gap-3">
          <Link href="/casos" className="w-fit text-sm font-medium text-gray-500 hover:text-gray-900">
            ← Volver a mis casos
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">{caso.cliente}</h1>
            <EtapaBadge caso={caso} />
          </div>
        </div>

        {art ? (
          <HojaRutaArt caso={caso} />
        ) : (
          <Link
            href={`/casos/${caso.id}/carta`}
            className="w-fit rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
          >
            Generar carta de intimación →
          </Link>
        )}

        {editando ? (
          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <FormularioCaso
              inicial={caso}
              textoBoton="Guardar cambios"
              onGuardar={(datos) => {
                actualizar(caso.id, (c) => ({ ...c, ...datos }));
                setEditando(false);
              }}
              onCancelar={() => setEditando(false)}
            />
          </section>
        ) : (
          <section className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5">
            <div className="grid grid-cols-2 gap-4">
              <Dato label="Empleador" valor={caso.empleador} />
              <Dato label="Tipo de reclamo" valor={caso.tipoReclamo} />
              <Dato label="Contacto" valor={caso.contacto || "—"} />
              <Dato label="Caso abierto el" valor={formatearFecha(caso.fechaApertura)} />
            </div>
            <div>
              <Button variante="secondary" onClick={() => setEditando(true)}>
                Editar datos
              </Button>
            </div>
          </section>
        )}

        <section className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="font-semibold text-gray-900">Estado del caso</h2>
          {art ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-gray-600">
                {caso.estado === "cerrado"
                  ? "Caso cerrado."
                  : `Etapa: ${etapaArt(caso)}. Avanza sola con la hoja de ruta.`}
              </p>
              <Button
                variante="secondary"
                onClick={() =>
                  actualizar(caso.id, (c) => ({ ...c, estado: c.estado === "cerrado" ? "consulta" : "cerrado" }))
                }
              >
                {caso.estado === "cerrado" ? "Reabrir caso" : "Cerrar caso"}
              </Button>
            </div>
          ) : (
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
          )}
        </section>

        <section className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="font-semibold text-gray-900">Vencimientos</h2>
          {caso.vencimientos.length === 0 ? (
            <p className="text-sm text-gray-500">No hay ningún vencimiento cargado para este caso.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {[...caso.vencimientos]
                .sort((a, b) => a.fecha.localeCompare(b.fecha))
                .map((v) => (
                  <ItemVencimiento key={v.id} casoId={caso.id} vencimiento={v} />
                ))}
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

        <div>
          <button
            type="button"
            onClick={borrarCaso}
            className="text-sm font-medium text-red-600 hover:text-red-800"
          >
            Eliminar este caso
          </button>
        </div>
      </main>
    </>
  );
}
