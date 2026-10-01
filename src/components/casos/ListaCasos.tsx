"use client";

import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { useCasos } from "@/lib/casos/CasosProvider";
import { diasHasta, formatearFecha, proximoPendiente } from "@/lib/casos/formato";
import { EstadoBadge } from "./EstadoBadge";

function Vencimiento({ fecha, descripcion }: { fecha: string; descripcion: string }) {
  const dias = diasHasta(fecha);
  const color = dias < 0 ? "text-red-600" : dias <= 3 ? "text-amber-600" : "text-gray-600";
  const texto =
    dias < 0
      ? `Venció hace ${Math.abs(dias)} día${Math.abs(dias) === 1 ? "" : "s"}`
      : dias === 0
        ? "Vence hoy"
        : `Vence en ${dias} día${dias === 1 ? "" : "s"}`;
  return (
    <div className={color}>
      <p className="text-sm font-semibold">{texto}</p>
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

  const ordenados = [...casos].sort((a, b) => {
    const va = proximoPendiente(a);
    const vb = proximoPendiente(b);
    const da = va ? diasHasta(va.fecha) : Infinity;
    const db = vb ? diasHasta(vb.fecha) : Infinity;
    return da - db;
  });

  return (
    <div className="flex flex-col gap-3">
      {ordenados.map((caso) => {
        const vencimiento = proximoPendiente(caso);
        return (
          <Link
            key={caso.id}
            href={`/casos/${caso.id}`}
            className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:border-gray-300 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-gray-900">{caso.cliente}</p>
                <EstadoBadge estado={caso.estado} />
              </div>
              <p className="text-sm text-gray-500">
                {caso.tipoReclamo} · contra {caso.empleador}
              </p>
            </div>
            {vencimiento ? (
              <Vencimiento fecha={vencimiento.fecha} descripcion={vencimiento.descripcion} />
            ) : (
              <p className="text-sm text-gray-400">Sin vencimientos pendientes</p>
            )}
          </Link>
        );
      })}
    </div>
  );
}
