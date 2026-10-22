import type { Caso, Vencimiento } from "./tipos";

/**
 * Lógica pura para usar MyCase en varios dispositivos a la vez sin pisar datos:
 * qué mandar a Supabase (solo lo que cambió) y cómo fusionar lo local con lo que vino de otro lado.
 */

function esObjeto(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Igualdad profunda sin importar el orden de las claves (jsonb no lo conserva). */
export function iguales(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((x, i) => iguales(x, b[i]));
  if (esObjeto(a) && esObjeto(b)) {
    const claves = new Set([...Object.keys(a), ...Object.keys(b)]);
    return [...claves].every((k) => iguales(a[k], b[k]));
  }
  return false;
}

/** Los campos de `actual` que difieren de `anterior`. */
export function diferencias<T extends object>(actual: T, anterior: T): Partial<T> {
  const cambios: Partial<T> = {};
  for (const k of Object.keys(actual) as (keyof T)[]) {
    if (!iguales(actual[k], anterior[k])) cambios[k] = actual[k];
  }
  return cambios;
}

export interface CambiosVencimientos {
  nuevos: Vencimiento[];
  /** Solo los campos tocados de cada uno, para no pisar lo que otro dispositivo cambió en los demás. */
  modificados: { id: string; cambios: Partial<Vencimiento> }[];
  quitados: string[];
}

/** Qué vencimientos hay que mandar comparando con la última versión guardada del caso. */
export function cambiosVencimientos(actual: Caso, anterior: Caso | undefined): CambiosVencimientos {
  const previos = new Map((anterior?.vencimientos ?? []).map((v) => [v.id, v]));
  const vigentes = new Set(actual.vencimientos.map((v) => v.id));
  const nuevos: Vencimiento[] = [];
  const modificados: CambiosVencimientos["modificados"] = [];
  for (const v of actual.vencimientos) {
    const previo = previos.get(v.id);
    if (!previo) {
      nuevos.push(v);
      continue;
    }
    const cambios = diferencias(v, previo);
    if (Object.keys(cambios).length > 0) modificados.push({ id: v.id, cambios });
  }
  const quitados = [...previos.keys()].filter((id) => !vigentes.has(id));
  return { nuevos, modificados, quitados };
}

/**
 * Fusión de tres vías de un valor: lo que cambió acá gana, si no queda lo remoto.
 * Si cambiaron los dos y son objetos, se fusiona clave por clave (por ejemplo, pasos distintos de la hoja de ruta).
 */
function fusionarValor(base: unknown, local: unknown, remoto: unknown): unknown {
  if (iguales(local, base)) return remoto;
  if (iguales(remoto, base)) return local;
  if (esObjeto(base) && esObjeto(local) && esObjeto(remoto)) {
    const claves = new Set([...Object.keys(remoto), ...Object.keys(local)]);
    const res: Record<string, unknown> = {};
    for (const k of claves) {
      if (k in local || !(k in base)) {
        const v = fusionarValor(base[k], local[k], remoto[k]);
        if (v !== undefined) res[k] = v;
      } else if (!iguales(remoto[k], base[k])) {
        // Se borró acá pero allá se modificó: queda lo de allá.
        res[k] = remoto[k];
      }
    }
    return res;
  }
  return local;
}

/** Fusión de tres vías de una lista de elementos con id (vencimientos, notas, cartas). */
export function fusionarPorId<T extends { id: string }>(base: T[], local: T[], remoto: T[]): T[] {
  const enBase = new Map(base.map((x) => [x.id, x]));
  const enLocal = new Map(local.map((x) => [x.id, x]));
  const enRemoto = new Set(remoto.map((x) => x.id));
  const res: T[] = [];
  for (const r of remoto) {
    const b = enBase.get(r.id);
    const l = enLocal.get(r.id);
    if (!l) {
      // Si estaba en la base y acá ya no, se quitó acá.
      if (!b) res.push(r);
      continue;
    }
    res.push(b ? (fusionarValor(b, l, r) as T) : l);
  }
  // Agregados acá; los que estaban en la base y ya no están allá se quitaron en el otro dispositivo.
  for (const l of local) if (!enRemoto.has(l.id) && !enBase.has(l.id)) res.push(l);
  return res;
}

/**
 * Aplica los cambios hechos acá (respecto de `base`, la última versión guardada)
 * sobre la versión que vino de Supabase. Sin base, el caso es nuevo y gana lo local.
 */
export function fusionar(base: Caso | undefined, local: Caso, remoto: Caso): Caso {
  if (!base) return local;
  const { vencimientos: vb, historial: hb, cartas: cb, ...restoBase } = base;
  const { vencimientos: vl, historial: hl, cartas: cl, ...restoLocal } = local;
  const { vencimientos: vr, historial: hr, cartas: cr, ...restoRemoto } = remoto;
  return {
    ...(fusionarValor(restoBase, restoLocal, restoRemoto) as Omit<Caso, "vencimientos" | "historial" | "cartas">),
    vencimientos: fusionarPorId(vb, vl, vr),
    historial: fusionarPorId(hb, hl, hr),
    cartas: fusionarPorId(cb, cl, cr),
  };
}

/**
 * Lo que queda al recargar: los casos de Supabase con los cambios locales sin guardar encima.
 * Los casos nuevos que todavía no se guardaron se conservan; los que se borraron en otro dispositivo, no.
 */
export function fusionarCarga(locales: Caso[], guardados: Map<string, Caso>, remotos: Caso[]): Caso[] {
  const porId = new Map(locales.map((c) => [c.id, c]));
  const idsRemotos = new Set(remotos.map((c) => c.id));
  const res = remotos.map((r) => {
    const local = porId.get(r.id);
    return local ? fusionar(guardados.get(r.id), local, r) : r;
  });
  for (const c of locales) if (!idsRemotos.has(c.id) && !guardados.has(c.id)) res.push(c);
  return res;
}
