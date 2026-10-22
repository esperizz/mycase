import { describe, expect, it } from "vitest";
import { cumplirPaso, hojaRutaVacia } from "./hojaRuta";
import { mensajeParaCliente, notaInforme } from "./informarCliente";
import type { Caso } from "./tipos";

function caso(parcial: Partial<Caso>): Caso {
  return {
    id: "caso",
    cliente: "marta ríos",
    contacto: "",
    empleador: "Textil Sur",
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

const ids = () => "v";

describe("mensajeParaCliente sin novedades", () => {
  it("saluda por el primer nombre, dice que no hay novedades y cierra con que le va a avisar", () => {
    const m = mensajeParaCliente(caso({}));
    expect(m.startsWith("Hola Marta, revisé tu caso y no hay novedades.")).toBe(true);
    expect(m.endsWith("Apenas haya algo te aviso.")).toBe(true);
  });

  it("una novedad en blanco cuenta como sin novedades", () => {
    expect(mensajeParaCliente(caso({}), "   ")).toBe(mensajeParaCliente(caso({})));
  });

  it("explica la etapa de un despido en palabras simples", () => {
    expect(mensajeParaCliente(caso({ estado: "consulta" }))).toContain("Estamos analizando tu caso.");
    expect(mensajeParaCliente(caso({ estado: "intimacion" }))).toContain("Le mandamos la carta a tu empleador");
    expect(mensajeParaCliente(caso({ estado: "mediacion" }))).toContain("mediación");
    expect(mensajeParaCliente(caso({ estado: "demanda" }))).toContain("El juicio está en marcha.");
  });

  it("en ART usa el paso actual de la hoja de ruta, sin términos técnicos", () => {
    let art = caso({ tipoReclamo: "Accidente de trabajo", hojaRuta: hojaRutaVacia() });
    art = cumplirPaso(art, "denuncia", "2026-10-01", { crearId: ids });
    const m = mensajeParaCliente(art);
    expect(m).toContain("Ahora estamos en: la ART decide si acepta.");
    expect(m).toContain("La ART tiene 10 días hábiles para aceptar o rechazar.");
    expect(m).not.toContain("Aceptación o rechazo");
  });

  it("en ART sin hoja de ruta empezada habla de la etapa inicial", () => {
    expect(mensajeParaCliente(caso({ tipoReclamo: "Accidente de trabajo" }))).toContain("Estamos analizando tu caso.");
  });
});

describe("mensajeParaCliente con una novedad", () => {
  it("cuenta la novedad como oración, después la etapa, y cierra con que le va contando", () => {
    const m = mensajeParaCliente(caso({ estado: "intimacion" }), "la empresa contestó la carta");
    expect(m).toBe(
      [
        "Hola Marta, te cuento cómo va tu caso.",
        "La empresa contestó la carta.",
        "Le mandamos la carta a tu empleador y estamos esperando que responda.",
        "Te voy contando.",
      ].join("\n\n"),
    );
  });
});

describe("notaInforme", () => {
  it("anota si fue sin novedades o cuál fue la novedad", () => {
    expect(notaInforme()).toBe("Le informé: sin novedades.");
    expect(notaInforme("  ")).toBe("Le informé: sin novedades.");
    expect(notaInforme("la empresa contestó la carta")).toBe("Le informé: la empresa contestó la carta.");
  });
});
