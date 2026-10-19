"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { BUCKET, carpetaDelCaso } from "./documentos";
import { hojaRutaVacia } from "./hojaRuta";
import { migrarNotas } from "./notas";
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
  estado: EstadoCaso;
  fecha_apertura: string;
  notas: string;
  carta: CartaDatos | null;
  hoja_ruta: HojaRuta | null;
  notas_historial: Nota[] | null;
}

interface FilaVencimiento {
  id: string;
  caso_id: string;
  fecha: string;
  descripcion: string;
  cumplido: boolean;
  tipo: TipoVencimiento;
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
    estado: caso.estado ?? "consulta",
    fechaApertura: caso.fechaApertura ?? new Date().toISOString().slice(0, 10),
    vencimientos: vencimientos.map((v) => ({
      ...v,
      id: idValido(v.id),
      cumplido: v.cumplido ?? false,
      tipo: v.tipo === "tarea" ? "tarea" : "plazo",
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
    estado: fila.estado,
    fechaApertura: fila.fecha_apertura,
    notas: fila.notas,
    historial: fila.notas_historial ?? [],
    carta: fila.carta,
    hojaRuta: fila.hoja_ruta,
    vencimientos,
  });
}

export function CasosProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(createClient);
  const [casos, setCasos] = useState<Caso[]>([]);
  const [listo, setListo] = useState(false);
  const [errorGuardado, setErrorGuardado] = useState(false);

  /** Última versión que quedó guardada de cada caso, para saber qué vencimientos borrar. */
  const guardados = useRef(new Map<string, Caso>());
  const pendientes = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  /** Espejo de `casos` para leer la versión vigente desde los timers. */
  const casosRef = useRef(casos);
  useEffect(() => {
    casosRef.current = casos;
  }, [casos]);

  const guardarAhora = useCallback(
    async (id: string) => {
      pendientes.current.delete(id);
      const caso = casosRef.current.find((c) => c.id === id);
      if (!caso) return;
      const anterior = guardados.current.get(id);

      const { error } = await supabase.from("casos").upsert(aFilaCaso(caso));
      let fallo = !!error;
      if (!fallo && caso.vencimientos.length > 0) {
        const { error: e } = await supabase
          .from("vencimientos")
          .upsert(caso.vencimientos.map((v) => ({ ...v, caso_id: id })));
        fallo = !!e;
      }
      const vigentes = new Set(caso.vencimientos.map((v) => v.id));
      const quitados = (anterior?.vencimientos ?? []).filter((v) => !vigentes.has(v.id)).map((v) => v.id);
      if (!fallo && quitados.length > 0) {
        const { error: e } = await supabase.from("vencimientos").delete().in("id", quitados);
        fallo = !!e;
      }

      if (fallo) setErrorGuardado(true);
      else guardados.current.set(id, caso);
    },
    [supabase],
  );

  /** Agenda el guardado de un caso; varios cambios seguidos se guardan juntos. */
  const programarGuardado = useCallback(
    (id: string) => {
      clearTimeout(pendientes.current.get(id));
      pendientes.current.set(
        id,
        setTimeout(() => void guardarAhora(id), ESPERA_GUARDADO_MS),
      );
    },
    [guardarAhora],
  );

  const cargar = useCallback(async () => {
    const [{ data: filasCasos, error }, { data: filasVenc }] = await Promise.all([
      supabase.from("casos").select("*").order("created_at"),
      supabase.from("vencimientos").select("*").order("created_at"),
    ]);
    const porCaso = new Map<string, Vencimiento[]>();
    for (const fv of (filasVenc ?? []) as FilaVencimiento[]) {
      const lista = porCaso.get(fv.caso_id) ?? [];
      lista.push({ id: fv.id, fecha: fv.fecha, descripcion: fv.descripcion, cumplido: fv.cumplido, tipo: fv.tipo });
      porCaso.set(fv.caso_id, lista);
    }
    const cargados = error ? [] : ((filasCasos ?? []) as FilaCaso[]).map((f) => aCaso(f, porCaso.get(f.id) ?? []));
    guardados.current = new Map(cargados.map((c) => [c.id, c]));
    setCasos(cargados);
    setListo(true);
  }, [supabase]);

  useEffect(() => {
    // Carga al arrancar y cada vez que cambia el usuario (entrar o salir de la cuenta).
    // Supabase repite eventos de sesión al refrescar el token; esos no recargan.
    let usuario: string | null | undefined;
    const { data } = supabase.auth.onAuthStateChange((_evento, sesion) => {
      const nuevo = sesion?.user.id ?? null;
      if (nuevo === usuario) return;
      usuario = nuevo;
      // Fuera del callback: llamar a Supabase desde adentro puede trabar la sesión.
      setTimeout(() => void cargar(), 0);
    });
    return () => data.subscription.unsubscribe();
  }, [supabase, cargar]);

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
      setCasos((actuales) => actuales.filter((c) => c.id !== id));
      // Los vencimientos se borran solos (on delete cascade).
      void supabase
        .from("casos")
        .delete()
        .eq("id", id)
        .then(({ error }) => error && setErrorGuardado(true));
      // Los documentos no se borran solos: son datos sensibles y no deben quedar huérfanos.
      void (async () => {
        const { data: sesion } = await supabase.auth.getUser();
        if (!sesion.user) return;
        const carpeta = carpetaDelCaso(sesion.user.id, id);
        const { data: archivos } = await supabase.storage.from(BUCKET).list(carpeta, { limit: 1000 });
        if (archivos?.length) await supabase.storage.from(BUCKET).remove(archivos.map((a) => `${carpeta}/${a.name}`));
      })();
    },
    [supabase],
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
          className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-md items-center justify-between gap-3 rounded-lg bg-red-600 px-4 py-3 text-sm text-white shadow-lg"
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
