import { cartaVacia, type CartaDatos, type Caso, type TipoCarta } from "./tipos";

/**
 * Las cartas de un caso. Antes cada caso tenía una sola carta (`carta`); si es así, pasa a ser
 * la primera intimación, con un id fijo para que no cambie cada vez que se carga.
 */
export function cartasDe(datos: { cartas?: Partial<CartaDatos>[] | null; carta?: Partial<CartaDatos> | null }): CartaDatos[] {
  const lista = datos.cartas?.length ? datos.cartas : datos.carta ? [{ ...datos.carta, id: "inicial", tipo: "intimacion" as const }] : [];
  return lista.map((c) => ({ ...cartaVacia(c.tipo ?? "intimacion", c.id ?? crypto.randomUUID()), ...c }) as CartaDatos);
}

/** Cartas empezadas que todavía no se marcaron como enviadas. */
export function borradores(caso: Caso): CartaDatos[] {
  return caso.cartas.filter((c) => !c.enviadaEl);
}

/**
 * Carta nueva para el caso. Trae los domicilios y documentos de la última carta, para no
 * cargarlos otra vez; el despido indirecto toma como fecha la de la última carta enviada.
 */
export function nuevaCarta(caso: Caso, tipo: TipoCarta, crearId: () => string = () => crypto.randomUUID()): CartaDatos {
  const nueva = cartaVacia(tipo, crearId());
  const ultima = caso.cartas.at(-1);
  if (ultima) {
    nueva.remitenteDomicilio = ultima.remitenteDomicilio;
    nueva.remitenteLocalidad = ultima.remitenteLocalidad;
    nueva.remitenteDocumento = ultima.remitenteDocumento;
    nueva.destinatarioDomicilio = ultima.destinatarioDomicilio;
    nueva.destinatarioLocalidad = ultima.destinatarioLocalidad;
    nueva.destinatarioDocumento = ultima.destinatarioDocumento;
  }
  if (tipo === "despido-indirecto") {
    const enviadas = caso.cartas.filter((c) => c.enviadaEl).map((c) => c.enviadaEl).sort();
    nueva.hechosFecha = enviadas.at(-1) ?? "";
  }
  return nueva;
}
