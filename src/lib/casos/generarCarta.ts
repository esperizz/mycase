import { CONSECUENCIAS, INFO_TIPO, pedidoPorId, plazoPorId } from "./cartaCatalogo";
import { enumerar, fechaLarga, formatearPesos, oracion, parsearMonto } from "./formato";
import type { Caso } from "./tipos";

export interface Carta {
  remitente: string;
  destinatario: string;
  cuerpo: string;
}

function datosParte(nombre: string, domicilio: string, localidad: string, documento: string, marcadorNombre: string): string {
  const lineas = [
    nombre.trim() || marcadorNombre,
    domicilio.trim() || "[domicilio]",
    localidad.trim() || "[localidad]",
    `DNI/CUIT ${documento.trim() || "[DNI/CUIT]"}`,
  ];
  return lineas.join("\n");
}

/** Genera la carta documento / telegrama de intimación de un caso, con marcadores para datos faltantes. */
export function generarCarta(caso: Caso, hoy: Date = new Date()): Carta {
  const c = caso.carta;
  const info = INFO_TIPO[caso.tipoReclamo] ?? INFO_TIPO.Otro;

  const remitenteDomicilio = c?.remitenteDomicilio ?? "";
  const remitenteLocalidad = c?.remitenteLocalidad ?? "";
  const remitenteDocumento = c?.remitenteDocumento ?? "";
  const destinatarioDomicilio = c?.destinatarioDomicilio ?? "";
  const destinatarioLocalidad = c?.destinatarioLocalidad ?? "";
  const destinatarioDocumento = c?.destinatarioDocumento ?? "";
  const hechosFecha = c?.hechosFecha ?? "";
  const hechosDescripcion = c?.hechosDescripcion ?? "";
  const pedidoId = c?.pedidoId ?? "";
  const pedidoMonto = c?.pedidoMonto ?? "";
  const pedidoDetalle = c?.pedidoDetalle ?? "";
  const plazo = plazoPorId(c?.plazo ?? "10d");
  const consecuenciasElegidas = c?.consecuencias ?? [];

  const lugar = remitenteLocalidad.trim() || "[tu localidad]";
  const encabezado = `${lugar}, ${fechaLarga(hoy.toISOString().slice(0, 10))}.`;

  const relato = oracion(hechosDescripcion) || "[qué pasó]";
  const hechos = hechosFecha
    ? `Con fecha ${fechaLarga(hechosFecha)} ocurrió lo siguiente: ${relato}`
    : `Los hechos son los siguientes: ${relato}`;

  const monto = parsearMonto(pedidoMonto);
  const montoTexto = monto ? formatearPesos(monto) : "[monto]";

  let queHacer = "[qué le pedís]";
  const pedido = pedidoPorId(caso.tipoReclamo, pedidoId);
  if (pedido) {
    const texto = pedido.texto(montoTexto, pedidoDetalle.trim().replace(/[.\s]+$/, ""));
    queHacer = texto || "[qué le pedís]";
  }

  const base = info.base ? `, ${info.base}` : "";
  const intimacion = `Por la presente, INTIMO a Ud. para que dentro del plazo de ${plazo.titulo} de recibida la presente ${queHacer}${base}.`;

  const elegidas = CONSECUENCIAS.filter((cc) => consecuenciasElegidas.includes(cc.id)).map((cc) => cc.texto);
  const apercibimiento = `Bajo apercibimiento de ${elegidas.length ? enumerar(elegidas) : "[qué vas a hacer si no cumple]"}.`;

  const firma = [caso.cliente.trim() || "[nombre del cliente]", `DNI ${remitenteDocumento.trim() || "[DNI]"}`].join("\n");

  const cuerpo = [
    encabezado,
    `${info.intro} ${hechos}`,
    intimacion,
    apercibimiento,
    "Queda Ud. debidamente notificado/a.",
    firma,
  ].join("\n\n");

  return {
    remitente: datosParte(caso.cliente, remitenteDomicilio, remitenteLocalidad, remitenteDocumento, "[nombre del cliente]"),
    destinatario: datosParte(caso.empleador, destinatarioDomicilio, destinatarioLocalidad, destinatarioDocumento, "[nombre del empleador]"),
    cuerpo,
  };
}
