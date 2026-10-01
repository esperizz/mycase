export const ESTADOS = ["consulta", "intimacion", "mediacion", "demanda", "cerrado"] as const;

export type EstadoCaso = (typeof ESTADOS)[number];

export const ESTADO_LABEL: Record<EstadoCaso, string> = {
  consulta: "Consulta",
  intimacion: "Intimación enviada",
  mediacion: "Mediación",
  demanda: "Demanda judicial",
  cerrado: "Cerrado",
};

export interface Vencimiento {
  fecha: string; // ISO yyyy-mm-dd
  descripcion: string;
}

export interface Caso {
  id: string;
  cliente: string;
  contacto: string;
  empleador: string;
  tipoReclamo: string;
  estado: EstadoCaso;
  fechaApertura: string; // ISO yyyy-mm-dd
  proximoVencimiento: Vencimiento | null;
  notas: string;
}

export type CasoNuevo = Omit<Caso, "id" | "fechaApertura" | "proximoVencimiento" | "notas"> & {
  proximoVencimiento?: Vencimiento | null;
  notas?: string;
};
