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

/** Días hasta la fecha (negativo si ya pasó). */
export function diasHasta(iso: string): number {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const [y, m, d] = iso.split("-").map(Number);
  const fecha = new Date(y, m - 1, d);
  return Math.round((fecha.getTime() - hoy.getTime()) / 86_400_000);
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
