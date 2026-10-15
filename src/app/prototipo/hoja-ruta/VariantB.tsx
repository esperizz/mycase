// PROTOTIPO — Variante B: un paso a la vez. Foco en "qué pasa ahora" y "qué te toca".

import { formatearFecha } from "@/lib/casos/formato";
import { AccionPaso, Columnas, Plazo, Telefono, type VarianteProps } from "./comun";
import { CASO } from "./datos";

export const nombre = "Un paso a la vez";

export function VariantB({ pasos, acciones }: VarianteProps) {
  const i = pasos.findIndex((p) => p.estado === "actual");
  const actual = i >= 0 ? pasos[i] : null;
  const anterior = [...pasos].reverse().find((p) => p.estado === "cumplido");
  const siguiente = i >= 0 ? pasos[i + 1] : undefined;
  const hechos = pasos.filter((p) => p.estado === "cumplido").length;

  const abogado = (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">{CASO.cliente}</h2>
          <p className="text-sm text-gray-500">{CASO.descripcion}</p>
        </div>
        <p className="text-sm font-semibold text-gray-500">
          Paso {Math.min(hechos + 1, pasos.length)} de {pasos.length}
        </p>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-gray-200">
        <div className="h-full bg-blue-600 transition-all" style={{ width: `${(hechos / pasos.length) * 100}%` }} />
      </div>
      {actual ? (
        <div className="flex flex-col gap-3 rounded-2xl border-2 border-blue-600 bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Ahora</p>
          <p className="text-2xl font-bold text-gray-900">{actual.tecnico}</p>
          <Plazo paso={actual} />
          {actual.teToca && <p className="text-sm text-gray-600">El cliente tiene que: {actual.teToca}</p>}
          <AccionPaso paso={actual} acciones={acciones} grande />
          <p className="text-xs text-gray-400">Al marcarlo, el cliente lo ve en su link.</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-green-50 p-6 text-green-900">Caso terminado.</div>
      )}
      {siguiente && <p className="text-sm text-gray-500">Después: {siguiente.tecnico}</p>}
      {anterior && (
        <button type="button" onClick={() => acciones.deshacer(anterior.id)} className="self-start text-xs text-gray-400 hover:underline">
          Deshacer “{anterior.tecnico}”
        </button>
      )}
    </div>
  );

  const cliente = (
    <Telefono>
      <div className="flex flex-col gap-4 bg-gray-50 p-4">
        <p className="text-lg font-bold text-gray-900">Hola {CASO.primerNombre} 👋</p>
        {actual?.teToca && (
          <div className="rounded-xl bg-blue-600 p-4 text-white">
            <p className="text-xs font-semibold uppercase">Te toca a vos</p>
            <p className="mt-1 font-semibold">{actual.teToca}</p>
          </div>
        )}
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase text-gray-500">Dónde está tu caso</p>
          <p className="mt-1 text-xl font-bold text-gray-900">{actual ? actual.titulo : "¡Terminamos!"}</p>
          {actual && <p className="mt-2 text-sm text-gray-600">{actual.explicacion}</p>}
          <div className="mt-3 flex gap-1">
            {pasos.map((p) => (
              <span
                key={p.id}
                className={`h-1.5 flex-1 rounded-full ${
                  p.estado === "cumplido" ? "bg-green-500" : p.estado === "actual" ? "bg-blue-600" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </div>
        {anterior && (
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase text-gray-500">Lo último que pasó</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">✓ {anterior.titulo}</p>
            {anterior.fecha && <p className="text-xs text-gray-400">{formatearFecha(anterior.fecha)}</p>}
          </div>
        )}
        {siguiente && (
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase text-gray-500">Lo que sigue</p>
            <p className="mt-1 text-sm text-gray-900">{siguiente.titulo}</p>
          </div>
        )}
      </div>
    </Telefono>
  );

  return <Columnas abogado={abogado} cliente={cliente} />;
}
