import { esArt } from "./hojaRuta";
import type { Caso, EstadoCaso, TipoVencimiento } from "./tipos";

/**
 * Atajos para cargar un plazo o una tarea: los de la etapa del caso y los de su tipo de reclamo.
 * Son propuestas propias, sin validar con una abogada (ver docs/investigacion/cartas-leyes-derogadas.md).
 * La abogada representa al trabajador: demanda, no contesta demandas.
 */

type Sugerencias = Record<TipoVencimiento, string[]>;

export const MAXIMO_SUGERENCIAS = 4;

const POR_ETAPA: Record<Exclude<EstadoCaso, "cerrado">, Sugerencias> = {
  consulta: { plazo: ["Prescripción"], tarea: ["Pedir documentación", "Llamar al cliente"] },
  intimacion: {
    plazo: ["Vence la intimación", "Recepción de la carta"],
    tarea: ["Revisar respuesta del empleador", "Llamar al cliente"],
  },
  mediacion: { plazo: ["Audiencia de mediación"], tarea: ["Preparar propuesta", "Llamar al cliente"] },
  demanda: { plazo: ["Contestar traslado", "Audiencia", "Presentar escrito"], tarea: ["Llamar al cliente", "Pedir documentación"] },
};

const POR_TIPO: Record<string, Sugerencias> = {
  "Despido sin causa": {
    plazo: ["Pago de la indemnización", "Entrega de certificados"],
    tarea: ["Pedir telegrama de despido"],
  },
  "Falta de pago de haberes": { plazo: ["Pago de haberes"], tarea: ["Pedir recibos de sueldo"] },
  "Diferencias salariales": { plazo: [], tarea: ["Revisar convenio colectivo", "Pedir recibos de sueldo"] },
  "Trabajo no registrado": { plazo: [], tarea: ["Juntar pruebas de la relación"] },
};

/** En ART la etapa sale de la hoja de ruta, así que las sugerencias no dependen del estado. */
const ART: Sugerencias = {
  plazo: ["Discutir el alta", "Examen en comisión médica"],
  tarea: ["Pedir número de siniestro", "Pedir historia clínica", "Llamar al cliente"],
};

export function sugerencias(caso: Caso, tipo: TipoVencimiento): string[] {
  if (esArt(caso)) return ART[tipo];
  const etapa = caso.estado === "cerrado" ? [] : POR_ETAPA[caso.estado][tipo];
  const propias = POR_TIPO[caso.tipoReclamo]?.[tipo] ?? [];
  return [...new Set([...etapa, ...propias])].slice(0, MAXIMO_SUGERENCIAS);
}
