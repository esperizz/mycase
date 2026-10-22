import { describe, expect, it } from "vitest";
import { calendarioIcs } from "./calendario";
import type { Caso, Vencimiento } from "./tipos";

function caso(parcial: Partial<Caso> = {}): Caso {
  return {
    id: "caso",
    cliente: "Marta Ríos",
    contacto: "",
    empleador: "Textil Sur",
    tipoReclamo: "Despido sin causa",
    estado: "demanda",
    fechaApertura: "2026-10-01",
    vencimientos: [],
    notas: "",
    historial: [],
    cartas: [],
    hojaRuta: null,
    ...parcial,
  };
}

function vto(parcial: Partial<Vencimiento> = {}): Vencimiento {
  return { id: "v1", fecha: "2026-11-02", descripcion: "Audiencia", cumplido: false, tipo: "plazo", ...parcial };
}

const lineas = (ics: string) => ics.split("\r\n");

describe("calendarioIcs", () => {
  it("arma un calendario con saltos de línea CRLF, como pide el formato", () => {
    const ics = calendarioIcs([{ caso: caso(), vencimiento: vto() }]);
    expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
    expect(ics).not.toMatch(/[^\r]\n/);
  });

  it("sin hora, el evento ocupa todo el día", () => {
    const l = lineas(calendarioIcs([{ caso: caso(), vencimiento: vto() }]));
    expect(l).toContain("DTSTART;VALUE=DATE:20261102");
    expect(l).toContain("DTEND;VALUE=DATE:20261103");
  });

  it("con hora, dura una hora y lleva el lugar", () => {
    const l = lineas(calendarioIcs([{ caso: caso(), vencimiento: vto({ hora: "09:30", lugar: "Juzgado 45" }) }]));
    expect(l).toContain("DTSTART:20261102T093000");
    expect(l).toContain("DTEND:20261102T103000");
    expect(l).toContain("LOCATION:Juzgado 45");
  });

  it("dice de qué caso es y avisa el día anterior", () => {
    const l = lineas(calendarioIcs([{ caso: caso(), vencimiento: vto() }]));
    expect(l).toContain("SUMMARY:Audiencia · Marta Ríos");
    expect(l).toContain("UID:v1@mycase");
    expect(l).toContain("TRIGGER:-P1D");
  });

  it("escapa comas, punto y coma y saltos de línea", () => {
    const l = lineas(calendarioIcs([{ caso: caso(), vencimiento: vto({ lugar: "Lavalle 1268, piso 3; sala B" }) }]));
    expect(l).toContain("LOCATION:Lavalle 1268\\, piso 3\\; sala B");
  });

  it("puede llevar varios eventos juntos", () => {
    const ics = calendarioIcs([
      { caso: caso(), vencimiento: vto({ id: "a" }) },
      { caso: caso(), vencimiento: vto({ id: "b" }) },
    ]);
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(2);
  });
});
