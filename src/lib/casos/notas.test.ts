import { describe, expect, it } from "vitest";
import { migrarNotas, ordenarNotas } from "./notas";
import type { Caso } from "./tipos";

function caso(parcial: Partial<Caso> = {}): Caso {
  return {
    id: "c1",
    cliente: "Marta Ríos",
    contacto: "",
    empleador: "Fábrica",
    tipoReclamo: "Despido sin causa",
    estado: "consulta",
    fechaApertura: "2026-10-01",
    vencimientos: [],
    notas: "",
    historial: [],
    carta: null,
    hojaRuta: null,
    ...parcial,
  };
}

describe("notas", () => {
  it("pasa la nota vieja al historial con la fecha de apertura", () => {
    const c = migrarNotas(caso({ notas: "  Llamó el lunes  " }), () => "n1");
    expect(c.notas).toBe("");
    expect(c.historial).toEqual([{ id: "n1", fecha: "2026-10-01T00:00", texto: "Llamó el lunes" }]);
  });

  it("no toca nada si ya hay historial o no había nota", () => {
    const conHistorial = caso({ notas: "vieja", historial: [{ id: "x", fecha: "2026-10-02T10:00", texto: "nueva" }] });
    expect(migrarNotas(conHistorial)).toBe(conHistorial);
    const vacio = caso();
    expect(migrarNotas(vacio)).toBe(vacio);
  });

  it("ordena de la más nueva a la más vieja", () => {
    const notas = [
      { id: "a", fecha: "2026-10-01T09:00", texto: "a" },
      { id: "b", fecha: "2026-10-03T09:00", texto: "b" },
      { id: "c", fecha: "2026-10-01T18:30", texto: "c" },
    ];
    expect(ordenarNotas(notas).map((n) => n.id)).toEqual(["b", "c", "a"]);
  });
});
