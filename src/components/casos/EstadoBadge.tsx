import { Badge, type TonoBadge } from "@/components/ui/Badge";
import { esArt, etapaArt } from "@/lib/casos/hojaRuta";
import { ESTADO_LABEL, type Caso, type EstadoCaso } from "@/lib/casos/tipos";

const TONOS: Record<EstadoCaso, TonoBadge> = {
  consulta: "neutral",
  intimacion: "info",
  mediacion: "warning",
  demanda: "special",
  cerrado: "success",
};

export function ArtBadge({ children = "ART" }: { children?: React.ReactNode }) {
  return <Badge tono="art">{children}</Badge>;
}

/** La etapa del caso: en ART, el paso actual de la hoja de ruta; en el resto, su estado. */
export function EtapaBadge({ caso }: { caso: Caso }) {
  if (esArt(caso) && caso.estado !== "cerrado") return <ArtBadge>ART · {etapaArt(caso)}</ArtBadge>;
  return <EstadoBadge estado={caso.estado} />;
}

export function EstadoBadge({ estado }: { estado: EstadoCaso }) {
  return <Badge tono={TONOS[estado]}>{ESTADO_LABEL[estado]}</Badge>;
}
