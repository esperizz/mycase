import { esArt, pasosDe, primerNombre } from "./hojaRuta";
import type { Caso, EstadoCaso } from "./tipos";

/**
 * Respuesta de un toque a "¿cómo va mi caso?" (la consulta más común, ver
 * docs/entrevistas/insights.md): no hay novedades y en qué etapa está, sin términos técnicos.
 */

/** Lo que queda en el historial del caso al mandarla. */
export const NOTA_SIN_NOVEDADES = "Le avisé: sin novedades.";

/** La etapa de un caso que no es de ART, contada al cliente. */
const ETAPA_CLIENTE: Record<Exclude<EstadoCaso, "cerrado">, string> = {
  consulta: "Estamos analizando tu caso.",
  intimacion: "Le mandamos la carta a tu empleador y estamos esperando que responda.",
  mediacion: "Estamos en la mediación, que es la instancia para intentar un acuerdo antes del juicio.",
  demanda: "El juicio está en marcha. Son procesos largos y es normal que pasen semanas sin movimientos.",
};

function etapa(caso: Caso): string {
  if (esArt(caso) && caso.hojaRuta) {
    const actual = pasosDe(caso.hojaRuta).find((p) => p.estado === "actual");
    if (!actual) return "Ya cumplimos todos los pasos y estamos terminando los últimos detalles.";
    const titulo = `${actual.titulo.charAt(0).toLowerCase()}${actual.titulo.slice(1)}`;
    return `Ahora estamos en: ${titulo}. ${actual.explicacion}`;
  }
  return caso.estado === "cerrado" ? "" : ETAPA_CLIENTE[caso.estado];
}

export function mensajeSinNovedades(caso: Caso): string {
  return [
    `Hola ${primerNombre(caso.cliente)}, revisé tu caso y no hay novedades.`,
    etapa(caso),
    "Apenas haya algo te aviso.",
  ]
    .filter(Boolean)
    .join("\n\n");
}
