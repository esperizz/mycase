/**
 * Feriados nacionales argentinos (Ley 27.399), calculados por año.
 * No incluye días no laborables (ej. Jueves Santo) ni feriados provinciales.
 */

/**
 * Días no laborables con fines turísticos ("puentes"): se fijan por decreto cada año,
 * así que hay que agregarlos a mano cuando se publican.
 */
const PUENTES: Record<number, string[]> = {
  2026: ["2026-03-23", "2026-07-10", "2026-12-07"],
};

const iso = (anio: number, mes: number, dia: number) =>
  `${anio}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;

/** Domingo de Pascua (algoritmo de Meeus/Jones/Butcher, calendario gregoriano). */
function pascua(anio: number): Date {
  const a = anio % 19;
  const b = Math.floor(anio / 100);
  const c = anio % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31);
  const dia = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(anio, mes - 1, dia);
}

function desplazar(fecha: Date, dias: number): string {
  const d = new Date(fecha);
  d.setDate(d.getDate() + dias);
  return iso(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

/** Trasladables: martes o miércoles → lunes anterior; jueves o viernes → lunes siguiente. */
function trasladable(anio: number, mes: number, dia: number): string {
  const fecha = new Date(anio, mes - 1, dia);
  const corrimiento: Record<number, number> = { 2: -1, 3: -2, 4: 4, 5: 3 };
  return desplazar(fecha, corrimiento[fecha.getDay()] ?? 0);
}

const cache = new Map<number, Map<string, string>>();

/** Feriados del año: fecha yyyy-mm-dd → nombre. */
export function feriadosDelAnio(anio: number): Map<string, string> {
  const guardado = cache.get(anio);
  if (guardado) return guardado;

  const domingoPascua = pascua(anio);
  const lista: [string, string][] = [
    [iso(anio, 1, 1), "Año Nuevo"],
    [desplazar(domingoPascua, -48), "Carnaval"],
    [desplazar(domingoPascua, -47), "Carnaval"],
    [iso(anio, 3, 24), "Día Nacional de la Memoria por la Verdad y la Justicia"],
    [iso(anio, 4, 2), "Día del Veterano y de los Caídos en la Guerra de Malvinas"],
    [desplazar(domingoPascua, -2), "Viernes Santo"],
    [iso(anio, 5, 1), "Día del Trabajador"],
    [iso(anio, 5, 25), "Día de la Revolución de Mayo"],
    [trasladable(anio, 6, 17), "Paso a la Inmortalidad del General Güemes"],
    [iso(anio, 6, 20), "Paso a la Inmortalidad del General Belgrano"],
    [iso(anio, 7, 9), "Día de la Independencia"],
    [trasladable(anio, 8, 17), "Paso a la Inmortalidad del General San Martín"],
    [trasladable(anio, 10, 12), "Día del Respeto a la Diversidad Cultural"],
    [trasladable(anio, 11, 20), "Día de la Soberanía Nacional"],
    [iso(anio, 12, 8), "Inmaculada Concepción de María"],
    [iso(anio, 12, 25), "Navidad"],
    ...(PUENTES[anio] ?? []).map((f): [string, string] => [f, "Feriado puente turístico"]),
  ];

  const feriados = new Map(lista);
  cache.set(anio, feriados);
  return feriados;
}

/** Nombre del feriado si la fecha yyyy-mm-dd es feriado nacional; si no, null. */
export function feriado(fecha: string): string | null {
  return feriadosDelAnio(Number(fecha.slice(0, 4))).get(fecha) ?? null;
}

/** El primer feriado desde `desde` (inclusive), dentro de este año o el siguiente. */
export function proximoFeriado(desde: string): { fecha: string; nombre: string } | null {
  const anio = Number(desde.slice(0, 4));
  const candidatos = [...feriadosDelAnio(anio), ...feriadosDelAnio(anio + 1)]
    .filter(([fecha]) => fecha >= desde)
    .sort(([a], [b]) => a.localeCompare(b));
  return candidatos.length ? { fecha: candidatos[0][0], nombre: candidatos[0][1] } : null;
}
