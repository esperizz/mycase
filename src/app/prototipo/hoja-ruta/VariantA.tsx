// PROTOTIPO — Variante A: línea de tiempo completa, igual para abogado y cliente.

import { formatearFecha } from "@/lib/casos/formato";
import { AccionPaso, Columnas, Plazo, Telefono, type VarianteProps } from "./comun";
import { CASO } from "./datos";

export const nombre = "Línea de tiempo";

function Punto({ estado }: { estado: "cumplido" | "actual" | "pendiente" }) {
  if (estado === "cumplido")
    return <span className="z-10 flex h-6 w-6 items-center justify-center rounded-full bg-green-600 text-xs text-white">✓</span>;
  if (estado === "actual")
    return <span className="z-10 h-6 w-6 rounded-full border-4 border-blue-600 bg-white ring-4 ring-blue-100" />;
  return <span className="z-10 h-6 w-6 rounded-full border-2 border-gray-300 bg-white" />;
}

export function VariantA({ pasos, acciones }: VarianteProps) {
  const abogado = (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h2 className="text-lg font-bold text-gray-900">{CASO.cliente}</h2>
      <p className="mb-4 text-sm text-gray-500">
        {CASO.descripcion} · {CASO.art}
      </p>
      <ol className="relative flex flex-col gap-5 before:absolute before:left-3 before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-gray-200">
        {pasos.map((p) => (
          <li key={p.id} className="flex gap-3">
            <Punto estado={p.estado} />
            <div className="flex flex-1 flex-col gap-1">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className={`font-semibold ${p.estado === "pendiente" ? "text-gray-400" : "text-gray-900"}`}>{p.tecnico}</p>
                {p.fecha && (
                  <button type="button" onClick={() => acciones.deshacer(p.id)} className="text-xs text-gray-400 hover:underline">
                    {formatearFecha(p.fecha)} · deshacer
                  </button>
                )}
              </div>
              <Plazo paso={p} />
              {p.estado === "actual" && (
                <div className="mt-1">
                  <AccionPaso paso={p} acciones={acciones} />
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );

  const cliente = (
    <Telefono>
      <div className="flex flex-col gap-4 p-4">
        <div>
          <p className="text-xs text-gray-500">Tu caso con {CASO.abogada}</p>
          <p className="text-lg font-bold text-gray-900">Hola {CASO.primerNombre}</p>
        </div>
        <ol className="flex flex-col gap-4">
          {pasos.map((p) => (
            <li key={p.id} className="flex gap-3">
              <Punto estado={p.estado} />
              <div className="flex-1">
                <p className={`text-sm font-semibold ${p.estado === "pendiente" ? "text-gray-400" : "text-gray-900"}`}>{p.titulo}</p>
                {p.estado === "actual" && (
                  <>
                    <p className="mt-1 text-sm text-gray-600">{p.explicacion}</p>
                    {p.teToca && (
                      <p className="mt-2 rounded-lg bg-blue-50 p-2 text-sm text-blue-900">
                        <strong>Te toca:</strong> {p.teToca}
                      </p>
                    )}
                  </>
                )}
                {p.fecha && <p className="text-xs text-gray-400">{formatearFecha(p.fecha)}</p>}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Telefono>
  );

  return <Columnas abogado={abogado} cliente={cliente} />;
}
