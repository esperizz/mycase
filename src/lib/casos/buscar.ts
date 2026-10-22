import type { Caso } from "./tipos";

/** Minúsculas y sin tildes, para comparar como lo escribiría cualquiera. */
function simple(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

/** El caso coincide si cada palabra buscada aparece en el cliente, el empleador o el expediente. */
export function coincide(caso: Caso, busqueda: string): boolean {
  const donde = simple([caso.cliente, caso.empleador, caso.expediente ?? ""].join(" "));
  return simple(busqueda)
    .split(/\s+/)
    .filter(Boolean)
    .every((palabra) => donde.includes(palabra));
}
