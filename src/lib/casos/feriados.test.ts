import { describe, expect, it } from "vitest";
import { feriado, feriadosDelAnio, proximoFeriado } from "./feriados";

describe("feriadosDelAnio", () => {
  it("arma el calendario 2026", () => {
    expect([...feriadosDelAnio(2026).keys()].sort()).toEqual([
      "2026-01-01",
      "2026-02-16",
      "2026-02-17",
      "2026-03-23",
      "2026-03-24",
      "2026-04-02",
      "2026-04-03",
      "2026-05-01",
      "2026-05-25",
      "2026-06-15", // Güemes: 17/6 cae miércoles → lunes anterior
      "2026-06-20",
      "2026-07-09",
      "2026-07-10",
      "2026-08-17",
      "2026-10-12",
      "2026-11-23", // Soberanía: 20/11 cae viernes → lunes siguiente
      "2026-12-07",
      "2026-12-08",
      "2026-12-25",
    ]);
  });

  it("calcula Carnaval y Viernes Santo desde la Pascua", () => {
    // Pascua 2027: 28 de marzo.
    expect(feriado("2027-02-08")).toBe("Carnaval");
    expect(feriado("2027-02-09")).toBe("Carnaval");
    expect(feriado("2027-03-26")).toBe("Viernes Santo");
  });

  it("no inventa feriados", () => {
    expect(feriado("2026-10-14")).toBeNull();
  });
});

describe("proximoFeriado", () => {
  it("encuentra el siguiente, aunque sea del año próximo", () => {
    expect(proximoFeriado("2026-10-14")).toEqual({ fecha: "2026-11-23", nombre: "Día de la Soberanía Nacional" });
    expect(proximoFeriado("2026-12-26")?.fecha).toBe("2027-01-01");
    expect(proximoFeriado("2026-12-25")?.fecha).toBe("2026-12-25");
  });
});
