import { simple } from "./buscar";
import type { Caso } from "./tipos";

/**
 * Un cliente puede tener más de un caso (ver docs/entrevistas/insights.md). No hay una lista
 * aparte de clientes: se reconocen por el nombre, escrito como sea.
 */
function clave(nombre: string): string {
  return simple(nombre).trim().replace(/\s+/g, " ");
}

/** Los otros casos del mismo cliente. */
export function otrosCasos(caso: Caso, casos: Caso[]): Caso[] {
  const k = clave(caso.cliente);
  return casos.filter((c) => c.id !== caso.id && clave(c.cliente) === k);
}

export interface ClienteConocido {
  nombre: string;
  contacto: string;
}

/**
 * Los clientes que ya tienen algún caso, para sugerirlos al cargar uno nuevo: el nombre como
 * figura en su caso más reciente y el último contacto cargado.
 */
export function clientesConocidos(casos: Caso[]): ClienteConocido[] {
  const porClave = new Map<string, ClienteConocido>();
  const recientes = [...casos].sort((a, b) => a.fechaApertura.localeCompare(b.fechaApertura));
  for (const c of recientes) {
    const k = clave(c.cliente);
    if (!k) continue;
    const previo = porClave.get(k);
    porClave.set(k, { nombre: c.cliente.trim(), contacto: c.contacto.trim() || previo?.contacto || "" });
  }
  return [...porClave.values()].sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
}
