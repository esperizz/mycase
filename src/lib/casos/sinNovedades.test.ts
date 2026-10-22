import { describe, expect, it } from "vitest";
import { cumplirPaso, hojaRutaVacia } from "./hojaRuta";
import { mensajeSinNovedades, NOTA_SIN_NOVEDADES } from "./sinNovedades";
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

describe("mensajeSinNovedades", () => {
  it("saluda por el primer nombre, dice que no hay novedades y cierra con que le va a avisar", () => {
    const m = mensajeSinNovedades(caso({}));
    expect(m.startsWith("Hola Marta, revisé tu caso y no hay novedades.")).toBe(true);
    expect(m.endsWith("Apenas haya algo te aviso.")).toBe(true);
  });

  it("explica la etapa de un despido en palabras simples", () => {
    expect(mensajeSinNovedades(caso({ estado: "consulta" }))).toContain("Estamos analizando tu caso.");
    expect(mensajeSinNovedades(caso({ estado: "intimacion" }))).toContain("Le mandamos la carta a tu empleador");
    expect(mensajeSinNovedades(caso({ estado: "mediacion" }))).toContain("mediación");
    expect(mensajeSinNovedades(caso({ estado: "demanda" }))).toContain("El juicio está en marcha.");
  });

  it("en ART usa el paso actual de la hoja de ruta", () => {
    let art = caso({ tipoReclamo: "Accidente de trabajo", hojaRuta: hojaRutaVacia() });
    art = cumplirPaso(art, "denuncia", "2026-10-01", { crearId: ids });
    const m = mensajeSinNovedades(art);
    expect(m).toContain("Ahora estamos en: la ART decide si acepta.");
    expect(m).toContain("La ART tiene 10 días hábiles para aceptar o rechazar.");
  });

  it("en ART sin hoja de ruta empezada habla de la etapa inicial", () => {
    const m = mensajeSinNovedades(caso({ tipoReclamo: "Accidente de trabajo" }));
    expect(m).toContain("Estamos analizando tu caso.");
  });

  it("no usa términos técnicos de la hoja de ruta", () => {
    let art = caso({ tipoReclamo: "Accidente de trabajo", hojaRuta: hojaRutaVacia() });
    art = cumplirPaso(art, "denuncia", "2026-10-01", { crearId: ids });
    expect(mensajeSinNovedades(art)).not.toContain("Aceptación o rechazo");
  });
});

describe("NOTA_SIN_NOVEDADES", () => {
  it("es lo que queda en el historial del caso", () => {
    expect(NOTA_SIN_NOVEDADES).toBe("Le avisé: sin novedades.");
  });
});
