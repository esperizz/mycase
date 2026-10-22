import { diasEntre } from "./formato";
import { esArt, hojaCompleta, tienePasoPendiente } from "./hojaRuta";
import { borradores } from "./cartas";
import { ESTADOS, type CartaDatos, type Caso, type EstadoCaso, type Vencimiento } from "./tipos";

export interface Pendiente {
  caso: Caso;
  vencimiento: Vencimiento;
  /** Días hasta el vencimiento: negativo si ya pasó, 0 si es hoy. */
  dias: number;
}

export interface Panel {
  /** Plazos que ya pasaron: lo grave. */
  vencidos: Pendiente[];
  /** Tareas que ya pasaron: pendientes, pero sin consecuencias legales. */
  atrasadas: Pendiente[];
  hoy: Pendiente[];
  /** Del día siguiente hasta 7 días adelante. */
  semana: Pendiente[];
  /**
   * Casos activos que pueden quedar olvidados: sin plazos ni tareas pendientes, sin carta a
   * medias y abiertos hace más de una semana.
   */
  sinNadaCargado: Caso[];
  /**
   * Lo próximo que importa: si hay plazos vencidos, todos ellos; si no, los plazos del día
   * más cercano (sin límite de días). Vacío si no hay plazos pendientes.
   */
  proximosPlazos: Pendiente[];
  /** Casos de ART con toda la hoja de ruta cumplida que todavía no se cerraron. */
  listosParaCerrar: Caso[];
  /** Cartas empezadas de casos activos que no se marcaron como enviadas, una por una. */
  cartasSinEnviar: { caso: Caso; carta: CartaDatos }[];
  /** Casos por estado; los de ART activos van aparte, porque su etapa sale de la hoja de ruta. */
  porEtapa: Record<EstadoCaso, number>;
  art: number;
  activos: number;
}

export const DIAS_SEMANA = 7;

/** Arma lo que el abogado tiene que mirar hoy. Los casos cerrados no generan pendientes. */
export function armarPanel(casos: Caso[], hoy: string): Panel {
  const activos = casos.filter((c) => c.estado !== "cerrado");

  const pendientes = activos
    .flatMap((caso) =>
      caso.vencimientos
        .filter((v) => !v.cumplido)
        .map((vencimiento) => ({ caso, vencimiento, dias: diasEntre(hoy, vencimiento.fecha) })),
    )
    .sort((a, b) => a.dias - b.dias);

  const porEtapa = Object.fromEntries(ESTADOS.map((e) => [e, 0])) as Record<EstadoCaso, number>;
  let art = 0;
  for (const c of casos) {
    if (esArt(c) && c.estado !== "cerrado") art++;
    else porEtapa[c.estado]++;
  }

  const plazos = pendientes.filter((p) => p.vencimiento.tipo === "plazo");
  const primero = plazos[0];
  const proximosPlazos = !primero
    ? []
    : plazos.filter((p) => (primero.dias < 0 ? p.dias < 0 : p.dias === primero.dias));

  return {
    vencidos: pendientes.filter((p) => p.dias < 0 && p.vencimiento.tipo === "plazo"),
    atrasadas: pendientes.filter((p) => p.dias < 0 && p.vencimiento.tipo === "tarea"),
    hoy: pendientes.filter((p) => p.dias === 0),
    semana: pendientes.filter((p) => p.dias > 0 && p.dias <= DIAS_SEMANA),
    // No están olvidados: el de hoja de ruta completa está para cerrar, el de carta a medias
    // ya aparece en "Cartas sin enviar" y uno recién abierto lo tiene presente.
    sinNadaCargado: activos.filter(
      (c) =>
        !c.vencimientos.some((v) => !v.cumplido) &&
        !tienePasoPendiente(c) &&
        !hojaCompleta(c) &&
        borradores(c).length === 0 &&
        diasEntre(c.fechaApertura, hoy) > DIAS_SEMANA,
    ),
    listosParaCerrar: activos.filter(hojaCompleta),
    proximosPlazos,
    cartasSinEnviar: activos.flatMap((caso) => borradores(caso).map((carta) => ({ caso, carta }))),
    porEtapa,
    art,
    activos: activos.length,
  };
}

function cuantos(n: number, singular: string, plural: string) {
  return `${n} ${n === 1 ? singular : plural}`;
}

/** El título del panel: solo lo más urgente, con nombre. El detalle está en los números. */
export function titular(panel: Panel): string {
  const plazos = (ps: Pendiente[]) => ps.filter((p) => p.vencimiento.tipo === "plazo").length;
  const tareas = (ps: Pendiente[]) => ps.filter((p) => p.vencimiento.tipo === "tarea").length;

  if (panel.vencidos.length > 0) {
    return `Tenés ${cuantos(panel.vencidos.length, "plazo vencido", "plazos vencidos")}.`;
  }
  const hoy = plazos(panel.hoy);
  if (hoy > 0) return hoy === 1 ? "Hoy vence 1 plazo." : `Hoy vencen ${hoy} plazos.`;
  if (panel.atrasadas.length > 0) {
    return `Tenés ${cuantos(panel.atrasadas.length, "tarea atrasada", "tareas atrasadas")}.`;
  }

  const semanaPlazos = plazos(panel.semana);
  const semanaTareas = tareas(panel.hoy) + tareas(panel.semana);
  const vencen = semanaPlazos === 1 ? "vence 1 plazo" : `vencen ${semanaPlazos} plazos`;
  const tenes = `tenés ${cuantos(semanaTareas, "tarea", "tareas")}`;
  if (semanaPlazos > 0 && semanaTareas > 0) return `Esta semana ${vencen} y ${tenes}.`;
  if (semanaPlazos > 0) return `Esta semana ${vencen}.`;
  if (semanaTareas > 0) return `Esta semana ${tenes}.`;
  return "Estás al día.";
}

/** Plazos y tareas sin cumplir de un caso: para avisar antes de cerrarlo. */
export function pendientesDe(caso: Caso): { plazos: number; tareas: number } {
  const sinCumplir = caso.vencimientos.filter((v) => !v.cumplido);
  return {
    plazos: sinCumplir.filter((v) => v.tipo === "plazo").length,
    tareas: sinCumplir.filter((v) => v.tipo === "tarea").length,
  };
}
