// PROTOTIPO — descartable. Hoja de ruta de un caso de ART, en memoria.
// Pasos y plazos tomados de docs/investigacion/proceso-art.md.

import { diasEntre, hoyIso, sumarDias } from "@/lib/casos/formato";

export interface PasoDef {
  id: string;
  /** Cómo lo nombra el cliente. */
  titulo: string;
  /** Cómo lo reconoce el abogado. */
  tecnico: string;
  /** Lo que el abogado le contaría al cliente. */
  explicacion: string;
  /** Lo que el cliente tiene que hacer en este paso, si algo. */
  teToca?: string;
  /** Plazo legal que corre desde que se cumple el paso indicado. */
  plazo?: { desde: string; dias: number; habiles: boolean; texto: string };
}

export const PASOS: PasoDef[] = [
  {
    id: "denuncia",
    titulo: "Avisamos a la ART",
    tecnico: "Denuncia del siniestro",
    explicacion: "La ART ya sabe del accidente. Guardá el número de siniestro.",
    teToca: "Mandame el número de siniestro y una copia de la denuncia.",
  },
  {
    id: "respuesta",
    titulo: "La ART decide si acepta",
    tecnico: "Aceptación o rechazo (Dto. 717/96 art. 6)",
    explicacion:
      "La ART tiene 10 días hábiles para aceptar o rechazar. Si no contesta, se considera aceptado. Puede pasar que rechace: si pasa, ya sabemos qué hacer.",
    plazo: { desde: "denuncia", dias: 10, habiles: true, texto: "La ART tiene que responder" },
  },
  {
    id: "tratamiento",
    titulo: "Te atendés con la ART",
    tecnico: "Prestaciones en especie e ILT",
    explicacion:
      "La ART te atiende gratis y seguís cobrando mientras no puedas trabajar. Es importante ir a todos los turnos.",
    teToca: "Ir a todos los turnos médicos.",
  },
  {
    id: "alta",
    titulo: "Te dieron el alta",
    tecnico: "Alta médica (Formulario A)",
    explicacion: "Si no estás de acuerdo con el alta, hay muy poco tiempo para discutirla.",
    teToca: "Mandame el formulario del alta apenas lo recibas.",
  },
  {
    id: "comision",
    titulo: "La comisión médica evalúa",
    tecnico: "Determinación de incapacidad ante la CMJ",
    explicacion:
      "Médicos del Estado, no de la ART, miden lo que te quedó. Pueden citarte para revisarte. Tienen 60 días hábiles para resolver.",
    teToca: "Si te citan, ir al examen con tus estudios.",
    plazo: { desde: "alta", dias: 5, habiles: true, texto: "Plazo para discutir el alta" },
  },
  {
    id: "dictamen",
    titulo: "Salió el resultado",
    tecnico: "Dictamen de la comisión médica",
    explicacion: "La comisión escribió el porcentaje de incapacidad. Con eso se calcula lo que te corresponde.",
  },
  {
    id: "audiencia",
    titulo: "Audiencia de acuerdo",
    tecnico: "Servicio de Homologación",
    explicacion: "Nos juntamos con la ART, presencial o por videollamada, para firmar el acuerdo.",
    teToca: "Presentarte con tu DNI el día de la audiencia.",
  },
  {
    id: "homologacion",
    titulo: "Acuerdo aprobado",
    tecnico: "Homologación",
    explicacion: "El acuerdo quedó aprobado oficialmente.",
  },
  {
    id: "cobro",
    titulo: "Cobrás",
    tecnico: "Pago de la indemnización",
    explicacion: "La ART tiene 5 días hábiles para depositarte en tu cuenta sueldo.",
    teToca: "Avisame cuando veas la plata en tu cuenta.",
    plazo: { desde: "homologacion", dias: 5, habiles: true, texto: "La ART tiene que pagar" },
  },
];

/** Rama que se inserta después de "respuesta" si la ART rechaza. */
export const RAMA_RECHAZO: PasoDef[] = [
  {
    id: "rechazo-cm",
    titulo: "Vamos a la comisión médica por el rechazo",
    tecnico: "Rechazo → CMJ (Ley 27.348 art. 1)",
    explicacion:
      "La ART rechazó, como te había anticipado que podía pasar. Ahora lo lleva la comisión médica. Mientras tanto te podés atender con tu obra social.",
    teToca: "Mandame la carta de rechazo y tu historia clínica.",
  },
  {
    id: "rechazo-decision",
    titulo: "La comisión decide si fue laboral",
    tecnico: "Dictamen sobre el carácter laboral",
    explicacion: "Si dice que sí, la ART tiene que darte todo lo que sigue.",
  },
];

export interface Estado {
  /** Fecha en que se cumplió cada paso. */
  cumplidos: Record<string, string>;
  rechazo: boolean;
}

export function estadoInicial(): Estado {
  // El caso arranca con la denuncia hecha hace 8 días corridos.
  const [y, m, d] = hoyIso().split("-").map(Number);
  const hace8 = new Date(y, m - 1, d - 8).toLocaleDateString("en-CA");
  return { cumplidos: { denuncia: hace8 }, rechazo: false };
}

export interface PasoVista extends PasoDef {
  estado: "cumplido" | "actual" | "pendiente";
  fecha?: string;
  /** Vencimiento del plazo legal, si ya empezó a correr. */
  vence?: string;
  diasRestantes?: number;
}

export function armarHojaDeRuta(estado: Estado): PasoVista[] {
  const defs = estado.rechazo
    ? [...PASOS.slice(0, 2), ...RAMA_RECHAZO, ...PASOS.slice(2)]
    : PASOS;
  const hoy = hoyIso();
  let actualMarcado = false;
  return defs.map((def) => {
    const fecha = estado.cumplidos[def.id];
    let vence: string | undefined;
    const inicio = def.plazo && estado.cumplidos[def.plazo.desde];
    if (def.plazo && inicio) vence = sumarDias(inicio, def.plazo.dias, def.plazo.habiles);
    let est: PasoVista["estado"] = "pendiente";
    if (fecha) est = "cumplido";
    else if (!actualMarcado) {
      est = "actual";
      actualMarcado = true;
    }
    return {
      ...def,
      estado: est,
      fecha,
      vence: est === "cumplido" ? undefined : vence,
      diasRestantes: est !== "cumplido" && vence ? diasEntre(hoy, vence) : undefined,
    };
  });
}

export const CASO = {
  cliente: "Marta Ríos",
  primerNombre: "Marta",
  abogada: "Dra. Laura Gómez",
  descripcion: "Accidente en planta · mano derecha",
  art: "ART Ejemplo",
};
