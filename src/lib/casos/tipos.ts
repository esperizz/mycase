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
  id: string;
  fecha: string; // ISO yyyy-mm-dd
  descripcion: string;
  cumplido: boolean;
}

export type PlazoId = "48h" | "5d" | "10d";

/** Datos para generar la carta documento / telegrama de intimación de este caso. */
export interface CartaDatos {
  remitenteDomicilio: string;
  remitenteLocalidad: string;
  remitenteDocumento: string;
  destinatarioDomicilio: string;
  destinatarioLocalidad: string;
  destinatarioDocumento: string;
  hechosFecha: string;
  hechosDescripcion: string;
  pedidoId: string;
  pedidoMonto: string;
  pedidoDetalle: string;
  plazo: PlazoId;
  consecuencias: string[];
  /** Fecha (yyyy-mm-dd) en que se marcó como enviada; "" si todavía no se envió. */
  enviadaEl: string;
}

export const cartaVacia = (): CartaDatos => ({
  remitenteDomicilio: "",
  remitenteLocalidad: "",
  remitenteDocumento: "",
  destinatarioDomicilio: "",
  destinatarioLocalidad: "",
  destinatarioDocumento: "",
  hechosFecha: "",
  hechosDescripcion: "",
  pedidoId: "",
  pedidoMonto: "",
  pedidoDetalle: "",
  plazo: "10d",
  consecuencias: [],
  enviadaEl: "",
});

/** Seguimiento de un caso de ART paso a paso (ver hojaRuta.ts). */
export interface HojaRuta {
  /** Fecha (yyyy-mm-dd) en que se cumplió cada paso, por id de paso. */
  cumplidos: Record<string, string>;
  /** Fecha en que se le avisó al cliente de cada paso cumplido. */
  avisados: Record<string, string>;
  /** La ART rechazó el siniestro: se suma la rama de la comisión médica. */
  rechazo: boolean;
  /** Fecha en que se le contó al cliente cómo va a ser el caso; "" si todavía no. */
  inicioAvisado: string;
  /** Vencimiento del panel creado para el plazo de cada paso, por id de paso. */
  vencimientos: Record<string, string>;
}

export interface Caso {
  id: string;
  cliente: string;
  contacto: string;
  empleador: string;
  tipoReclamo: string;
  estado: EstadoCaso;
  fechaApertura: string; // ISO yyyy-mm-dd
  vencimientos: Vencimiento[];
  notas: string;
  carta: CartaDatos | null;
  hojaRuta: HojaRuta | null;
}

export type CasoNuevo = Omit<Caso, "id" | "fechaApertura" | "vencimientos" | "notas" | "carta" | "hojaRuta"> & {
  notas?: string;
};
