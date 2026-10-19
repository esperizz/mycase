import type { TipoVencimiento } from "@/lib/casos/tipos";

/** Etiqueta "Plazo" o "Tarea". El rojo queda reservado para lo vencido, así que no se usa acá. */
export function TipoTag({ tipo }: { tipo: TipoVencimiento }) {
  const estilo = tipo === "plazo" ? "bg-indigo-50 text-indigo-700" : "bg-gray-100 text-gray-600";
  return (
    <span className={`ml-2 inline-flex rounded-full px-2 py-0.5 align-middle text-xs font-medium ${estilo}`}>
      {tipo === "plazo" ? "Plazo" : "Tarea"}
    </span>
  );
}
