import { describe, expect, it } from "vitest";
import { fechaCorta, sumarDias } from "./formato";

describe("fechaCorta", () => {
  it("muestra el año solo si no es el actual", () => {
    expect(fechaCorta("2026-10-19", "2026-12-01")).toBe("19 oct");
    expect(fechaCorta("2025-03-02", "2026-12-01")).toBe("2 mar 2025");
  });
});

describe("sumarDias", () => {
  it("suma días corridos", () => {
    expect(sumarDias("2026-10-09", 2)).toBe("2026-10-11");
  });

  it("saltea fines de semana en días hábiles", () => {
    // Viernes 4/9 + 5 hábiles = viernes 11/9.
    expect(sumarDias("2026-09-04", 5, true)).toBe("2026-09-11");
    // Sábado 5/9 + 1 hábil = lunes 7/9.
    expect(sumarDias("2026-09-05", 1, true)).toBe("2026-09-07");
  });

  it("cruza meses y años, salteando el 1 de enero", () => {
    expect(sumarDias("2026-12-30", 10, true)).toBe("2027-01-14");
  });

  it("saltea feriados en días hábiles", () => {
    // Miércoles 8/7 + 3 hábiles: 9/7 (Independencia) y 10/7 (puente) no cuentan → 15/7.
    expect(sumarDias("2026-07-08", 3, true)).toBe("2026-07-15");
  });

  it("corre el plazo de una carta enviada antes del 12 de octubre", () => {
    // Viernes 9/10 + 10 hábiles, con el lunes 12/10 feriado → lunes 26/10.
    expect(sumarDias("2026-10-09", 10, true)).toBe("2026-10-26");
  });

  it("no saltea feriados en días corridos", () => {
    expect(sumarDias("2026-07-08", 2)).toBe("2026-07-10");
  });
});
