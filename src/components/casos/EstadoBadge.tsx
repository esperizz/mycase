import { ESTADO_LABEL, type EstadoCaso } from "@/lib/casos/tipos";

const COLORES: Record<EstadoCaso, string> = {
  consulta: "bg-gray-100 text-gray-700",
  intimacion: "bg-blue-100 text-blue-700",
  mediacion: "bg-amber-100 text-amber-800",
  demanda: "bg-purple-100 text-purple-700",
  cerrado: "bg-green-100 text-green-700",
};

export function EstadoBadge({ estado }: { estado: EstadoCaso }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${COLORES[estado]}`}>
      {ESTADO_LABEL[estado]}
    </span>
  );
}
