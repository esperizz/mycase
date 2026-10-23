"use client";

import { useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { Pestanias } from "@/components/ui/Controles";
import { TextField } from "@/components/ui/Field";
import { TarjetaEnlace, Vacio } from "@/components/ui/Superficies";
import { Texto, type TonoTexto } from "@/components/ui/Texto";
import { coincide } from "@/lib/casos/buscar";
import { useCasos } from "@/lib/casos/CasosProvider";
import { diasHasta, formatearFecha, horaYLugar, proximoPendiente, textoPendiente } from "@/lib/casos/formato";
import type { Caso, Vencimiento as VencimientoCaso } from "@/lib/casos/tipos";
import { EtapaBadge } from "./EstadoBadge";

function Vencimiento({ vencimiento }: { vencimiento: VencimientoCaso }) {
  const { fecha, descripcion, tipo } = vencimiento;
  const dias = diasHasta(fecha);
  // Rojo solo para plazos vencidos; una tarea atrasada va en ámbar.
  const tono: TonoTexto = dias < 0 && tipo === "plazo" ? "danger" : dias <= 3 ? "warning" : "secondary";
  return (
    <Texto as="div" tono={tono}>
      <Texto estilo="body-sm" peso="semibold">
        {textoPendiente(dias, tipo)}
      </Texto>
      <Texto estilo="caption">{[descripcion, formatearFecha(fecha), horaYLugar(vencimiento)].filter(Boolean).join(" · ")}</Texto>
    </Texto>
  );
}

type Vista = "activos" | "cerrados";

export function ListaCasos() {
  const { casos, listo } = useCasos();
  const [vista, setVista] = useState<Vista>("activos");
  const [busqueda, setBusqueda] = useState("");

  if (!listo) return null;

  if (casos.length === 0) {
    return (
      <Vacio
        titulo="Todavía no cargaste ningún caso"
        descripcion="Cuando tomás un cliente nuevo, cargalo acá para hacer seguimiento de su estado y sus vencimientos."
      >
        <ButtonLink href="/casos/nuevo">Cargar el primer caso</ButtonLink>
      </Vacio>
    );
  }

  const encontrados = casos.filter((c) => coincide(c, busqueda));
  const cerrados = encontrados.filter((c) => c.estado === "cerrado").sort((a, b) => a.cliente.localeCompare(b.cliente, "es"));
  const activos = encontrados.filter((c) => c.estado !== "cerrado").sort((a, b) => {
    const va = proximoPendiente(a);
    const vb = proximoPendiente(b);
    const da = va ? diasHasta(va.fecha) : Infinity;
    const db = vb ? diasHasta(vb.fecha) : Infinity;
    return da - db;
  });
  const visibles = vista === "activos" ? activos : cerrados;

  return (
    <div className="flex flex-col gap-4">
      <TextField
        label="Buscar"
        type="search"
        placeholder="Cliente, empleador o expediente"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />
      <Pestanias
        etiqueta="Casos"
        opciones={[
          { valor: "activos", etiqueta: "Activos", cantidad: activos.length },
          { valor: "cerrados", etiqueta: "Cerrados", cantidad: cerrados.length },
        ]}
        valor={vista}
        onChange={setVista}
      >
        {visibles.length === 0 ? (
          <Vacio
            descripcion={
              busqueda.trim()
                ? `No hay casos ${vista} que coincidan con "${busqueda.trim()}".`
                : vista === "activos"
                  ? "No tenés casos activos."
                  : "Todavía no cerraste ningún caso."
            }
          />
        ) : (
          visibles.map((caso) => <FilaCaso key={caso.id} caso={caso} />)
        )}
      </Pestanias>
    </div>
  );
}

function FilaCaso({ caso }: { caso: Caso }) {
  const vencimiento = caso.estado === "cerrado" ? null : proximoPendiente(caso);
  return (
    <TarjetaEnlace
      href={`/casos/${caso.id}`}
      apagada={caso.estado === "cerrado"}
      className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Texto peso="semibold" tono="primary">
            {caso.cliente}
          </Texto>
          <EtapaBadge caso={caso} />
        </div>
        <Texto estilo="body-sm" tono="secondary">
          {caso.tipoReclamo} · contra {caso.empleador}
        </Texto>
      </div>
      {vencimiento ? (
        <Vencimiento vencimiento={vencimiento} />
      ) : (
        caso.estado !== "cerrado" && (
          <Texto estilo="body-sm" tono="tertiary">
            Sin plazos ni tareas pendientes
          </Texto>
        )
      )}
    </TarjetaEnlace>
  );
}
