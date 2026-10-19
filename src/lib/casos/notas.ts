import type { Caso, Nota } from "./tipos";

/** Fecha y hora local en formato yyyy-mm-ddThh:mm. */
export function ahoraIso(): string {
  const d = new Date();
  const dos = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}T${dos(d.getHours())}:${dos(d.getMinutes())}`;
}

/** Más nuevas primero. */
export function ordenarNotas(notas: Nota[]): Nota[] {
  return [...notas].sort((a, b) => b.fecha.localeCompare(a.fecha));
}

/**
 * Antes cada caso tenía un solo texto de notas. Si todavía lo tiene y el historial está vacío,
 * ese texto pasa a ser la primera nota (con la fecha de apertura) y el campo viejo queda vacío.
 */
export function migrarNotas(caso: Caso, crearId: () => string = () => crypto.randomUUID()): Caso {
  if (caso.historial.length > 0 || !caso.notas.trim()) return caso;
  return {
    ...caso,
    notas: "",
    historial: [{ id: crearId(), fecha: `${caso.fechaApertura}T00:00`, texto: caso.notas.trim() }],
  };
}
