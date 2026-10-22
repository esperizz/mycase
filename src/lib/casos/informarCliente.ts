import { oracion } from "./formato";
import { primerNombre } from "./hojaRuta";
import type { Caso, EstadoCaso } from "./tipos";

/**
 * Mensaje para contestarle al cliente "¿cómo va mi caso?" (la consulta más común, ver
 * docs/entrevistas/insights.md): la novedad, si la hay, y en qué etapa está, sin términos técnicos.
 */

/** La etapa de un caso que no es de ART, contada al cliente. */
const ETAPA_CLIENTE: Record<Exclude<EstadoCaso, "cerrado">, string> = {
  consulta: "Estamos analizando tu caso.",
  intimacion: "Le mandamos la carta a tu empleador y estamos esperando que responda.",
  mediacion: "Estamos en la mediación, que es la instancia para intentar un acuerdo antes del juicio.",
  demanda: "El juicio está en marcha. Son procesos largos y es normal que pasen semanas sin movimientos.",
};

/**
 * Sin `novedad` (o en blanco), el mensaje es "revisé tu caso y no hay novedades".
 * Para casos que no son de ART: en esos, cada paso de la hoja de ruta arma su propio mensaje.
 */
export function mensajeParaCliente(caso: Caso, novedad = ""): string {
  const nombre = primerNombre(caso.cliente);
  const etapa = caso.estado === "cerrado" ? "" : ETAPA_CLIENTE[caso.estado];
  const lineas = novedad.trim()
    ? [`Hola ${nombre}, te cuento cómo va tu caso.`, oracion(novedad), etapa, "Te voy contando."]
    : [`Hola ${nombre}, revisé tu caso y no hay novedades.`, etapa, "Apenas haya algo te aviso."];
  return lineas.filter(Boolean).join("\n\n");
}

/** Lo que queda en el historial del caso al mandarlo. */
export function notaInforme(novedad = ""): string {
  const t = novedad.trim().replace(/\s+/g, " ");
  if (!t) return "Le informé: sin novedades.";
  return `Le informé: ${t}${/[.!?]$/.test(t) ? "" : "."}`;
}
