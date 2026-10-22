"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { BUCKET, carpetaDelCaso } from "./documentos";
import { hojaRutaVacia } from "./hojaRuta";
import { migrarNotas } from "./notas";
import { cambiosVencimientos, diferencias, fusionar, fusionarCarga, iguales } from "./sincronizacion";
import {
  cartaVacia,
  type CartaDatos,
  type Caso,
  type CasoNuevo,
  type EstadoCaso,
  type HojaRuta,
  type Nota,
  type TipoVencimiento,
  type Vencimiento,
  type VencimientoNuevo,
} from "./tipos";

/** Clave donde la versión anterior guardaba los casos en el navegador (para migrarlos). */
export const CLAVE_LOCAL = "mycase-casos";

/** Espera tras el último cambio de un caso antes de guardarlo (la carta se autoguarda por tecla). */
const ESPERA_GUARDADO_MS = 500;

interface FilaCaso {
  id: string;
  cliente: string;
  contacto: string;
  empleador: string;
  tipo_reclamo: string;
  expediente?: string;
  juzgado?: string;
  estado: EstadoCaso;
  fecha_apertura: string;
  notas: string;
  carta: CartaDatos | null;
  hoja_ruta: HojaRuta | null;
  notas_historial: Nota[] | null;
  /** Solo al leer: lo pone un trigger en cada update. */
  updated_at?: string;
}

interface FilaVencimiento {
  id: string;
  caso_id: string;
  fecha: string;
  descripcion: string;
  cumplido: boolean;
  tipo: TipoVencimiento;
  hora?: string;
  lugar?: string;
}

interface Contexto {
  casos: Caso[];
  /** false hasta terminar de cargar los casos desde Supabase. */
  listo: boolean;
  agregar: (caso: CasoNuevo) => Caso;
  actualizar: (id: string, cambio: (c: Caso) => Caso) => void;
  eliminar: (id: string) => void;
  /** Suma casos de una copia de seguridad; los que tienen el mismo id se reemplazan. Devuelve cuántos importó. */
  importar: (datos: unknown) => number;
  agregarVencimiento: (casoId: string, vencimiento: VencimientoNuevo) => void;
  marcarVencimiento: (casoId: string, vencimientoId: string, cumplido: boolean) => void;
  quitarVencimiento: (casoId: string, vencimientoId: string) => void;
}

const CasosContext = createContext<Contexto | null>(null);

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Supabase usa uuid; los ids de la versión en localStorage no lo son y se reemplazan. */
function idValido(id: string | undefined) {
  return id && UUID.test(id) ? id : crypto.randomUUID();
}

/** Tolera datos con formas viejas (un solo `proximoVencimiento`, ids no uuid, notas en un solo texto). */
function normalizar(caso: Partial<Caso> & { proximoVencimiento?: Vencimiento | null }): Caso {
  const vencimientos =
    caso.vencimientos ?? (caso.proximoVencimiento ? [{ ...caso.proximoVencimiento, cumplido: false }] : []);
  return migrarNotas({
    id: idValido(caso.id),
    cliente: caso.cliente ?? "",
    contacto: caso.contacto ?? "",
    empleador: caso.empleador ?? "",
    tipoReclamo: caso.tipoReclamo ?? "",
    expediente: caso.expediente ?? "",
    juzgado: caso.juzgado ?? "",
    estado: caso.estado ?? "consulta",
    fechaApertura: caso.fechaApertura ?? new Date().toISOString().slice(0, 10),
    vencimientos: vencimientos.map((v) => ({
      ...v,
      id: idValido(v.id),
      cumplido: v.cumplido ?? false,
      tipo: v.tipo === "tarea" ? "tarea" : "plazo",
      hora: v.hora ?? "",
      lugar: v.lugar ?? "",
    })),
    notas: caso.notas ?? "",
    historial: (caso.historial ?? []).map((n) => ({ ...n, id: idValido(n.id) })),
    carta: caso.carta ? { ...cartaVacia(), ...caso.carta } : null,
    hojaRuta: caso.hojaRuta ? { ...hojaRutaVacia(), ...caso.hojaRuta } : null,
  });
}

function aFilaCaso(c: Caso): FilaCaso {
  return {
    id: c.id,
    cliente: c.cliente,
    contacto: c.contacto,
    empleador: c.empleador,
    tipo_reclamo: c.tipoReclamo,
    expediente: c.expediente ?? "",
    juzgado: c.juzgado ?? "",
    estado: c.estado,
    fecha_apertura: c.fechaApertura,
    notas: c.notas,
    notas_historial: c.historial,
    carta: c.carta,
    hoja_ruta: c.hojaRuta,
  };
}

function aCaso(fila: FilaCaso, vencimientos: Vencimiento[]): Caso {
  return normalizar({
    id: fila.id,
    cliente: fila.cliente,
    contacto: fila.contacto,
    empleador: fila.empleador,
    tipoReclamo: fila.tipo_reclamo,
    expediente: fila.expediente,
    juzgado: fila.juzgado,
    estado: fila.estado,
    fechaApertura: fila.fecha_apertura,
    notas: fila.notas,
    historial: fila.notas_historial ?? [],
    carta: fila.carta,
    hojaRuta: fila.hoja_ruta,
    vencimientos,
  });
}

function aVencimiento(fv: FilaVencimiento): Vencimiento {
  return {
    id: fv.id,
    fecha: fv.fecha,
    descripcion: fv.descripcion,
    cumplido: fv.cumplido,
    tipo: fv.tipo,
    hora: fv.hora ?? "",
    lugar: fv.lugar ?? "",
  };
}

/** Anota el `updated_at` de la fila (si la base ya tiene esa columna). */
function recordarVersion(versiones: Map<string, string>, id: string, fila: { updated_at?: string } | null) {
  if (fila?.updated_at) versiones.set(id, fila.updated_at);
}

export function CasosProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(createClient);
  const [casos, setCasos] = useState<Caso[]>([]);
  const [listo, setListo] = useState(false);
  const [errorGuardado, setErrorGuardado] = useState(false);

  /** Última versión que quedó guardada de cada caso: contra ella se calcula qué mandar. */
  const guardados = useRef(new Map<string, Caso>());
  /** `updated_at` de la fila de cada caso, para notar si otro dispositivo la cambió antes de guardar. */
  const versiones = useRef(new Map<string, string>());
  const pendientes = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  /** Guardado en curso de cada caso: los de un mismo caso van de a uno. */
  const enCurso = useRef(new Map<string, Promise<void>>());
  /** Escrituras en vuelo y total empezadas: una recarga que se cruza con una escritura se descarta. */
  const ocupados = useRef(0);
  const escrituras = useRef(0);
  const usuario = useRef<string | null | undefined>(undefined);
  const cargando = useRef(false);
  const guardarAhoraRef = useRef<(id: string) => Promise<void>>(async () => {});
  /** Espejo de `casos` para leer la versión vigente desde los timers. */
  const casosRef = useRef(casos);
  useEffect(() => {
    casosRef.current = casos;
  }, [casos]);

  /** Envuelve una escritura a Supabase para que las recargas sepan que hay algo en vuelo. */
  const escribiendo = useCallback(async (tarea: () => Promise<void>) => {
    ocupados.current++;
    escrituras.current++;
    try {
      await tarea();
    } catch {
      // Sin conexión, por ejemplo; la cola de guardados de ese caso sigue andando.
      setErrorGuardado(true);
    } finally {
      ocupados.current--;
    }
  }, []);

  /** Agenda el guardado de un caso; varios cambios seguidos se guardan juntos. */
  const programarGuardado = useCallback((id: string) => {
    clearTimeout(pendientes.current.get(id));
    pendientes.current.set(
      id,
      setTimeout(() => void guardarAhoraRef.current(id), ESPERA_GUARDADO_MS),
    );
  }, []);

  /**
   * Otro dispositivo cambió el caso desde la última vez que lo leímos: se trae la versión de Supabase,
   * se le aplican encima los cambios de acá y se vuelve a guardar.
   */
  const resolverConflicto = useCallback(
    async (id: string, anterior: Caso) => {
      const [{ data: fila, error }, { data: filasVenc, error: e }] = await Promise.all([
        supabase.from("casos").select("*").eq("id", id).maybeSingle(),
        supabase.from("vencimientos").select("*").eq("caso_id", id).order("created_at"),
      ]);
      if (error || e) return setErrorGuardado(true);
      if (!fila) {
        // Se borró en otro dispositivo.
        guardados.current.delete(id);
        versiones.current.delete(id);
        setCasos((actuales) => actuales.filter((c) => c.id !== id));
        return;
      }
      const remoto = aCaso(fila as FilaCaso, ((filasVenc ?? []) as FilaVencimiento[]).map(aVencimiento));
      guardados.current.set(id, remoto);
      recordarVersion(versiones.current, id, fila as FilaCaso);
      setCasos((actuales) => actuales.map((c) => (c.id === id ? fusionar(anterior, c, remoto) : c)));
      programarGuardado(id);
    },
    [supabase, programarGuardado],
  );

  const guardarUnaVez = useCallback(
    async (id: string) => {
      const caso = casosRef.current.find((c) => c.id === id);
      if (!caso) return;
      const anterior = guardados.current.get(id);

      // La fila del caso: entera si es nuevo; si no, solo las columnas que cambiaron, y
      // solo si nadie la tocó desde que la leímos (si la tocaron, primero se fusiona).
      if (!anterior) {
        const { data, error } = await supabase.from("casos").upsert(aFilaCaso(caso)).select().single();
        if (error) return setErrorGuardado(true);
        recordarVersion(versiones.current, id, data as FilaCaso);
      } else {
        const cambios = diferencias(aFilaCaso(caso), aFilaCaso(anterior));
        if (Object.keys(cambios).length > 0) {
          let consulta = supabase.from("casos").update(cambios).eq("id", id);
          const version = versiones.current.get(id);
          if (version) consulta = consulta.eq("updated_at", version);
          const { data, error } = await consulta.select();
          if (error) return setErrorGuardado(true);
          if (!data?.length) return resolverConflicto(id, anterior);
          recordarVersion(versiones.current, id, data[0] as FilaCaso);
        }
      }

      // Vencimientos: solo los nuevos, los campos tocados de los modificados y los quitados.
      // Así no se pisa lo que se tildó en otro dispositivo.
      const { nuevos, modificados, quitados } = cambiosVencimientos(caso, anterior);
      const resultados = await Promise.all([
        nuevos.length > 0 ? supabase.from("vencimientos").upsert(nuevos.map((v) => ({ ...v, caso_id: id }))) : null,
        ...modificados.map((m) => supabase.from("vencimientos").update(m.cambios).eq("id", m.id)),
        quitados.length > 0 ? supabase.from("vencimientos").delete().in("id", quitados) : null,
      ]);
      if (resultados.some((r) => r?.error)) return setErrorGuardado(true);

      guardados.current.set(id, caso);
    },
    [supabase, resolverConflicto],
  );

  const guardarAhora = useCallback(
    (id: string) => {
      pendientes.current.delete(id);
      const previo = enCurso.current.get(id) ?? Promise.resolve();
      const tarea = previo.then(() => escribiendo(() => guardarUnaVez(id)));
      enCurso.current.set(id, tarea);
      void tarea.finally(() => {
        if (enCurso.current.get(id) === tarea) enCurso.current.delete(id);
      });
      return tarea;
    },
    [escribiendo, guardarUnaVez],
  );
  useEffect(() => {
    guardarAhoraRef.current = guardarAhora;
  }, [guardarAhora]);

  /**
   * Lee todos los casos de Supabase. Al cambiar de usuario reemplaza todo; al volver a la pestaña
   * fusiona con lo local, para no perder cambios que todavía no se guardaron.
   */
  const cargar = useCallback(
    async (modo: "reemplazar" | "fusionar") => {
      const escriturasAlEmpezar = escrituras.current;
      const [{ data: filasCasos, error }, { data: filasVenc, error: e }] = await Promise.all([
        supabase.from("casos").select("*").order("created_at"),
        supabase.from("vencimientos").select("*").order("created_at"),
      ]);
      // Si se cruzó con un guardado, lo leído puede ser anterior: se prueba en la próxima vuelta.
      if (modo === "fusionar" && (error || e || ocupados.current > 0 || escrituras.current !== escriturasAlEmpezar)) {
        return;
      }
      const porCaso = new Map<string, Vencimiento[]>();
      for (const fv of (filasVenc ?? []) as FilaVencimiento[]) {
        const lista = porCaso.get(fv.caso_id) ?? [];
        lista.push(aVencimiento(fv));
        porCaso.set(fv.caso_id, lista);
      }
      const filas = error ? [] : ((filasCasos ?? []) as FilaCaso[]);
      const remotos = filas.map((f) => aCaso(f, porCaso.get(f.id) ?? []));

      const base = guardados.current;
      guardados.current = new Map(remotos.map((c) => [c.id, c]));
      versiones.current = new Map();
      filas.forEach((f) => recordarVersion(versiones.current, f.id, f));

      if (modo === "reemplazar") {
        setCasos(remotos);
      } else {
        // Lo que había quedado sin guardar (por ejemplo, por un corte de conexión) se vuelve a mandar.
        const sinGuardar = casosRef.current.filter((c) => !iguales(c, base.get(c.id)));
        setCasos((actuales) => fusionarCarga(actuales, base, remotos));
        sinGuardar.forEach((c) => programarGuardado(c.id));
      }
      setListo(true);
    },
    [supabase, programarGuardado],
  );

  useEffect(() => {
    // Carga al arrancar y cada vez que cambia el usuario (entrar o salir de la cuenta).
    // Supabase repite eventos de sesión al refrescar el token; esos no recargan.
    const { data } = supabase.auth.onAuthStateChange((_evento, sesion) => {
      const nuevo = sesion?.user.id ?? null;
      if (nuevo === usuario.current) return;
      usuario.current = nuevo;
      // Fuera del callback: llamar a Supabase desde adentro puede trabar la sesión.
      setTimeout(() => void cargar("reemplazar"), 0);
    });
    return () => data.subscription.unsubscribe();
  }, [supabase, cargar]);

  useEffect(() => {
    // Al volver a la pestaña se traen los cambios hechos en otro dispositivo, si no hay guardados pendientes.
    const alVolver = async () => {
      if (document.visibilityState !== "visible" || !usuario.current || cargando.current) return;
      if (pendientes.current.size > 0 || ocupados.current > 0) return;
      cargando.current = true;
      try {
        await cargar("fusionar");
      } finally {
        cargando.current = false;
      }
    };
    const escuchar = () => void alVolver();
    document.addEventListener("visibilitychange", escuchar);
    window.addEventListener("focus", escuchar);
    return () => {
      document.removeEventListener("visibilitychange", escuchar);
      window.removeEventListener("focus", escuchar);
    };
  }, [cargar]);

  const agregar = useCallback(
    (caso: CasoNuevo) => {
      const nuevo = normalizar(caso);
      setCasos((actuales) => [...actuales, nuevo]);
      casosRef.current = [...casosRef.current, nuevo];
      programarGuardado(nuevo.id);
      return nuevo;
    },
    [programarGuardado],
  );

  const actualizar = useCallback(
    (id: string, cambio: (c: Caso) => Caso) => {
      setCasos((actuales) => actuales.map((c) => (c.id === id ? cambio(c) : c)));
      programarGuardado(id);
    },
    [programarGuardado],
  );

  const eliminar = useCallback(
    (id: string) => {
      clearTimeout(pendientes.current.get(id));
      pendientes.current.delete(id);
      guardados.current.delete(id);
      versiones.current.delete(id);
      setCasos((actuales) => actuales.filter((c) => c.id !== id));
      // Los vencimientos se borran solos (on delete cascade).
      void escribiendo(async () => {
        const { error } = await supabase.from("casos").delete().eq("id", id);
        if (error) setErrorGuardado(true);
      });
      // Los documentos no se borran solos: son datos sensibles y no deben quedar huérfanos.
      void (async () => {
        const { data: sesion } = await supabase.auth.getUser();
        if (!sesion.user) return;
        const carpeta = carpetaDelCaso(sesion.user.id, id);
        const { data: archivos } = await supabase.storage.from(BUCKET).list(carpeta, { limit: 1000 });
        if (archivos?.length) await supabase.storage.from(BUCKET).remove(archivos.map((a) => `${carpeta}/${a.name}`));
      })();
    },
    [supabase, escribiendo],
  );

  const importar = useCallback(
    (datos: unknown) => {
      if (!Array.isArray(datos)) throw new Error("El archivo no es una copia de seguridad de MyCase.");
      const importados = datos.filter((d) => d && typeof d === "object" && "id" in d).map(normalizar);
      const ids = new Set(importados.map((c) => c.id));
      setCasos((actuales) => [...actuales.filter((c) => !ids.has(c.id)), ...importados]);
      casosRef.current = [...casosRef.current.filter((c) => !ids.has(c.id)), ...importados];
      importados.forEach((c) => programarGuardado(c.id));
      return importados.length;
    },
    [programarGuardado],
  );

  const agregarVencimiento = useCallback(
    (casoId: string, vencimiento: VencimientoNuevo) => {
      actualizar(casoId, (c) => ({
        ...c,
        vencimientos: [
          ...c.vencimientos,
          { tipo: "plazo", ...vencimiento, id: crypto.randomUUID(), cumplido: false },
        ],
      }));
    },
    [actualizar],
  );

  const marcarVencimiento = useCallback(
    (casoId: string, vencimientoId: string, cumplido: boolean) => {
      actualizar(casoId, (c) => ({
        ...c,
        vencimientos: c.vencimientos.map((v) => (v.id === vencimientoId ? { ...v, cumplido } : v)),
      }));
    },
    [actualizar],
  );

  const quitarVencimiento = useCallback(
    (casoId: string, vencimientoId: string) => {
      actualizar(casoId, (c) => ({
        ...c,
        vencimientos: c.vencimientos.filter((v) => v.id !== vencimientoId),
      }));
    },
    [actualizar],
  );

  return (
    <CasosContext.Provider
      value={{
        casos,
        listo,
        agregar,
        actualizar,
        eliminar,
        importar,
        agregarVencimiento,
        marcarVencimiento,
        quitarVencimiento,
      }}
    >
      {children}
      {errorGuardado && (
        <div
          role="alert"
          className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-md items-center justify-between gap-3 rounded-2xl bg-red-600 px-4 py-3 text-sm text-white shadow-lg"
        >
          <span>No pudimos guardar el último cambio. Revisá tu conexión y recargá la página.</span>
          <button type="button" className="font-semibold underline" onClick={() => setErrorGuardado(false)}>
            Cerrar
          </button>
        </div>
      )}
    </CasosContext.Provider>
  );
}

export function useCasos() {
  const ctx = useContext(CasosContext);
  if (!ctx) throw new Error("useCasos debe usarse dentro de <CasosProvider>");
  return ctx;
}
