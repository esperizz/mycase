import { describe, expect, it } from "vitest";
import { hojaRutaVacia } from "./hojaRuta";
import { MAXIMO_SUGERENCIAS, sugerencias } from "./sugerencias";
import type { Caso } from "./tipos";

function caso(parcial: Partial<Caso>): Caso {
  return {
    id: "caso",
    cliente: "Cliente",
    contacto: "",
    empleador: "Empleador",
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

describe("sugerencias", () => {
  it("suma las de la etapa y las del tipo de reclamo, primero las de la etapa", () => {
    expect(sugerencias(caso({ estado: "intimacion" }), "plazo")).toEqual([
      "Vence la intimación",
      "Recepción de la carta",
      "Pago de la indemnización",
      "Entrega de certificados",
    ]);
    expect(sugerencias(caso({ tipoReclamo: "Falta de pago de haberes", estado: "consulta" }), "tarea")).toEqual([
      "Pedir documentación",
      "Llamar al cliente",
      "Pedir recibos de sueldo",
    ]);
  });

  it("plazos y tareas tienen sugerencias distintas", () => {
    const c = caso({ estado: "demanda" });
    const plazos = sugerencias(c, "plazo");
    expect(sugerencias(c, "tarea").some((s) => plazos.includes(s))).toBe(false);
  });

  it("no muestra más del máximo ni repite", () => {
    const c = caso({ tipoReclamo: "Diferencias salariales", estado: "demanda" });
    for (const tipo of ["plazo", "tarea"] as const) {
      const lista = sugerencias(c, tipo);
      expect(lista.length).toBeLessThanOrEqual(MAXIMO_SUGERENCIAS);
      expect(new Set(lista).size).toBe(lista.length);
    }
    expect(sugerencias(c, "tarea")).toEqual(["Llamar al cliente", "Pedir documentación", "Revisar convenio colectivo", "Pedir recibos de sueldo"]);
  });

  it("en ART usa las propias de la ART, sin importar la etapa", () => {
    const art = caso({ tipoReclamo: "Accidente de trabajo", estado: "demanda" });
    expect(sugerencias(art, "plazo")).toEqual(["Discutir el alta", "Examen en comisión médica"]);
    expect(sugerencias(art, "tarea")).toContain("Pedir número de siniestro");
    // Un caso con hoja de ruta es de ART aunque el tipo diga otra cosa.
    expect(sugerencias(caso({ hojaRuta: hojaRutaVacia() }), "plazo")).toEqual(["Discutir el alta", "Examen en comisión médica"]);
  });

  it("un tipo sin sugerencias propias usa solo las de la etapa", () => {
    expect(sugerencias(caso({ tipoReclamo: "Otro", estado: "mediacion" }), "plazo")).toEqual(["Audiencia de mediación"]);
  });
});
