import { diasEntre } from "./formato";
import { ESTADOS, type Caso, type EstadoCaso, type Vencimiento } from "./tipos";

export interface Pendiente {
  caso: Caso;
  vencimiento: Vencimiento;
  /** Días hasta el vencimiento: negativo si ya pasó, 0 si es hoy. */
  dias: number;
}

export interface Panel {
  vencidos: Pendiente[];
  hoy: Pendiente[];
  /** Del día siguiente hasta 7 días adelante. */
  semana: Pendiente[];
  /** Casos activos sin ningún vencimiento pendiente: nada les recuerda el próximo paso. */
  sinProximoPaso: Caso[];
  /** Casos activos con la carta empezada pero sin marcar como enviada. */
  cartasSinEnviar: Caso[];
  porEtapa: Record<EstadoCaso, number>;
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
  for (const c of casos) porEtapa[c.estado]++;

  return {
    vencidos: pendientes.filter((p) => p.dias < 0),
    hoy: pendientes.filter((p) => p.dias === 0),
    semana: pendientes.filter((p) => p.dias > 0 && p.dias <= DIAS_SEMANA),
    sinProximoPaso: activos.filter((c) => !c.vencimientos.some((v) => !v.cumplido)),
    cartasSinEnviar: activos.filter((c) => c.carta && !c.carta.enviadaEl),
    porEtapa,
    activos: activos.length,
  };
}
