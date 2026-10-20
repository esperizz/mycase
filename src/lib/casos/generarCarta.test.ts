import { describe, expect, it } from "vitest";
import { consecuenciasPara, INFO_TIPO } from "./cartaCatalogo";
import { generarCarta } from "./generarCarta";
import { cartaVacia, type Caso } from "./tipos";

function caso(parcial: Partial<Caso>): Caso {
  return {
    id: "caso",
    cliente: "Marta Ríos",
    contacto: "",
    empleador: "Textil Sur",
    tipoReclamo: "Despido sin causa",
    estado: "consulta",
    fechaApertura: "2026-10-01",
    vencimientos: [],
    notas: "",
    historial: [],
    carta: cartaVacia(),
    hojaRuta: null,
    ...parcial,
  };
}

// Ley 27.742 (2024): derogó la Ley 25.323 y los arts. 8 a 17 de la Ley 24.013.
// Ver docs/investigacion/cartas-leyes-derogadas.md.
const DEROGADAS = /25\.323|24\.013/;

describe("cartas sin leyes derogadas", () => {
  it.each(Object.keys(INFO_TIPO))("la carta de %s no cita leyes derogadas", (tipoReclamo) => {
    const carta = generarCarta(caso({ tipoReclamo }));
    expect(carta.cuerpo).not.toMatch(DEROGADAS);
  });

  it.each(Object.keys(INFO_TIPO))("no se ofrecen consecuencias derogadas para %s", (tipoReclamo) => {
    for (const c of consecuenciasPara(tipoReclamo)) {
      expect(`${c.titulo} ${c.texto}`).not.toMatch(DEROGADAS);
    }
  });

  it("una carta guardada con una consecuencia que ya no existe la omite", () => {
    const carta = generarCarta(
      caso({ carta: { ...cartaVacia(), consecuencias: ["ley-25323", "judicial"] } }),
    );
    expect(carta.cuerpo).toContain("Bajo apercibimiento de iniciar las acciones judiciales laborales correspondientes.");
    expect(carta.cuerpo).not.toMatch(DEROGADAS);
  });
});
