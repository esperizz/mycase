import { describe, expect, it } from "vitest";
import { cartasDe, nuevaCarta } from "./cartas";
import { cartaVacia, type Caso } from "./tipos";

function caso(parcial: Partial<Caso> = {}): Caso {
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
    cartas: [],
    hojaRuta: null,
    ...parcial,
  };
}

describe("cartasDe", () => {
  it("la carta única de antes pasa a ser la primera intimación del caso, con id fijo", () => {
    const vieja = { remitenteDomicilio: "Av. Siempre Viva 742", enviadaEl: "2026-10-01" };
    const [carta, ...resto] = cartasDe({ carta: vieja });
    expect(resto).toEqual([]);
    expect(carta).toMatchObject({ id: "inicial", tipo: "intimacion", remitenteDomicilio: "Av. Siempre Viva 742", enviadaEl: "2026-10-01" });
    expect(carta.consecuencias).toEqual([]);
    expect(cartasDe({ carta: vieja })[0].id).toBe("inicial");
  });

  it("si ya hay lista de cartas, la carta vieja se ignora", () => {
    const nueva = cartaVacia("liquidacion", "x");
    expect(cartasDe({ cartas: [nueva], carta: { enviadaEl: "2026-10-01" } })).toEqual([nueva]);
  });

  it("completa los campos que falten y sin nada devuelve una lista vacía", () => {
    expect(cartasDe({ cartas: [{ id: "a", tipo: "otra" }] })[0]).toMatchObject({ id: "a", tipo: "otra", plazo: "10d" });
    expect(cartasDe({})).toEqual([]);
    expect(cartasDe({ carta: null })).toEqual([]);
  });
});

describe("nuevaCarta", () => {
  const ids = () => "nueva";

  it("trae los domicilios y documentos de la última carta, pero no lo demás", () => {
    const anterior = {
      ...cartaVacia("intimacion", "a"),
      remitenteDomicilio: "Calle 1",
      destinatarioDocumento: "30-1",
      hechosDescripcion: "Me despidieron",
      enviadaEl: "2026-10-01",
    };
    const nueva = nuevaCarta(caso({ cartas: [anterior] }), "liquidacion", ids);
    expect(nueva).toMatchObject({ id: "nueva", tipo: "liquidacion", remitenteDomicilio: "Calle 1", destinatarioDocumento: "30-1" });
    expect(nueva.hechosDescripcion).toBe("");
    expect(nueva.enviadaEl).toBe("");
  });

  it("el despido indirecto toma como fecha la de la última carta enviada", () => {
    const cartas = [
      { ...cartaVacia("intimacion", "a"), enviadaEl: "2026-10-01" },
      { ...cartaVacia("otra", "b"), enviadaEl: "2026-10-05" },
      cartaVacia("otra", "c"),
    ];
    expect(nuevaCarta(caso({ cartas }), "despido-indirecto", ids).hechosFecha).toBe("2026-10-05");
    expect(nuevaCarta(caso(), "despido-indirecto", ids).hechosFecha).toBe("");
  });
});
