"use client";

import { useState } from "react";
import { Casilla } from "@/components/ui/Controles";
import { MenuAcciones } from "@/components/ui/MenuAcciones";
import { Recuadro, type TonoRecuadro } from "@/components/ui/Superficies";
import { Texto } from "@/components/ui/Texto";
import { descargarCalendario } from "@/lib/casos/calendario";
import { useCasos } from "@/lib/casos/CasosProvider";
import { diasHasta, formatearFecha, horaYLugar } from "@/lib/casos/formato";
import type { Vencimiento } from "@/lib/casos/tipos";
import { FormularioVencimiento } from "./FormularioVencimiento";
import { TipoTag } from "./TipoTag";

/** Un plazo o tarea de la ficha: se tilda, se edita (tipo, fecha y texto) o se quita. */
export function ItemVencimiento({ casoId, vencimiento: v }: { casoId: string; vencimiento: Vencimiento }) {
  const { casos, actualizar, marcarVencimiento, quitarVencimiento } = useCasos();
  const caso = casos.find((c) => c.id === casoId);
  const [editando, setEditando] = useState(false);

  if (editando) {
    return (
      <Recuadro as="li">
        <FormularioVencimiento
          inicial={{ ...v, hora: v.hora ?? "", lugar: v.lugar ?? "" }}
          textoBoton="Guardar"
          onGuardar={(datos) => {
            actualizar(casoId, (c) => ({
              ...c,
              vencimientos: c.vencimientos.map((x) => (x.id === v.id ? { ...x, ...datos } : x)),
            }));
            setEditando(false);
          }}
          onCancelar={() => setEditando(false)}
        />
      </Recuadro>
    );
  }

  const dias = diasHasta(v.fecha);
  const tarea = v.tipo === "tarea";
  // Una tarea atrasada no es tan grave como un plazo vencido.
  const tono: TonoRecuadro = v.cumplido ? "neutral" : dias < 0 ? (tarea ? "warning" : "danger") : dias <= 3 ? "warning" : "neutral";

  return (
    <Recuadro as="li" tono={tono} className="flex flex-wrap items-center gap-3">
      <Casilla
        checked={v.cumplido}
        onChange={(e) => marcarVencimiento(casoId, v.id, e.target.checked)}
        aria-label={`Marcar "${v.descripcion}" como cumplido`}
      />
      <div className="min-w-40 flex-1">
        <Texto peso="semibold" tono={v.cumplido ? "tertiary" : undefined} tachado={v.cumplido}>
          {formatearFecha(v.fecha)}
          {horaYLugar(v) && (
            <Texto as="span" peso="regular">
              {" "}
              · {horaYLugar(v)}
            </Texto>
          )}
        </Texto>
        <Texto estilo="body-sm" tono={v.cumplido ? "tertiary" : undefined} tachado={v.cumplido}>
          {v.descripcion}
          <TipoTag tipo={v.tipo} />
        </Texto>
      </div>
      <MenuAcciones
        etiqueta={`Acciones de "${v.descripcion || "este vencimiento"}"`}
        acciones={[
          ...(caso && !v.cumplido
            ? [{ etiqueta: "Agregar al calendario", onClick: () => descargarCalendario([{ caso, vencimiento: v }], v.descripcion || "plazo") }]
            : []),
          { etiqueta: "Editar", onClick: () => setEditando(true) },
          { etiqueta: "Quitar", onClick: () => quitarVencimiento(casoId, v.id), peligro: true },
        ]}
      />
    </Recuadro>
  );
}
