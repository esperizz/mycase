import { describe, expect, it } from "vitest";
import { sumarDias } from "./formato";

describe("sumarDias", () => {
  it("suma días corridos", () => {
    expect(sumarDias("2026-10-09", 2)).toBe("2026-10-11");
  });

  it("saltea fines de semana en días hábiles", () => {
    // Viernes 9/10 + 5 hábiles = viernes 16/10.
    expect(sumarDias("2026-10-09", 5, true)).toBe("2026-10-16");
    // Sábado 10/10 + 1 hábil = lunes 12/10.
    expect(sumarDias("2026-10-10", 1, true)).toBe("2026-10-12");
  });

  it("cruza meses y años", () => {
    expect(sumarDias("2026-12-30", 10, true)).toBe("2027-01-13");
  });
});
