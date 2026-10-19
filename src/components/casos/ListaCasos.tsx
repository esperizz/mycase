"use client";

import Link from "next/link";
import { useState } from "react";
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

type Vista = "activos" | "cerrados";

export function ListaCasos() {
  const { casos, listo } = useCasos();
  const [vista, setVista] = useState<Vista>("activos");

  if (!listo) return null;

  if (casos.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-linea py-16 text-center">
        <p className="text-lg font-semibold text-tinta">Todavía no cargaste ningún caso</p>
        <p className="max-w-sm text-sm text-gray-500">
          Cuando tomás un cliente nuevo, cargalo acá para hacer seguimiento de su estado y sus vencimientos.
        </p>
        <ButtonLink href="/casos/nuevo">Cargar el primer caso</ButtonLink>
      </div>
    );
  }

  const cerrados = casos.filter((c) => c.estado === "cerrado").sort((a, b) => a.cliente.localeCompare(b.cliente, "es"));
  const activos = casos.filter((c) => c.estado !== "cerrado").sort((a, b) => {
    const va = proximoPendiente(a);
    const vb = proximoPendiente(b);
    const da = va ? diasHasta(va.fecha) : Infinity;
    const db = vb ? diasHasta(vb.fecha) : Infinity;
    return da - db;
  });
  const pestanias: { vista: Vista; etiqueta: string; casos: Caso[] }[] = [
    { vista: "activos", etiqueta: "Activos", casos: activos },
    { vista: "cerrados", etiqueta: "Cerrados", casos: cerrados },
  ];
  const visibles = vista === "activos" ? activos : cerrados;

  return (
    <div className="flex flex-col gap-4">
      <div
        role="tablist"
        aria-label="Casos"
        className="flex gap-6 border-b border-linea"
        onKeyDown={(e) => {
          // Flechas izquierda/derecha para moverse entre pestañas (patrón de tabs accesibles).
          if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
          const otra = vista === "activos" ? "cerrados" : "activos";
          setVista(otra);
          document.getElementById(`pestania-${otra}`)?.focus();
        }}
      >
        {pestanias.map((p) => {
          const elegida = vista === p.vista;
          return (
            <button
              key={p.vista}
              id={`pestania-${p.vista}`}
              type="button"
              role="tab"
              aria-selected={elegida}
              aria-controls="lista-casos"
              tabIndex={elegida ? 0 : -1}
              onClick={() => setVista(p.vista)}
              className={`-mb-px border-b-2 pb-2 text-sm font-semibold transition-colors ${
                elegida ? "border-tinta text-tinta" : "border-transparent text-gray-500 hover:text-tinta"
              }`}
            >
              {p.etiqueta} <span className="font-normal text-gray-400">({p.casos.length})</span>
            </button>
          );
        })}
      </div>

      <div id="lista-casos" role="tabpanel" aria-labelledby={`pestania-${vista}`} className="flex flex-col gap-3">
        {visibles.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-linea py-8 text-center text-sm text-gray-500">
            {vista === "activos" ? "No tenés casos activos." : "Todavía no cerraste ningún caso."}
          </p>
        ) : (
          visibles.map((caso) => <FilaCaso key={caso.id} caso={caso} />)
        )}
      </div>
    </div>
  );
}

function FilaCaso({ caso }: { caso: Caso }) {
  const vencimiento = caso.estado === "cerrado" ? null : proximoPendiente(caso);
  return (
    <Link
      href={`/casos/${caso.id}`}
      className={`flex flex-col gap-3 rounded-3xl border border-linea p-4 transition-colors hover:border-linea sm:flex-row sm:items-center sm:justify-between ${
        caso.estado === "cerrado" ? "bg-fondo" : "bg-white"
      }`}
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-tinta">{caso.cliente}</p>
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
