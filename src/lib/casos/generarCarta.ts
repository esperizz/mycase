import { CONSECUENCIAS, INFO_TIPO, pedidoPorId, plazoPorId } from "./cartaCatalogo";
import { enumerar, fechaLarga, formatearPesos, oracion, parsearMonto } from "./formato";
import type { CartaDatos, Caso } from "./tipos";

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

/** " por la suma de $ 450.000", o "" si no se cargó monto. */
function porLaSuma(monto: string): string {
  const m = parsearMonto(monto);
  return m ? ` por la suma de ${formatearPesos(m)}` : "";
}

/**
 * El cuerpo propio de cada tipo de carta: lo que pasó y lo que se intima.
 * Los de despido indirecto y liquidación están sin revisar por una abogada.
 */
function cuerpoPropio(caso: Caso, c: CartaDatos, plazo: string): { hechos: string; intimacion: string } {
  const dentro = `dentro del plazo de ${plazo} de recibida la presente`;
  const relato = oracion(c.hechosDescripcion);

  switch (c.tipo) {
    case "despido-indirecto": {
      const fecha = c.hechosFecha ? fechaLarga(c.hechosFecha) : "[fecha de la carta anterior]";
      const ante = c.respuesta === "negativa" ? "su respuesta negativa" : "su silencio";
      return {
        hechos: [
          `Ante ${ante} a mi intimación de fecha ${fecha}, hago efectivo el apercibimiento allí formulado y me considero gravemente injuriado/a y despedido/a por su exclusiva culpa, conforme los arts. 242 y 246 de la Ley de Contrato de Trabajo (Ley 20.744).`,
          relato,
        ]
          .filter(Boolean)
          .join(" "),
        intimacion: `En consecuencia, INTIMO a Ud. para que ${dentro} abone las indemnizaciones por antigüedad, preaviso e integración del mes de despido (arts. 245, 232 y 233 de la Ley de Contrato de Trabajo) y la liquidación final${porLaSuma(c.pedidoMonto)}, y haga entrega de los certificados de trabajo previstos en el art. 80 de la misma ley.`,
      };
    }
    case "liquidacion": {
      const cuando = c.hechosFecha ? `, ocurrida el ${fechaLarga(c.hechosFecha)}` : "";
      return {
        hechos: [`Me dirijo a Ud. en relación con la extinción de la relación laboral que nos vinculaba${cuando}.`, relato]
          .filter(Boolean)
          .join(" "),
        intimacion: `Por la presente, INTIMO a Ud. para que ${dentro} abone la liquidación final${porLaSuma(c.pedidoMonto)} y haga entrega de los certificados de trabajo previstos en el art. 80 de la Ley de Contrato de Trabajo (Ley 20.744).`,
      };
    }
    case "otra": {
      const pedido = c.pedidoDetalle.trim().replace(/[.\s]+$/, "") || "[qué le pedís]";
      return {
        hechos: [`Me dirijo a Ud. en relación con la situación laboral que nos vincula.`, relato].filter(Boolean).join(" "),
        intimacion: `Por la presente, INTIMO a Ud. para que ${dentro} ${pedido}.`,
      };
    }
    default: {
      const info = INFO_TIPO[caso.tipoReclamo] ?? INFO_TIPO.Otro;
      const queRelato = relato || "[qué pasó]";
      const hechos = c.hechosFecha
        ? `Con fecha ${fechaLarga(c.hechosFecha)} ocurrió lo siguiente: ${queRelato}`
        : `Los hechos son los siguientes: ${queRelato}`;
      const montoTexto = porLaSuma(c.pedidoMonto).replace(" por la suma de ", "") || "[monto]";
      const pedido = pedidoPorId(caso.tipoReclamo, c.pedidoId);
      const queHacer = (pedido && pedido.texto(montoTexto, c.pedidoDetalle.trim().replace(/[.\s]+$/, ""))) || "[qué le pedís]";
      const base = info.base ? `, ${info.base}` : "";
      return {
        hechos: `${info.intro} ${hechos}`,
        intimacion: `Por la presente, INTIMO a Ud. para que ${dentro} ${queHacer}${base}.`,
      };
    }
  }
}

/** Genera el texto de una carta documento / telegrama del caso, con marcadores para datos faltantes. */
export function generarCarta(caso: Caso, c: CartaDatos, hoy: Date = new Date()): Carta {
  const plazo = plazoPorId(c.plazo);
  const lugar = c.remitenteLocalidad.trim() || "[tu localidad]";
  const encabezado = `${lugar}, ${fechaLarga(hoy.toISOString().slice(0, 10))}.`;
  const { hechos, intimacion } = cuerpoPropio(caso, c, plazo.titulo);

  const elegidas = CONSECUENCIAS.filter((cc) => c.consecuencias.includes(cc.id)).map((cc) => cc.texto);
  const apercibimiento = `Bajo apercibimiento de ${elegidas.length ? enumerar(elegidas) : "[qué vas a hacer si no cumple]"}.`;

  const firma = [caso.cliente.trim() || "[nombre del cliente]", `DNI ${c.remitenteDocumento.trim() || "[DNI]"}`].join("\n");

  const cuerpo = [encabezado, hechos, intimacion, apercibimiento, "Queda Ud. debidamente notificado/a.", firma].join("\n\n");

  return {
    remitente: datosParte(caso.cliente, c.remitenteDomicilio, c.remitenteLocalidad, c.remitenteDocumento, "[nombre del cliente]"),
    destinatario: datosParte(caso.empleador, c.destinatarioDomicilio, c.destinatarioLocalidad, c.destinatarioDocumento, "[nombre del empleador]"),
    cuerpo,
  };
}
