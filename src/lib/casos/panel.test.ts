import { describe, expect, it } from "vitest";
import { armarPanel, titular } from "./panel";
import { cartaVacia, type Caso, type Vencimiento } from "./tipos";

const HOY = "2026-10-14";

function vto(fecha: string, cumplido = false, tipo: Vencimiento["tipo"] = "plazo"): Vencimiento {
  return { id: fecha, fecha, descripcion: `Vence ${fecha}`, cumplido, tipo };
}

function caso(parcial: Partial<Caso>): Caso {
  return {
    id: Math.random().toString(36),
    cliente: "Cliente",
    contacto: "",
    empleador: "Empleador",
    tipoReclamo: "Despido sin causa",
    estado: "consulta",
    fechaApertura: "2026-10-01",
    vencimientos: [],
    notas: "",
    carta: null,
    hojaRuta: null,
    ...parcial,
  };
}

describe("armarPanel", () => {
  it("separa vencidos, hoy y próximos 7 días, ordenados", () => {
    const panel = armarPanel(
      [
        caso({
          vencimientos: [
            vto("2026-10-10"),
            vto("2026-10-12"),
            vto("2026-10-14"),
            vto("2026-10-21"),
            vto("2026-10-22"),
            vto("2026-10-09", true),
          ],
        }),
      ],
      HOY,
    );
    expect(panel.vencidos.map((p) => p.dias)).toEqual([-4, -2]);
    expect(panel.hoy.map((p) => p.vencimiento.fecha)).toEqual(["2026-10-14"]);
    expect(panel.semana.map((p) => p.vencimiento.fecha)).toEqual(["2026-10-21"]);
  });

  it("ignora los casos cerrados", () => {
    const panel = armarPanel(
      [caso({ estado: "cerrado", vencimientos: [vto("2026-10-10")], carta: cartaVacia() })],
      HOY,
    );
    expect(panel.vencidos).toEqual([]);
    expect(panel.sinProximoPaso).toEqual([]);
    expect(panel.cartasSinEnviar).toEqual([]);
    expect(panel.activos).toBe(0);
    expect(panel.porEtapa.cerrado).toBe(1);
  });

  it("detecta casos sin próximo paso y cartas sin enviar", () => {
    const sinNada = caso({ cliente: "A", vencimientos: [vto("2026-10-01", true)] });
    const conVto = caso({ cliente: "B", vencimientos: [vto("2026-11-30")] });
    const cartaPendiente = caso({ cliente: "C", vencimientos: [vto("2026-11-30")], carta: cartaVacia() });
    const cartaEnviada = caso({
      cliente: "D",
      vencimientos: [vto("2026-11-30")],
      carta: { ...cartaVacia(), enviadaEl: "2026-10-01" },
    });
    const panel = armarPanel([sinNada, conVto, cartaPendiente, cartaEnviada], HOY);
    expect(panel.sinProximoPaso.map((c) => c.cliente)).toEqual(["A"]);
    expect(panel.cartasSinEnviar.map((c) => c.cliente)).toEqual(["C"]);
    expect(panel.activos).toBe(4);
  });

  it("cuenta aparte los casos de ART y no los da por perdidos si tienen la hoja de ruta en marcha", () => {
    const hoja = { cumplidos: { denuncia: "2026-10-01" }, avisados: {}, rechazo: false, inicioAvisado: "", vencimientos: {} };
    const artEnCurso = caso({ cliente: "ART1", tipoReclamo: "Accidente de trabajo", hojaRuta: hoja });
    const artSinEmpezar = caso({ cliente: "ART2", tipoReclamo: "Accidente de trabajo" });
    const artCerrado = caso({ cliente: "ART3", tipoReclamo: "Accidente de trabajo", estado: "cerrado" });
    const despido = caso({ cliente: "D", estado: "mediacion" });
    const panel = armarPanel([artEnCurso, artSinEmpezar, artCerrado, despido], HOY);
    expect(panel.art).toBe(2);
    expect(panel.porEtapa.cerrado).toBe(1);
    expect(panel.porEtapa.mediacion).toBe(1);
    expect(panel.porEtapa.consulta).toBe(0);
    expect(panel.sinProximoPaso.map((c) => c.cliente)).toEqual(["ART2", "D"]);
  });

  it("las tareas pasadas son atrasadas, no vencidos", () => {
    const panel = armarPanel([caso({ vencimientos: [vto("2026-10-10"), vto("2026-10-11", false, "tarea")] })], HOY);
    expect(panel.vencidos.map((p) => p.vencimiento.fecha)).toEqual(["2026-10-10"]);
    expect(panel.atrasadas.map((p) => p.vencimiento.fecha)).toEqual(["2026-10-11"]);
  });
});

describe("tarjetas del panel", () => {
  it("el próximo plazo es el vencido si hay, y si no el del día más cercano, aunque falte mucho", () => {
    const lejos = armarPanel([caso({ vencimientos: [vto("2026-12-01"), vto("2026-10-20", false, "tarea")] })], HOY);
    expect(lejos.proximosPlazos.map((p) => p.vencimiento.fecha)).toEqual(["2026-12-01"]);

    const coinciden = armarPanel(
      [caso({ vencimientos: [vto("2026-10-20"), { ...vto("2026-10-20"), id: "x" }, vto("2026-10-25")] })],
      HOY,
    );
    expect(coinciden.proximosPlazos).toHaveLength(2);

    const vencidos = armarPanel([caso({ vencimientos: [vto("2026-10-01"), vto("2026-10-10"), vto("2026-10-15")] })], HOY);
    expect(vencidos.proximosPlazos.map((p) => p.vencimiento.fecha)).toEqual(["2026-10-01", "2026-10-10"]);

    expect(armarPanel([caso({})], HOY).proximosPlazos).toEqual([]);
  });

});

describe("titular", () => {
  const con = (...vtos: Vencimiento[]) => titular(armarPanel([caso({ vencimientos: vtos })], HOY));

  it("nombra lo más urgente primero", () => {
    expect(con(vto("2026-10-10"), vto("2026-10-14"))).toBe("Tenés 1 plazo vencido.");
    expect(con(vto("2026-10-14"), { ...vto("2026-10-14"), id: "otro" })).toBe("Hoy vencen 2 plazos.");
    expect(con(vto("2026-10-10", false, "tarea"), vto("2026-10-16"))).toBe("Tenés 1 tarea atrasada.");
  });

  it("resume la semana separando plazos y tareas", () => {
    expect(con(vto("2026-10-16"), vto("2026-10-17", false, "tarea"), vto("2026-10-18", false, "tarea"))).toBe(
      "Esta semana vence 1 plazo y tenés 2 tareas.",
    );
    expect(con(vto("2026-10-16"), vto("2026-10-17"))).toBe("Esta semana vencen 2 plazos.");
    expect(con(vto("2026-10-14", false, "tarea"))).toBe("Esta semana tenés 1 tarea.");
    expect(con()).toBe("Estás al día.");
  });
});
