import { describe, expect, it } from "vitest";
import { VENCE_INTIMACION } from "./cartaCatalogo";
import { mensajeParaCliente, notaInforme } from "./informarCliente";
import type { Caso, Vencimiento } from "./tipos";

const HOY = "2026-10-22";

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

function vto(parcial: Partial<Vencimiento>): Vencimiento {
  return { id: Math.random().toString(36), fecha: "2026-11-02", descripcion: "", cumplido: false, tipo: "plazo", ...parcial };
}

describe("mensajeParaCliente sin novedades", () => {
  it("saluda por el primer nombre, dice que no hay novedades, qué sigue, y cierra con que le va a avisar", () => {
    expect(mensajeParaCliente(caso({}), "", HOY)).toBe(
      [
        "Hola Marta, no hay novedades en tu caso.",
        "Estoy revisando tu caso y la documentación que me mandaste. Lo que sigue: mandarle una carta a tu empleador para reclamarle formalmente.",
        "Apenas haya algo te aviso.",
      ].join("\n\n"),
    );
  });

  it("una novedad en blanco cuenta como sin novedades", () => {
    expect(mensajeParaCliente(caso({}), "   ", HOY)).toBe(mensajeParaCliente(caso({}), "", HOY));
  });

  it("explica cada etapa en palabras simples", () => {
    expect(mensajeParaCliente(caso({ estado: "intimacion" }), "", HOY)).toContain("Le mandamos la carta a tu empleador.");
    expect(mensajeParaCliente(caso({ estado: "mediacion" }), "", HOY)).toContain("reunión obligatoria con la empresa");
    expect(mensajeParaCliente(caso({ estado: "demanda" }), "", HOY)).toContain("El juicio está en marcha.");
  });

  it("en intimación dice hasta cuándo tiene el empleador para responder, si la carta se marcó como enviada", () => {
    const c = caso({
      estado: "intimacion",
      vencimientos: [vto({ fecha: "2026-11-03", descripcion: `${VENCE_INTIMACION} (10 días hábiles)` })],
    });
    expect(mensajeParaCliente(c, "", HOY)).toContain(
      "Lo que sigue: esperar su respuesta. Tiene tiempo hasta el 3 de noviembre.",
    );
  });

  it("menciona la próxima audiencia con su hora y lugar", () => {
    const c = caso({
      estado: "demanda",
      vencimientos: [
        vto({ fecha: "2026-10-20", descripcion: "Audiencia" }), // ya pasó
        vto({ fecha: "2026-12-01", descripcion: "Audiencia" }),
        vto({ fecha: "2026-11-02", descripcion: "Audiencia", hora: "09:30", lugar: "Juzgado 45" }),
        vto({ fecha: "2026-10-25", descripcion: "Presentar escrito" }),
      ],
    });
    expect(mensajeParaCliente(c, "", HOY)).toContain("La próxima audiencia es el 2 de noviembre a las 9:30 en Juzgado 45.");
  });

  it("una audiencia sin hora ni lugar se menciona solo con la fecha; las cumplidas no", () => {
    const sinDatos = caso({ vencimientos: [vto({ descripcion: "Audiencia de mediación" })] });
    expect(mensajeParaCliente(sinDatos, "", HOY)).toContain("La próxima audiencia es el 2 de noviembre.");
    const cumplida = caso({ vencimientos: [vto({ descripcion: "Audiencia", cumplido: true })] });
    expect(mensajeParaCliente(cumplida, "", HOY)).not.toContain("audiencia");
  });
});

describe("mensajeParaCliente con una novedad", () => {
  it("cuenta la novedad como oración, después la etapa, y cierra con que le va contando", () => {
    const m = mensajeParaCliente(caso({ estado: "demanda" }), "el juzgado fijó fecha", HOY);
    expect(m).toBe(
      [
        "Hola Marta, te cuento cómo va tu caso.",
        "El juzgado fijó fecha.",
        "El juicio está en marcha. Son procesos largos y es normal que pasen semanas sin movimientos.",
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
