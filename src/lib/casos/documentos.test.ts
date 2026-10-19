import { describe, expect, it } from "vitest";
import { formatearTamanio, nombreSeguro, nombreVisible, rutaDocumento } from "./documentos";

describe("documentos", () => {
  it("limpia el nombre para usarlo en la ruta sin perder la extensión", () => {
    expect(nombreSeguro("Recibo de sueldo (julio).pdf")).toBe("Recibo-de-sueldo-julio.pdf");
    expect(nombreSeguro("Historia clínica Peña.PDF")).toBe("Historia-clinica-Pena.PDF");
    expect(nombreSeguro("???")).toBe("archivo");
  });

  it("arma la ruta con el usuario como primera carpeta y recupera el nombre visible", () => {
    const ruta = rutaDocumento("u1", "c1", "abc", "DNI frente.jpg");
    expect(ruta).toBe("u1/c1/abc__DNI-frente.jpg");
    expect(nombreVisible(ruta.split("/").pop()!)).toBe("DNI-frente.jpg");
  });

  it("muestra el tamaño legible", () => {
    expect(formatearTamanio(500)).toBe("500 B");
    expect(formatearTamanio(2048)).toBe("2 KB");
    expect(formatearTamanio(3_500_000)).toBe("3,3 MB");
  });
});
