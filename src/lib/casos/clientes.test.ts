import { describe, expect, it } from "vitest";
import { clientesConocidos, otrosCasos } from "./clientes";
import type { Caso } from "./tipos";

function caso(parcial: Partial<Caso>): Caso {
  return {
    id: Math.random().toString(36),
    cliente: "Marta Ríos",
    contacto: "",
    empleador: "Textil Sur",
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

describe("otrosCasos", () => {
  it("encuentra los otros casos del mismo cliente, sin importar mayúsculas, tildes ni espacios", () => {
    const actual = caso({ id: "a", cliente: "Marta Ríos" });
    const mismo = caso({ id: "b", cliente: "  marta  rios " });
    const otro = caso({ id: "c", cliente: "Jorge Paz" });
    expect(otrosCasos(actual, [actual, mismo, otro]).map((c) => c.id)).toEqual(["b"]);
  });
});

describe("clientesConocidos", () => {
  it("un cliente por nombre, con el contacto del caso más reciente que lo tenga, ordenados", () => {
    const lista = clientesConocidos([
      caso({ cliente: "Marta Ríos", contacto: "11 1111", fechaApertura: "2026-01-01" }),
      caso({ cliente: "marta rios", contacto: "11 2222", fechaApertura: "2026-06-01" }),
      caso({ cliente: "Marta Ríos", contacto: "", fechaApertura: "2026-09-01" }),
      caso({ cliente: "Ana Gómez", contacto: "" }),
    ]);
    expect(lista).toEqual([
      { nombre: "Ana Gómez", contacto: "" },
      { nombre: "Marta Ríos", contacto: "11 2222" },
    ]);
  });
});
