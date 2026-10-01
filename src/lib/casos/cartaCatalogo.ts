import type { PlazoId } from "./tipos";

export interface InfoTipo {
  /** Primer párrafo de la carta, después del encabezado. */
  intro: string;
  /** Norma que respalda la intimación. */
  base: string;
  /** Ejemplo para guiar la redacción de "¿Qué pasó?". */
  ejemploHechos: string;
}

export const INFO_TIPO: Record<string, InfoTipo> = {
  "Despido sin causa": {
    intro: "Me dirijo a Ud. en mi carácter de ex trabajador/a dependiente, en relación con el despido del que fui objeto.",
    base: "conforme lo dispuesto por la Ley de Contrato de Trabajo (Ley 20.744) y la Ley 25.323",
    ejemploHechos:
      "Trabajé para la empresa desde marzo de 2023 hasta el 15 de septiembre de 2026, cuando me notificaron el despido sin invocar causa alguna.",
  },
  "Falta de pago de haberes": {
    intro: "Me dirijo a Ud. en mi carácter de trabajador/a dependiente, en relación con los haberes adeudados.",
    base: "conforme lo dispuesto por la Ley de Contrato de Trabajo (Ley 20.744)",
    ejemploHechos:
      "No percibí mi remuneración correspondiente a los meses de julio y agosto de 2026, pese a continuar prestando servicios con normalidad.",
  },
  "Accidente de trabajo": {
    intro: "Me dirijo a Ud. en mi carácter de trabajador/a dependiente, en relación con el accidente de trabajo sufrido.",
    base: "conforme lo dispuesto por la Ley de Riesgos del Trabajo (Ley 24.557 y modificatorias)",
    ejemploHechos:
      "El día 10 de agosto de 2026, en ocasión de mis tareas habituales, sufrí un accidente que me provocó una lesión, debiendo realizar tratamiento médico.",
  },
  "Diferencias salariales": {
    intro: "Me dirijo a Ud. en mi carácter de trabajador/a dependiente, en relación con diferencias salariales no abonadas.",
    base: "conforme lo dispuesto por la Ley de Contrato de Trabajo y el convenio colectivo de trabajo aplicable",
    ejemploHechos:
      "Durante los últimos meses percibí una remuneración inferior a la que corresponde según mi categoría y el convenio colectivo aplicable.",
  },
  "Trabajo no registrado": {
    intro:
      "Me dirijo a Ud. en mi carácter de trabajador/a, a fin de intimarlo a regularizar la registración de la relación laboral que nos vincula.",
    base: "conforme lo dispuesto por la Ley 24.013 de Empleo",
    ejemploHechos:
      "Trabajo para Ud. desde el 1 de febrero de 2025 cumpliendo tareas administrativas, sin que la relación laboral haya sido registrada.",
  },
  Otro: {
    intro: "Me dirijo a Ud. en relación con la situación laboral que nos vincula.",
    base: "conforme a la normativa laboral vigente",
    ejemploHechos: "",
  },
};

export interface OpcionPedido {
  id: string;
  titulo: string;
  pideMonto?: boolean;
  pideDetalle?: boolean;
  /** Texto de la carta; recibe el monto ya formateado y el detalle. */
  texto: (monto: string, detalle: string) => string;
}

const OTRO: OpcionPedido = {
  id: "otro",
  titulo: "Otra cosa (la escribís vos)",
  pideDetalle: true,
  texto: (_monto, detalle) => detalle,
};

export const PEDIDOS_POR_TIPO: Record<string, OpcionPedido[]> = {
  "Despido sin causa": [
    {
      id: "indemnizacion",
      titulo: "Que paguen la indemnización por despido",
      pideMonto: true,
      texto: (m) => `abone la indemnización por despido y demás rubros derivados del distracto por la suma de ${m}`,
    },
    {
      id: "certificados",
      titulo: "Que entreguen los certificados de trabajo",
      texto: () => "haga entrega de los certificados de trabajo previstos en el art. 80 de la Ley de Contrato de Trabajo",
    },
    OTRO,
  ],
  "Falta de pago de haberes": [
    {
      id: "haberes",
      titulo: "Que paguen los haberes adeudados",
      pideMonto: true,
      texto: (m) => `abone los haberes adeudados por la suma de ${m}, con más los intereses correspondientes`,
    },
    OTRO,
  ],
  "Accidente de trabajo": [
    {
      id: "cobertura",
      titulo: "Que reconozcan la cobertura y las prestaciones",
      texto: () =>
        "reconozca el accidente de trabajo denunciado y otorgue las prestaciones médicas y dinerarias previstas por la ley",
    },
    {
      id: "indemnizacion-accidente",
      titulo: "Que paguen la indemnización correspondiente",
      pideMonto: true,
      texto: (m) => `abone la indemnización correspondiente por la suma de ${m}`,
    },
    OTRO,
  ],
  "Diferencias salariales": [
    {
      id: "diferencias",
      titulo: "Que paguen las diferencias salariales",
      pideMonto: true,
      texto: (m) => `abone las diferencias salariales adeudadas por la suma de ${m}`,
    },
    OTRO,
  ],
  "Trabajo no registrado": [
    {
      id: "registracion",
      titulo: "Que regularicen la registración",
      texto: () => "proceda a registrar correctamente la relación laboral, consignando la real fecha de ingreso y remuneración",
    },
    OTRO,
  ],
  Otro: [OTRO],
};

export interface OpcionPlazo {
  id: PlazoId;
  titulo: string;
  descripcion: string;
}

export const PLAZOS: OpcionPlazo[] = [
  { id: "48h", titulo: "48 horas", descripcion: "Para algo urgente." },
  { id: "5d", titulo: "5 días hábiles", descripcion: "Una semana, aproximadamente." },
  { id: "10d", titulo: "10 días hábiles", descripcion: "Dos semanas. El más habitual." },
];

export interface OpcionConsecuencia {
  id: string;
  titulo: string;
  texto: string;
  soloTipos?: string[];
}

export const CONSECUENCIAS: OpcionConsecuencia[] = [
  {
    id: "judicial",
    titulo: "Iniciar demanda laboral",
    texto: "iniciar las acciones judiciales laborales correspondientes",
  },
  {
    id: "ley-25323",
    titulo: "Reclamar el incremento de la Ley 25.323",
    texto: "reclamar el incremento indemnizatorio previsto en la Ley 25.323",
    soloTipos: ["Despido sin causa"],
  },
  {
    id: "ley-24013",
    titulo: "Reclamar las multas de la Ley 24.013",
    texto: "reclamar las multas previstas en la Ley 24.013 por la falta de registración",
    soloTipos: ["Trabajo no registrado"],
  },
  {
    id: "srt",
    titulo: "Denunciar ante la Superintendencia de Riesgos del Trabajo",
    texto: "formular la denuncia correspondiente ante la Superintendencia de Riesgos del Trabajo",
    soloTipos: ["Accidente de trabajo"],
  },
  {
    id: "ministerio",
    titulo: "Denunciar ante el Ministerio de Trabajo",
    texto: "formular la denuncia correspondiente ante el Ministerio de Trabajo",
  },
  {
    id: "danos",
    titulo: "Reclamar además los daños",
    texto: "reclamar los daños y perjuicios ocasionados",
  },
];

export const pedidosPara = (tipoReclamo: string): OpcionPedido[] => PEDIDOS_POR_TIPO[tipoReclamo] ?? PEDIDOS_POR_TIPO.Otro;

export const pedidoPorId = (tipoReclamo: string, id: string) => pedidosPara(tipoReclamo).find((p) => p.id === id);

export const plazoPorId = (id: PlazoId) => PLAZOS.find((p) => p.id === id) ?? PLAZOS[2];

export const consecuenciasPara = (tipoReclamo: string): OpcionConsecuencia[] =>
  CONSECUENCIAS.filter((c) => !c.soloTipos || c.soloTipos.includes(tipoReclamo));
