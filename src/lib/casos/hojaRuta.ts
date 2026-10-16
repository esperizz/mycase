import { sumarDias } from "./formato";
import type { Caso, HojaRuta } from "./tipos";

/**
 * Hoja de ruta de un reclamo contra una ART, en provincia adherida a la Ley 27.348.
 * Pasos, plazos y citas: docs/investigacion/proceso-art.md.
 */

export const TIPO_ART = "Accidente de trabajo";

/** Los casos de ART siguen la hoja de ruta en vez de los estados de un despido. */
export function esArt(caso: Caso): boolean {
  return caso.tipoReclamo === TIPO_ART || caso.hojaRuta !== null;
}

export interface PasoDef {
  id: string;
  /** Cómo se lo nombra al cliente. */
  titulo: string;
  /** Cómo lo reconoce la abogada. */
  tecnico: string;
  /** Lo que se le explica al cliente sobre lo que sigue. */
  explicacion: string;
  /** Lo que el cliente tiene que hacer en este paso, si algo. */
  teToca?: string;
  /** Plazo legal que empieza a correr cuando se cumple el paso `desde` y termina con este paso. */
  plazo?: { desde: string; dias: number; texto: string };
}

export const PASOS: PasoDef[] = [
  {
    id: "denuncia",
    titulo: "Avisamos a la ART",
    tecnico: "Denuncia del siniestro",
    explicacion: "Le avisamos a la ART del accidente.",
    teToca: "Mandame el número de siniestro y una copia de la denuncia.",
  },
  {
    id: "respuesta",
    titulo: "La ART decide si acepta",
    tecnico: "Aceptación o rechazo",
    explicacion:
      "La ART tiene 10 días hábiles para aceptar o rechazar. Si no contesta, se considera aceptado. Puede que rechace: si pasa, ya sabemos qué hacer.",
    plazo: { desde: "denuncia", dias: 10, texto: "La ART tiene que aceptar o rechazar" },
  },
  {
    id: "tratamiento",
    titulo: "Te atendés con la ART",
    tecnico: "Prestaciones e ILT",
    explicacion: "La ART te atiende gratis y seguís cobrando mientras no puedas trabajar.",
    teToca: "Ir a todos los turnos médicos.",
  },
  {
    id: "alta",
    titulo: "Te dan el alta",
    tecnico: "Alta médica (Formulario A)",
    explicacion: "Cuando la ART dé por terminado el tratamiento te va a dar el alta en un formulario.",
    teToca: "Mandame el formulario del alta apenas lo recibas: si no estás de acuerdo, hay solo 5 días hábiles para discutirla.",
  },
  {
    id: "comision",
    titulo: "La comisión médica evalúa",
    tecnico: "Determinación de incapacidad (CMJ)",
    explicacion:
      "Médicos del Estado, no de la ART, miden lo que te quedó. Pueden citarte para revisarte. Tienen 60 días hábiles para resolver.",
    teToca: "Si te citan, ir al examen con tus estudios.",
    plazo: { desde: "alta", dias: 5, texto: "Último día para discutir el alta" },
  },
  {
    id: "dictamen",
    titulo: "Sale el resultado",
    tecnico: "Dictamen de la comisión médica",
    explicacion: "La comisión escribe el porcentaje de incapacidad y con eso se calcula lo que te corresponde.",
  },
  {
    id: "audiencia",
    titulo: "Audiencia de acuerdo",
    tecnico: "Audiencia ante el Servicio de Homologación",
    explicacion: "Nos juntamos con la ART, presencial o por videollamada, para firmar el acuerdo.",
    teToca: "Presentarte con tu DNI el día de la audiencia.",
  },
  {
    id: "homologacion",
    titulo: "Se aprueba el acuerdo",
    tecnico: "Homologación",
    explicacion: "El acuerdo queda aprobado oficialmente.",
  },
  {
    id: "cobro",
    titulo: "Cobrás",
    tecnico: "Pago de la indemnización",
    explicacion: "La ART tiene 5 días hábiles para depositarte en tu cuenta sueldo.",
    teToca: "Avisame cuando veas la plata en tu cuenta.",
    plazo: { desde: "homologacion", dias: 5, texto: "La ART tiene que pagar" },
  },
];

/** Pasos que se suman después de "respuesta" si la ART rechaza. */
export const RAMA_RECHAZO: PasoDef[] = [
  {
    id: "rechazo-cm",
    titulo: "Vamos a la comisión médica por el rechazo",
    tecnico: "Rechazo ante la comisión médica",
    explicacion: "Ahora lo decide la comisión médica. Mientras tanto te podés atender con tu obra social.",
    teToca: "Mandame la carta de rechazo y tu historia clínica.",
  },
  {
    id: "rechazo-decision",
    titulo: "La comisión decide si fue laboral",
    tecnico: "Dictamen sobre el carácter laboral",
    explicacion: "Si dice que sí, la ART tiene que darte todo lo que sigue.",
  },
];

export const hojaRutaVacia = (): HojaRuta => ({
  cumplidos: {},
  avisados: {},
  rechazo: false,
  inicioAvisado: "",
  vencimientos: {},
});

export interface Paso extends PasoDef {
  estado: "cumplido" | "actual" | "pendiente";
  fecha?: string;
  avisado?: string;
}

/** Los pasos del caso en orden, con el primero sin cumplir marcado como actual. */
export function pasosDe(hoja: HojaRuta): Paso[] {
  const defs = hoja.rechazo ? [...PASOS.slice(0, 2), ...RAMA_RECHAZO, ...PASOS.slice(2)] : PASOS;
  let hayActual = false;
  return defs.map((def) => {
    const fecha = hoja.cumplidos[def.id];
    let estado: Paso["estado"] = "pendiente";
    if (fecha) estado = "cumplido";
    else if (!hayActual) {
      estado = "actual";
      hayActual = true;
    }
    return { ...def, estado, fecha, avisado: hoja.avisados[def.id] };
  });
}

/**
 * Marca un paso como cumplido. Si con eso empieza a correr un plazo, lo agrega a los
 * vencimientos del caso (así aparece en el panel); si el paso cierra un plazo, lo tilda.
 */
export function cumplirPaso(
  caso: Caso,
  pasoId: string,
  fecha: string,
  opciones: { rechazo?: boolean; crearId?: () => string } = {},
): Caso {
  const crearId = opciones.crearId ?? (() => crypto.randomUUID());
  const hoja = caso.hojaRuta ?? hojaRutaVacia();
  const nueva: HojaRuta = {
    ...hoja,
    cumplidos: { ...hoja.cumplidos, [pasoId]: fecha },
    rechazo: pasoId === "respuesta" ? !!opciones.rechazo : hoja.rechazo,
    vencimientos: { ...hoja.vencimientos },
  };
  let vencimientos = caso.vencimientos;

  const cerrado = nueva.vencimientos[pasoId];
  if (cerrado) vencimientos = vencimientos.map((v) => (v.id === cerrado ? { ...v, cumplido: true } : v));

  for (const paso of pasosDe(nueva)) {
    if (paso.plazo?.desde !== pasoId || paso.estado === "cumplido" || nueva.vencimientos[paso.id]) continue;
    const id = crearId();
    nueva.vencimientos[paso.id] = id;
    vencimientos = [
      ...vencimientos,
      { id, fecha: sumarDias(fecha, paso.plazo.dias, true), descripcion: paso.plazo.texto, cumplido: false },
    ];
  }

  return { ...caso, hojaRuta: nueva, vencimientos };
}

/** Deshace un paso cumplido: borra los plazos que había abierto y destilda el que había cerrado. */
export function deshacerPaso(caso: Caso, pasoId: string): Caso {
  const hoja = caso.hojaRuta;
  if (!hoja) return caso;
  const cumplidos = { ...hoja.cumplidos };
  delete cumplidos[pasoId];
  const avisados = { ...hoja.avisados };
  delete avisados[pasoId];
  const enlazados = { ...hoja.vencimientos };
  const abiertos = PASOS.filter((p) => p.plazo?.desde === pasoId).map((p) => enlazados[p.id]);
  for (const p of PASOS) if (p.plazo?.desde === pasoId) delete enlazados[p.id];
  const cerrado = enlazados[pasoId];

  let rechazo = hoja.rechazo;
  if (pasoId === "respuesta" && rechazo) {
    rechazo = false;
    for (const p of RAMA_RECHAZO) delete cumplidos[p.id];
  }

  const vencimientos = caso.vencimientos
    .filter((v) => !abiertos.includes(v.id))
    .map((v) => (v.id === cerrado ? { ...v, cumplido: false } : v));

  return { ...caso, hojaRuta: { ...hoja, cumplidos, avisados, rechazo, vencimientos: enlazados }, vencimientos };
}

/** La etapa de un caso de ART, según su hoja de ruta. */
export function etapaArt(caso: Caso): string {
  if (!caso.hojaRuta) return "Hoja de ruta sin empezar";
  const actual = pasosDe(caso.hojaRuta).find((p) => p.estado === "actual");
  return actual ? actual.tecnico : "Todos los pasos cumplidos";
}

/** Un caso de ART con la hoja de ruta en marcha ya tiene próximo paso, aunque no tenga vencimientos. */
export function tienePasoPendiente(caso: Caso): boolean {
  return !!caso.hojaRuta && pasosDe(caso.hojaRuta).some((p) => p.estado === "actual");
}

function primerNombre(cliente: string) {
  return cliente.trim().split(/\s+/)[0] ?? "";
}

/** Mensaje para el cliente al cumplir un paso: qué pasó, qué sigue y qué tiene que hacer. */
export function mensajeAviso(caso: Caso, pasoId: string): string {
  const pasos = pasosDe(caso.hojaRuta ?? hojaRutaVacia());
  const i = pasos.findIndex((p) => p.id === pasoId);
  const hecho = pasos[i];
  const siguiente = pasos.slice(i + 1).find((p) => p.estado !== "cumplido");
  const lineas = [`Hola ${primerNombre(caso.cliente)}, te cuento cómo va tu caso.`];

  if (hecho.id === "respuesta") {
    lineas.push(
      caso.hojaRuta?.rechazo
        ? "La ART rechazó el reclamo, como te había anticipado que podía pasar. Ya sabemos qué hacer."
        : "✓ La ART aceptó tu caso.",
    );
  } else {
    lineas.push(`✓ ${hecho.titulo}.`);
  }

  if (siguiente) {
    lineas.push(`Lo que sigue: ${siguiente.titulo.charAt(0).toLowerCase()}${siguiente.titulo.slice(1)}. ${siguiente.explicacion}`);
    if (siguiente.teToca) lineas.push(`Te pido: ${siguiente.teToca}`);
  } else {
    lineas.push("Con esto terminamos tu caso. ¡Gracias por la confianza!");
  }
  return lineas.join("\n\n");
}

/** Mensaje inicial: le anticipa al cliente todo el recorrido del caso. */
export function mensajeInicio(caso: Caso): string {
  const pasos = PASOS.map((p, i) => `${i + 1}. ${p.titulo}`).join("\n");
  return [
    `Hola ${primerNombre(caso.cliente)}, te cuento cómo va a ser tu caso con la ART:`,
    pasos,
    "Puede pasar que la ART rechace el reclamo. Si pasa, lo llevamos a la comisión médica y seguimos.",
    "Te voy avisando por acá a medida que avancemos.",
  ].join("\n\n");
}

/**
 * Link para abrir WhatsApp con el mensaje escrito. Si el contacto tiene un teléfono, va
 * directo a ese chat; si no, WhatsApp pide elegir a quién mandarlo.
 */
export function linkWhatsApp(contacto: string, texto: string): string {
  let digitos = contacto.replace(/\D/g, "");
  if (digitos.length >= 8) {
    if (digitos.startsWith("0")) digitos = digitos.slice(1);
    if (!digitos.startsWith("54")) digitos = `549${digitos}`;
  } else {
    digitos = "";
  }
  return `https://wa.me/${digitos}?text=${encodeURIComponent(texto)}`;
}
