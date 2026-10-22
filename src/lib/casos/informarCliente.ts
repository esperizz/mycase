import { VENCE_INTIMACION } from "./cartaCatalogo";
import { fechaLarga, horaYLugar, hoyIso, oracion } from "./formato";
import { primerNombre } from "./hojaRuta";
import { esCita } from "./sugerencias";
import type { Caso, EstadoCaso } from "./tipos";

/**
 * Mensaje para contestarle al cliente "¿cómo va mi caso?" (la consulta más común, ver
 * docs/entrevistas/insights.md): la novedad si la hay, en qué etapa está y qué sigue, sin
 * términos técnicos. Para casos que no son de ART: en esos, cada paso de la hoja de ruta
 * arma su propio mensaje.
 */

/** Qué está pasando en cada etapa y qué sigue, contado al cliente. */
const ETAPA_CLIENTE: Record<Exclude<EstadoCaso, "cerrado">, string> = {
  consulta:
    "Estoy revisando tu caso y la documentación que me mandaste. Lo que sigue: mandarle una carta a tu empleador para reclamarle formalmente.",
  intimacion: "Le mandamos la carta a tu empleador. Lo que sigue: esperar su respuesta.",
  mediacion: "Estamos en la mediación, una reunión obligatoria con la empresa para intentar un acuerdo antes del juicio.",
  demanda: "El juicio está en marcha. Son procesos largos y es normal que pasen semanas sin movimientos.",
};

/** "3 de noviembre", con el año solo si no es el de hoy. */
function diaYMes(iso: string, hoy: string): string {
  const fecha = fechaLarga(iso);
  return iso.slice(0, 4) === hoy.slice(0, 4) ? fecha.replace(/ de \d{4}$/, "") : fecha;
}

function etapa(caso: Caso, hoy: string): string {
  if (caso.estado === "cerrado") return "";
  const texto = ETAPA_CLIENTE[caso.estado];
  if (caso.estado !== "intimacion") return texto;
  const plazo = caso.vencimientos.find((v) => !v.cumplido && v.descripcion.startsWith(VENCE_INTIMACION));
  return plazo ? `${texto.slice(0, -1)}. Tiene tiempo hasta el ${diaYMes(plazo.fecha, hoy)}.` : texto;
}

/** "La próxima audiencia es el 2 de noviembre a las 9:30 en Juzgado 45.", o "" si no hay. */
function proximaAudiencia(caso: Caso, hoy: string): string {
  const cita = caso.vencimientos
    .filter((v) => !v.cumplido && v.fecha >= hoy && esCita(v.descripcion))
    .sort((a, b) => a.fecha.localeCompare(b.fecha))[0];
  if (!cita) return "";
  const hora = cita.hora ? ` a las ${horaYLugar({ hora: cita.hora })}` : "";
  const lugar = cita.lugar?.trim() ? ` en ${cita.lugar.trim()}` : "";
  return `La próxima audiencia es el ${diaYMes(cita.fecha, hoy)}${hora}${lugar}.`;
}

/** Sin `novedad` (o en blanco), el mensaje es "no hay novedades en tu caso". */
export function mensajeParaCliente(caso: Caso, novedad = "", hoy: string = hoyIso()): string {
  const nombre = primerNombre(caso.cliente);
  const cuerpo = [etapa(caso, hoy), proximaAudiencia(caso, hoy)];
  const lineas = novedad.trim()
    ? [`Hola ${nombre}, te cuento cómo va tu caso.`, oracion(novedad), ...cuerpo, "Te voy contando."]
    : [`Hola ${nombre}, no hay novedades en tu caso.`, ...cuerpo, "Apenas haya algo te aviso."];
  return lineas.filter(Boolean).join("\n\n");
}

/** Lo que queda en el historial del caso al mandarlo. */
export function notaInforme(novedad = ""): string {
  const t = novedad.trim().replace(/\s+/g, " ");
  if (!t) return "Le informé: sin novedades.";
  return `Le informé: ${t}${/[.!?]$/.test(t) ? "" : "."}`;
}
