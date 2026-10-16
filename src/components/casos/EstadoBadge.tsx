import { esArt, etapaArt } from "@/lib/casos/hojaRuta";
import { ESTADO_LABEL, type Caso, type EstadoCaso } from "@/lib/casos/tipos";

const COLORES: Record<EstadoCaso, string> = {
  consulta: "bg-gray-100 text-gray-700",
  intimacion: "bg-blue-100 text-blue-700",
  mediacion: "bg-amber-100 text-amber-800",
  demanda: "bg-purple-100 text-purple-700",
  cerrado: "bg-green-100 text-green-700",
};

export function ArtBadge({ children = "ART" }: { children?: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-teal-100 px-2.5 py-1 text-xs font-semibold text-teal-800">
      {children}
    </span>
  );
}

/** La etapa del caso: en ART, el paso actual de la hoja de ruta; en el resto, su estado. */
export function EtapaBadge({ caso }: { caso: Caso }) {
  if (esArt(caso) && caso.estado !== "cerrado") return <ArtBadge>ART · {etapaArt(caso)}</ArtBadge>;
  return <EstadoBadge estado={caso.estado} />;
}

export function EstadoBadge({ estado }: { estado: EstadoCaso }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${COLORES[estado]}`}>
      {ESTADO_LABEL[estado]}
    </span>
  );
}
