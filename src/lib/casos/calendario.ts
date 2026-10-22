import { sumarDias } from "./formato";
import type { Caso, Vencimiento } from "./tipos";

/**
 * Plazos y tareas como eventos de calendario (formato iCalendar, .ics), para que el celular
 * avise el día anterior aunque no se abra la app. Sin servicios externos: el archivo lo arma la app.
 */

/** Escapa lo que el formato no admite tal cual en un texto. */
function texto(t: string): string {
  return t.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

const sinGuiones = (iso: string) => iso.replace(/-/g, "");

/** "09:30" → "093000"; una hora después para el fin. */
function horas(hora: string): { inicio: string; fin: string } {
  const [h, m] = hora.split(":").map(Number);
  const dos = (n: number) => String(n).padStart(2, "0");
  return { inicio: `${dos(h)}${dos(m)}00`, fin: `${dos(Math.min(h + 1, 23))}${dos(m)}00` };
}

function evento(caso: Caso, v: Vencimiento): string[] {
  const titulo = `${v.descripcion || (v.tipo === "plazo" ? "Plazo" : "Tarea")} · ${caso.cliente}`;
  const cuando = v.hora
    ? (() => {
        const { inicio, fin } = horas(v.hora);
        // Hora local, sin zona: el calendario la toma en la hora del celular.
        return [`DTSTART:${sinGuiones(v.fecha)}T${inicio}`, `DTEND:${sinGuiones(v.fecha)}T${fin}`];
      })()
    : [`DTSTART;VALUE=DATE:${sinGuiones(v.fecha)}`, `DTEND;VALUE=DATE:${sinGuiones(sumarDias(v.fecha, 1))}`];
  return [
    "BEGIN:VEVENT",
    `UID:${v.id}@mycase`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "")}`,
    ...cuando,
    `SUMMARY:${texto(titulo)}`,
    ...(v.lugar?.trim() ? [`LOCATION:${texto(v.lugar.trim())}`] : []),
    `DESCRIPTION:${texto(`${v.tipo === "plazo" ? "Plazo" : "Tarea"} del caso de ${caso.cliente} contra ${caso.empleador}.`)}`,
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    `DESCRIPTION:${texto(titulo)}`,
    "TRIGGER:-P1D",
    "END:VALARM",
    "END:VEVENT",
  ];
}

export function calendarioIcs(items: { caso: Caso; vencimiento: Vencimiento }[]): string {
  const lineas = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//MyCase//Plazos//ES",
    "CALSCALE:GREGORIAN",
    ...items.flatMap(({ caso, vencimiento }) => evento(caso, vencimiento)),
    "END:VCALENDAR",
  ];
  return lineas.map((l) => `${l}\r\n`).join("");
}

/** Descarga el archivo: el celular o la compu lo abren con su app de calendario. */
export function descargarCalendario(items: { caso: Caso; vencimiento: Vencimiento }[], nombre: string) {
  const url = URL.createObjectURL(new Blob([calendarioIcs(items)], { type: "text/calendar;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${nombre}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}
