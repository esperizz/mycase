import { feriado } from "./feriados";
import type { Caso, Vencimiento } from "./tipos";

/** El vencimiento pendiente más próximo (o más vencido), o null si no hay ninguno sin cumplir. */
export function proximoPendiente(caso: Caso): Vencimiento | null {
  const pendientes = caso.vencimientos.filter((v) => !v.cumplido);
  if (pendientes.length === 0) return null;
  return [...pendientes].sort((a, b) => a.fecha.localeCompare(b.fecha))[0];
}

export function formatearFecha(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" });
}

/** "19 oct"; si es de otro año, "19 oct 2025". Para listas donde la fecha completa no entra. */
export function fechaCorta(iso: string, hoy: string = hoyIso()): string {
  const [y, m, d] = iso.split("-").map(Number);
  const mes = new Date(y, m - 1, d).toLocaleDateString("es-AR", { month: "short" }).replace(".", "");
  return y === Number(hoy.slice(0, 4)) ? `${d} ${mes}` : `${d} ${mes} ${y}`;
}

/** Días entre dos fechas yyyy-mm-dd (negativo si `hasta` es anterior a `desde`). */
export function diasEntre(desde: string, hasta: string): number {
  const aFecha = (iso: string) => {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d).getTime();
  };
  return Math.round((aFecha(hasta) - aFecha(desde)) / 86_400_000);
}

/** -3 → "Venció hace 3 días", 0 → "Vence hoy", 1 → "Vence mañana", 5 → "Vence en 5 días". */
export function textoDias(dias: number): string {
  if (dias < 0) return `Venció hace ${-dias} día${dias === -1 ? "" : "s"}`;
  if (dias === 0) return "Vence hoy";
  if (dias === 1) return "Vence mañana";
  return `Vence en ${dias} días`;
}

/** Cuándo es un plazo o una tarea. Las tareas no "vencen": se dice para cuándo son o cuánto se atrasaron. */
export function textoPendiente(dias: number, tipo: "plazo" | "tarea"): string {
  if (tipo === "plazo") return textoDias(dias);
  if (dias < 0) return `Atrasada ${-dias} día${dias === -1 ? "" : "s"}`;
  if (dias === 0) return "Para hoy";
  if (dias === 1) return "Para mañana";
  return `En ${dias} días`;
}

/** Días hasta la fecha (negativo si ya pasó). */
export function diasHasta(iso: string): number {
  return diasEntre(hoyIso(), iso);
}

/** Suma días a una fecha yyyy-mm-dd; si `habiles`, saltea sábados, domingos y feriados nacionales. */
export function sumarDias(iso: string, dias: number, habiles = false): string {
  const [y, m, d] = iso.split("-").map(Number);
  const fecha = new Date(y, m - 1, d);
  const aIso = () =>
    `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`;
  let restantes = dias;
  while (restantes > 0) {
    fecha.setDate(fecha.getDate() + 1);
    const dia = fecha.getDay();
    if (!habiles || (dia !== 0 && dia !== 6 && !feriado(aIso()))) restantes--;
  }
  return aIso();
}

/** Hoy en formato yyyy-mm-dd (hora local). */
export function hoyIso(): string {
  return new Date().toLocaleDateString("en-CA");
}

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

/** "2026-03-01" → "1 de marzo de 2026", para el cuerpo de la carta. */
export function fechaLarga(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return "";
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return `${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`;
}

/**
 * Interpreta montos escritos a la argentina: "450.000", "1.250,50", "$ 3000".
 * Un punto solo es separador de miles si le siguen grupos de 3 dígitos
 * ("1.500" = 1500); si no, es decimal ("1.5" = 1,5).
 */
export function parsearMonto(texto: string): number | null {
  const limpio = texto.replace(/[^\d.,]/g, "");
  if (!/\d/.test(limpio)) return null;
  let normalizado = limpio;
  if (limpio.includes(",")) normalizado = limpio.replace(/\./g, "").replace(",", ".");
  else if (/^\d{1,3}(\.\d{3})+$/.test(limpio)) normalizado = limpio.replace(/\./g, "");
  const numero = Number(normalizado);
  return Number.isFinite(numero) && numero > 0 ? numero : null;
}

const pesos = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
});

/** 450000 → "$ 450.000,00" (con espacio normal, apto para copiar). */
export function formatearPesos(monto: number): string {
  return pesos.format(monto).replace(/\s/g, " ");
}

/** Primera letra en mayúscula y punto final. */
export function oracion(texto: string): string {
  const t = texto.trim().replace(/\s+/g, " ");
  if (!t) return "";
  const conMayuscula = t.charAt(0).toUpperCase() + t.slice(1);
  return /[.!?]$/.test(conMayuscula) ? conMayuscula : `${conMayuscula}.`;
}

/** ["a", "b", "c"] → "a, b y c". */
export function enumerar(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} y ${items[items.length - 1]}`;
}
