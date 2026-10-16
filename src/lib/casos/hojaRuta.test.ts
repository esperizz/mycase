import { describe, expect, it } from "vitest";
import { cumplirPaso, deshacerPaso, linkWhatsApp, mensajeAviso, pasosDe, volverAPaso } from "./hojaRuta";
import type { Caso } from "./tipos";

function caso(parcial: Partial<Caso> = {}): Caso {
  return {
    id: "c1",
    cliente: "Marta Ríos",
    contacto: "11 5555-1234",
    empleador: "Fábrica",
    tipoReclamo: "Accidente de trabajo",
    estado: "consulta",
    fechaApertura: "2026-10-01",
    vencimientos: [],
    notas: "",
    carta: null,
    hojaRuta: null,
    ...parcial,
  };
}

let n = 0;
const crearId = () => `v${++n}`;

describe("hoja de ruta de ART", () => {
  it("arranca con la denuncia como paso actual", () => {
    const pasos = pasosDe(caso().hojaRuta ?? { cumplidos: {}, avisados: {}, rechazo: false, inicioAvisado: "", vencimientos: {} });
    expect(pasos[0]).toMatchObject({ id: "denuncia", estado: "actual" });
    expect(pasos.filter((p) => p.estado === "actual")).toHaveLength(1);
  });

  it("la denuncia abre el plazo de 10 días hábiles de la ART, y la respuesta lo cierra", () => {
    let c = cumplirPaso(caso(), "denuncia", "2026-10-13", { crearId });
    expect(c.vencimientos).toHaveLength(1);
    // 10 días hábiles desde el lunes 13/10/2026 (sin feriados en el medio).
    expect(c.vencimientos[0]).toMatchObject({ fecha: "2026-10-27", descripcion: "La ART tiene que aceptar o rechazar (estimado)", cumplido: false });
    c = cumplirPaso(c, "respuesta", "2026-10-20", { crearId });
    expect(c.vencimientos[0].cumplido).toBe(true);
  });

  it("si la ART rechaza, se suma la rama de la comisión médica después de la respuesta", () => {
    let c = cumplirPaso(caso(), "denuncia", "2026-10-13", { crearId });
    c = cumplirPaso(c, "respuesta", "2026-10-20", { rechazo: true, crearId });
    const ids = pasosDe(c.hojaRuta!).map((p) => p.id);
    expect(ids.slice(0, 4)).toEqual(["denuncia", "respuesta", "rechazo-cm", "rechazo-decision"]);
    expect(pasosDe(c.hojaRuta!).find((p) => p.estado === "actual")?.id).toBe("rechazo-cm");
    expect(mensajeAviso(c, "respuesta")).toContain("La ART rechazó");
  });

  it("deshacer un paso borra el plazo que abrió y vuelve a abrir el que cerró", () => {
    let c = cumplirPaso(caso(), "denuncia", "2026-10-13", { crearId });
    c = cumplirPaso(c, "respuesta", "2026-10-20", { rechazo: true, crearId });
    c = deshacerPaso(c, "respuesta");
    expect(c.hojaRuta!.rechazo).toBe(false);
    expect(c.vencimientos[0].cumplido).toBe(false);
    c = deshacerPaso(c, "denuncia");
    expect(c.vencimientos).toHaveLength(0);
  });

  it("volver a un paso deja pendientes ese y todos los que siguen", () => {
    let c = cumplirPaso(caso(), "denuncia", "2026-10-13", { crearId });
    c = cumplirPaso(c, "respuesta", "2026-10-20", { crearId });
    c = cumplirPaso(c, "tratamiento", "2026-10-21", { crearId });
    c = cumplirPaso(c, "alta", "2026-11-02", { crearId });
    expect(c.vencimientos.filter((v) => !v.cumplido)).toHaveLength(1); // plazo para discutir el alta
    c = volverAPaso(c, "tratamiento");
    expect(Object.keys(c.hojaRuta!.cumplidos)).toEqual(["denuncia", "respuesta"]);
    expect(pasosDe(c.hojaRuta!).find((p) => p.estado === "actual")?.id).toBe("tratamiento");
    expect(c.vencimientos.filter((v) => !v.cumplido)).toHaveLength(0);
  });

  it("el aviso cuenta qué pasó, qué sigue y qué tiene que hacer el cliente", () => {
    const c = cumplirPaso(caso(), "denuncia", "2026-10-13", { crearId });
    const texto = mensajeAviso(c, "denuncia");
    expect(texto).toContain("Hola Marta");
    expect(texto).toContain("✓ Avisamos a la ART.");
    expect(texto).toContain("Lo que sigue: la ART decide si acepta.");
  });

  it("arma el link de WhatsApp con el teléfono argentino del contacto", () => {
    expect(linkWhatsApp("11 5555-1234", "hola")).toBe("https://wa.me/5491155551234?text=hola");
    expect(linkWhatsApp("+54 9 11 5555-1234", "hola")).toBe("https://wa.me/5491155551234?text=hola");
    expect(linkWhatsApp("marta@mail.com", "hola")).toBe("https://wa.me/?text=hola");
  });
});
