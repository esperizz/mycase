import { describe, expect, it } from "vitest";
import { consecuenciasPara, INFO_TIPO, TIPOS_CARTA } from "./cartaCatalogo";
import { generarCarta } from "./generarCarta";
import { cartaVacia, type CartaDatos, type Caso, type TipoCarta } from "./tipos";

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

function carta(tipo: TipoCarta, parcial: Partial<CartaDatos> = {}): CartaDatos {
  return { ...cartaVacia(tipo, "c1"), ...parcial };
}

const HOY = new Date(2026, 9, 22);

// Ley 27.742 (2024): derogó la Ley 25.323 y los arts. 8 a 17 de la Ley 24.013.
// Ver docs/investigacion/cartas-leyes-derogadas.md.
const DEROGADAS = /25\.323|24\.013/;

describe("cartas sin leyes derogadas", () => {
  it.each(Object.keys(INFO_TIPO))("la carta de %s no cita leyes derogadas", (tipoReclamo) => {
    for (const t of TIPOS_CARTA) {
      expect(generarCarta(caso({ tipoReclamo }), carta(t.id), HOY).cuerpo).not.toMatch(DEROGADAS);
    }
  });

  it.each(Object.keys(INFO_TIPO))("no se ofrecen consecuencias derogadas para %s", (tipoReclamo) => {
    for (const c of consecuenciasPara(tipoReclamo)) {
      expect(`${c.titulo} ${c.texto}`).not.toMatch(DEROGADAS);
    }
  });

  it("una carta guardada con una consecuencia que ya no existe la omite", () => {
    const { cuerpo } = generarCarta(caso(), carta("intimacion", { consecuencias: ["ley-25323", "judicial"] }), HOY);
    expect(cuerpo).toContain("Bajo apercibimiento de iniciar las acciones judiciales laborales correspondientes.");
    expect(cuerpo).not.toMatch(DEROGADAS);
  });
});

describe("tipos de carta", () => {
  it("la intimación usa el texto propio del tipo de reclamo", () => {
    const { cuerpo } = generarCarta(caso(), carta("intimacion"), HOY);
    expect(cuerpo).toContain(INFO_TIPO["Despido sin causa"].intro);
    expect(cuerpo).toContain("INTIMO a Ud.");
  });

  it("el despido indirecto se apoya en la carta anterior y en el silencio o la negativa", () => {
    const silencio = generarCarta(caso(), carta("despido-indirecto", { hechosFecha: "2026-10-01" }), HOY).cuerpo;
    expect(silencio).toContain("Ante su silencio a mi intimación de fecha 1 de octubre de 2026");
    expect(silencio).toContain("me considero gravemente injuriado/a y despedido/a por su exclusiva culpa");
    expect(silencio).toContain("arts. 242 y 246");

    const negativa = generarCarta(caso(), carta("despido-indirecto", { respuesta: "negativa" }), HOY).cuerpo;
    expect(negativa).toContain("Ante su respuesta negativa a mi intimación de fecha [fecha de la carta anterior]");
  });

  it("el despido indirecto intima el pago de las indemnizaciones y los certificados, con monto si lo hay", () => {
    const { cuerpo } = generarCarta(caso(), carta("despido-indirecto", { pedidoMonto: "1.500.000" }), HOY);
    expect(cuerpo).toContain("indemnizaciones por antigüedad, preaviso e integración del mes de despido");
    expect(cuerpo).toContain("$ 1.500.000");
    expect(cuerpo).toContain("art. 80");
  });

  it("la de liquidación pide la liquidación final y los certificados", () => {
    const { cuerpo } = generarCarta(caso(), carta("liquidacion", { hechosFecha: "2026-09-15" }), HOY);
    expect(cuerpo).toContain("ocurrida el 15 de septiembre de 2026");
    expect(cuerpo).toContain("abone la liquidación final");
    expect(cuerpo).toContain("art. 80");
  });

  it("la de otro tipo usa el pedido escrito a mano", () => {
    const { cuerpo } = generarCarta(caso(), carta("otra", { pedidoDetalle: "me reintegre a mi puesto de trabajo" }), HOY);
    expect(cuerpo).toContain("INTIMO a Ud. para que dentro del plazo de 10 días hábiles de recibida la presente me reintegre a mi puesto de trabajo.");
  });
});
