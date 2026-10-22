import { describe, expect, it } from "vitest";
import { coincide } from "./buscar";
import type { Caso } from "./tipos";

function caso(parcial: Partial<Caso>): Caso {
  return {
    id: "caso",
    cliente: "Marta Ríos",
    contacto: "",
    empleador: "Textil Sur SA",
    tipoReclamo: "Despido sin causa",
    estado: "consulta",
    fechaApertura: "2026-10-01",
    vencimientos: [],
    notas: "",
    historial: [],
    cartas: [],
    hojaRuta: null,
    ...parcial,
  };
}

describe("coincide", () => {
  it("busca en el cliente y el empleador, sin importar mayúsculas ni tildes", () => {
    const c = caso({});
    expect(coincide(c, "rios")).toBe(true);
    expect(coincide(c, "MARTA")).toBe(true);
    expect(coincide(c, "textil")).toBe(true);
    expect(coincide(c, "pérez")).toBe(false);
  });

  it("busca en el expediente", () => {
    expect(coincide(caso({ expediente: "CNT 12345/2026" }), "12345")).toBe(true);
  });

  it("todas las palabras tienen que estar, en cualquier orden", () => {
    const c = caso({});
    expect(coincide(c, "rios marta")).toBe(true);
    expect(coincide(c, "marta logistica")).toBe(false);
  });

  it("sin texto, coinciden todos", () => {
    expect(coincide(caso({}), "   ")).toBe(true);
  });
});
