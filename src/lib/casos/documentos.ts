/**
 * Documentos de un caso en Supabase Storage (bucket privado "documentos").
 * Ruta: <usuario>/<caso>/<id>__<nombre>. La primera carpeta es el usuario: las políticas
 * de permisos solo dejan ver, subir y borrar dentro de la carpeta propia.
 */

export const BUCKET = "documentos";
export const TAMANIO_MAXIMO = 10 * 1024 * 1024; // 10 MB, igual que el límite del bucket

const SEPARADOR = "__";

/** Nombre apto para la ruta: sin tildes ni caracteres raros, conservando la extensión. */
export function nombreSeguro(nombre: string): string {
  const limpio = nombre
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // tildes y diéresis que quedan sueltas tras normalizar
    .replace(/[^\w.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/-\./g, ".")
    .replace(/^[-.]+|-+$/g, "");
  return limpio || "archivo";
}

export function carpetaDelCaso(usuarioId: string, casoId: string): string {
  return `${usuarioId}/${casoId}`;
}

export function rutaDocumento(usuarioId: string, casoId: string, id: string, nombre: string): string {
  return `${carpetaDelCaso(usuarioId, casoId)}/${id}${SEPARADOR}${nombreSeguro(nombre)}`;
}

/** Lo que se le muestra a la abogada: el nombre del archivo, sin el id del principio. */
export function nombreVisible(archivo: string): string {
  const i = archivo.indexOf(SEPARADOR);
  return i >= 0 ? archivo.slice(i + SEPARADOR.length) : archivo;
}

/** 2048 → "2 KB", 3_500_000 → "3,3 MB". */
export function formatearTamanio(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toLocaleString("es-AR", { maximumFractionDigits: 1 })} MB`;
}
