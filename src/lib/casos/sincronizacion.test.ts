import { describe, expect, it } from "vitest";
import { cambiosVencimientos, diferencias, fusionar, fusionarCarga, fusionarPorId, iguales } from "./sincronizacion";
import type { Caso, Vencimiento } from "./tipos";

function caso(parcial: Partial<Caso> = {}): Caso {
  return {
    id: "c1",
    cliente: "Marta Ríos",
    contacto: "",
    empleador: "Fábrica",
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

function venc(id: string, parcial: Partial<Vencimiento> = {}): Vencimiento {
  return { id, fecha: "2026-10-25", descripcion: "Contestar", cumplido: false, tipo: "plazo", ...parcial };
}

const nota = (id: string, texto = "algo") => ({ id, fecha: "2026-10-20T10:00", texto });

describe("iguales", () => {
  it("no le importa el orden de las claves", () => {
    expect(iguales({ a: 1, b: { c: [1, 2] } }, { b: { c: [1, 2] }, a: 1 })).toBe(true);
  });

  it("distingue valores y orden de listas", () => {
    expect(iguales({ a: 1 }, { a: 2 })).toBe(false);
    expect(iguales([1, 2], [2, 1])).toBe(false);
    expect(iguales(null, {})).toBe(false);
  });
});

describe("diferencias", () => {
  it("devuelve solo los campos que cambiaron", () => {
    expect(diferencias({ a: 1, b: "x", c: { d: 1 } }, { a: 1, b: "y", c: { d: 1 } })).toEqual({ b: "x" });
  });
});

describe("cambiosVencimientos", () => {
  it("sin versión guardada, todos son nuevos", () => {
    const actual = caso({ vencimientos: [venc("v1"), venc("v2")] });
    expect(cambiosVencimientos(actual, undefined)).toEqual({
      nuevos: actual.vencimientos,
      modificados: [],
      quitados: [],
    });
  });

  it("no manda los que no cambiaron (así no pisa lo que se tildó en otro dispositivo)", () => {
    const anterior = caso({ vencimientos: [venc("v1"), venc("v2")] });
    const actual = caso({ ...anterior, historial: [nota("n1")] });
    expect(cambiosVencimientos(actual, anterior)).toEqual({ nuevos: [], modificados: [], quitados: [] });
  });

  it("de los modificados manda solo los campos tocados", () => {
    const anterior = caso({ vencimientos: [venc("v1"), venc("v2")] });
    const actual = caso({ vencimientos: [venc("v1", { cumplido: true }), venc("v3")] });
    expect(cambiosVencimientos(actual, anterior)).toEqual({
      nuevos: [venc("v3")],
      modificados: [{ id: "v1", cambios: { cumplido: true } }],
      quitados: ["v2"],
    });
  });
});

describe("fusionarPorId", () => {
  it("suma lo agregado de los dos lados y respeta lo quitado de cada uno", () => {
    const base = [nota("a"), nota("b"), nota("c")];
    const local = [nota("a"), nota("c"), nota("local")]; // quitó b
    const remoto = [nota("a"), nota("b"), nota("remota")]; // quitó c
    expect(fusionarPorId(base, local, remoto).map((n) => n.id)).toEqual(["a", "remota", "local"]);
  });

  it("fusiona campo por campo los que cambiaron en los dos lados", () => {
    const base = [venc("v1")];
    const local = [venc("v1", { descripcion: "Contestar demanda" })];
    const remoto = [venc("v1", { cumplido: true })];
    expect(fusionarPorId(base, local, remoto)).toEqual([
      venc("v1", { descripcion: "Contestar demanda", cumplido: true }),
    ]);
  });
});

describe("fusionar", () => {
  it("el escenario compu + celular: la nota de la compu no destilda lo que se tildó en el celular", () => {
    const base = caso({ vencimientos: [venc("v1")] });
    const local = caso({ ...base, historial: [nota("n1")] }); // compu: agrega nota
    const remoto = caso({ ...base, vencimientos: [venc("v1", { cumplido: true })] }); // celular: tilda
    expect(fusionar(base, local, remoto)).toEqual(
      caso({ vencimientos: [venc("v1", { cumplido: true })], historial: [nota("n1")] }),
    );
  });

  it("gana lo local en lo que cambió acá y lo remoto en el resto", () => {
    const base = caso();
    const local = caso({ estado: "intimacion" });
    const remoto = caso({ contacto: "11 5555-5555", estado: "mediacion" });
    expect(fusionar(base, local, remoto)).toMatchObject({ contacto: "11 5555-5555", estado: "intimacion" });
  });

  it("fusiona la hoja de ruta paso por paso", () => {
    const hoja = { cumplidos: {}, avisados: {}, rechazo: false, inicioAvisado: "", vencimientos: {} };
    const base = caso({ hojaRuta: hoja });
    const local = caso({ hojaRuta: { ...hoja, cumplidos: { denuncia: "2026-10-20" } } });
    const remoto = caso({ hojaRuta: { ...hoja, cumplidos: { alta: "2026-10-19" } } });
    expect(fusionar(base, local, remoto).hojaRuta?.cumplidos).toEqual({
      alta: "2026-10-19",
      denuncia: "2026-10-20",
    });
  });

  it("sin base (caso nuevo) queda lo local", () => {
    const local = caso({ cliente: "Otra" });
    expect(fusionar(undefined, local, caso())).toBe(local);
  });
});

describe("fusionarCarga", () => {
  it("sin cambios locales queda exactamente lo de Supabase", () => {
    const guardado = caso({ vencimientos: [venc("v1")] });
    const remoto = caso({ vencimientos: [venc("v1", { cumplido: true })] });
    const otro = caso({ id: "c2", cliente: "Cargado en el celular" });
    expect(fusionarCarga([guardado], new Map([["c1", guardado]]), [remoto, otro])).toEqual([remoto, otro]);
  });

  it("conserva los cambios sin guardar y los casos nuevos todavía no subidos", () => {
    const guardado = caso();
    const local = caso({ estado: "demanda" });
    const nuevo = caso({ id: "c3", cliente: "Recién cargado" });
    const remoto = caso({ contacto: "mail@x.com" });
    expect(fusionarCarga([local, nuevo], new Map([["c1", guardado]]), [remoto])).toEqual([
      caso({ estado: "demanda", contacto: "mail@x.com" }),
      nuevo,
    ]);
  });

  it("saca los casos que se borraron en otro dispositivo", () => {
    const guardado = caso();
    expect(fusionarCarga([guardado], new Map([["c1", guardado]]), [])).toEqual([]);
  });
});
