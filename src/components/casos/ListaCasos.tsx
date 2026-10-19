"use client";

import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { useCasos } from "@/lib/casos/CasosProvider";
import { diasHasta, formatearFecha, proximoPendiente, textoPendiente } from "@/lib/casos/formato";
import type { Caso, Vencimiento as VencimientoCaso } from "@/lib/casos/tipos";
import { EtapaBadge } from "./EstadoBadge";

function Vencimiento({ vencimiento: { fecha, descripcion, tipo } }: { vencimiento: VencimientoCaso }) {
  const dias = diasHasta(fecha);
  // Rojo solo para plazos vencidos; una tarea atrasada va en ámbar.
  const color = dias < 0 && tipo === "plazo" ? "text-red-600" : dias <= 3 ? "text-amber-600" : "text-gray-600";
  return (
    <div className={color}>
      <p className="text-sm font-semibold">{textoPendiente(dias, tipo)}</p>
      <p className="text-xs">
        {descripcion} · {formatearFecha(fecha)}
      </p>
    </div>
  );
}

export function ListaCasos() {
  const { casos, listo } = useCasos();

  if (!listo) return null;

  if (casos.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-gray-300 py-16 text-center">
        <p className="text-lg font-semibold text-gray-900">Todavía no cargaste ningún caso</p>
        <p className="max-w-sm text-sm text-gray-500">
          Cuando tomás un cliente nuevo, cargalo acá para hacer seguimiento de su estado y sus vencimientos.
        </p>
        <ButtonLink href="/casos/nuevo">Cargar el primer caso</ButtonLink>
      </div>
    );
  }

  // Los cerrados van aparte, plegados al final: siguen a mano sin ocupar la lista de trabajo.
  const cerrados = casos.filter((c) => c.estado === "cerrado").sort((a, b) => a.cliente.localeCompare(b.cliente, "es"));
  const ordenados = casos.filter((c) => c.estado !== "cerrado").sort((a, b) => {
    const va = proximoPendiente(a);
    const vb = proximoPendiente(b);
    const da = va ? diasHasta(va.fecha) : Infinity;
    const db = vb ? diasHasta(vb.fecha) : Infinity;
    return da - db;
  });

  return (
    <div className="flex flex-col gap-3">
      {ordenados.length === 0 && (
        <p className="rounded-xl border border-dashed border-gray-300 py-8 text-center text-sm text-gray-500">
          No tenés casos activos.
        </p>
      )}
      {ordenados.map((caso) => (
        <FilaCaso key={caso.id} caso={caso} />
      ))}

      {cerrados.length > 0 && (
        <details className="group mt-3">
          <summary className="flex cursor-pointer list-none items-center gap-2 py-2 text-sm font-semibold text-gray-500 hover:text-gray-900">
            <span className="transition-transform group-open:rotate-90" aria-hidden>
              ›
            </span>
            Cerrados ({cerrados.length})
          </summary>
          <div className="mt-2 flex flex-col gap-3">
            {cerrados.map((caso) => (
              <FilaCaso key={caso.id} caso={caso} />
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

function FilaCaso({ caso }: { caso: Caso }) {
  const vencimiento = caso.estado === "cerrado" ? null : proximoPendiente(caso);
  return (
    <Link
      href={`/casos/${caso.id}`}
      className={`flex flex-col gap-3 rounded-xl border border-gray-200 p-4 transition-colors hover:border-gray-300 sm:flex-row sm:items-center sm:justify-between ${
        caso.estado === "cerrado" ? "bg-gray-50" : "bg-white"
      }`}
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-gray-900">{caso.cliente}</p>
          <EtapaBadge caso={caso} />
        </div>
        <p className="text-sm text-gray-500">
          {caso.tipoReclamo} · contra {caso.empleador}
        </p>
      </div>
      {vencimiento ? (
        <Vencimiento vencimiento={vencimiento} />
      ) : (
        caso.estado !== "cerrado" && <p className="text-sm text-gray-400">Sin plazos ni tareas pendientes</p>
      )}
    </Link>
  );
}
