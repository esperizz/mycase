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
