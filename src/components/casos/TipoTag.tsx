import { Badge } from "@/components/ui/Badge";
import type { TipoVencimiento } from "@/lib/casos/tipos";

/** Etiqueta "Plazo" o "Tarea". El rojo queda reservado para lo vencido, así que no se usa acá. */
export function TipoTag({ tipo }: { tipo: TipoVencimiento }) {
  return (
    <Badge tono={tipo === "plazo" ? "accent" : "neutral"} className="ml-2 align-middle">
      {tipo === "plazo" ? "Plazo" : "Tarea"}
    </Badge>
  );
}
