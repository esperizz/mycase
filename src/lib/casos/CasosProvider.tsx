"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Caso, CasoNuevo, EstadoCaso, Vencimiento } from "./tipos";

interface FilaCaso {
  id: string;
  cliente: string;
  contacto: string;
  empleador: string;
  tipo_reclamo: string;
  estado: EstadoCaso;
  fecha_apertura: string;
  notas: string;
}

interface FilaVencimiento {
  id: string;
  caso_id: string;
  fecha: string;
  descripcion: string;
  cumplido: boolean;
}

function aCaso(fila: FilaCaso, vencimientos: Vencimiento[]): Caso {
  return {
    id: fila.id,
    cliente: fila.cliente,
    contacto: fila.contacto,
    empleador: fila.empleador,
    tipoReclamo: fila.tipo_reclamo,
    estado: fila.estado,
    fechaApertura: fila.fecha_apertura,
    notas: fila.notas,
    vencimientos,
  };
}

function aVencimiento(fila: FilaVencimiento): Vencimiento {
  return { id: fila.id, fecha: fila.fecha, descripcion: fila.descripcion, cumplido: fila.cumplido };
}

interface Contexto {
  casos: Caso[];
  /** false hasta terminar de cargar los casos desde Supabase. */
  listo: boolean;
  agregar: (caso: CasoNuevo) => Promise<Caso>;
  actualizar: (id: string, cambio: (c: Caso) => Caso) => void;
  agregarVencimiento: (casoId: string, vencimiento: Omit<Vencimiento, "id" | "cumplido">) => void;
  marcarVencimiento: (casoId: string, vencimientoId: string, cumplido: boolean) => void;
  quitarVencimiento: (casoId: string, vencimientoId: string) => void;
}

const CasosContext = createContext<Contexto | null>(null);

export function CasosProvider({ children }: { children: React.ReactNode }) {
  const [casos, setCasos] = useState<Caso[]>([]);
  const [listo, setListo] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    let cancelado = false;

    async function cargar() {
      const { data: filasCasos, error: errorCasos } = await supabase
        .from("casos")
        .select("*")
        .order("fecha_apertura", { ascending: false });

      if (errorCasos || !filasCasos) {
        if (!cancelado) setListo(true);
        return;
      }

      const { data: filasVencimientos } = await supabase.from("vencimientos").select("*");

      if (cancelado) return;

      const porCaso = new Map<string, Vencimiento[]>();
      for (const fv of (filasVencimientos ?? []) as FilaVencimiento[]) {
        const lista = porCaso.get(fv.caso_id) ?? [];
        lista.push(aVencimiento(fv));
        porCaso.set(fv.caso_id, lista);
      }

      setCasos((filasCasos as FilaCaso[]).map((fc) => aCaso(fc, porCaso.get(fc.id) ?? [])));
      setListo(true);
    }

    cargar();
    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- supabase client es estable, se crea una sola vez
  }, []);

  const agregar = useCallback(
    async (caso: CasoNuevo) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No hay sesión activa.");

      const { data, error } = await supabase
        .from("casos")
        .insert({
          user_id: user.id,
          cliente: caso.cliente,
          contacto: caso.contacto,
          empleador: caso.empleador,
          tipo_reclamo: caso.tipoReclamo,
          estado: caso.estado,
          notas: caso.notas ?? "",
        })
        .select()
        .single();

      if (error || !data) throw error ?? new Error("No se pudo crear el caso.");

      const nuevo = aCaso(data as FilaCaso, []);
      setCasos((actuales) => [nuevo, ...actuales]);
      return nuevo;
    },
    [supabase],
  );

  const actualizar = useCallback(
    (id: string, cambio: (c: Caso) => Caso) => {
      setCasos((actuales) => {
        const actual = actuales.find((c) => c.id === id);
        if (!actual) return actuales;
        const nuevo = cambio(actual);

        supabase
          .from("casos")
          .update({
            cliente: nuevo.cliente,
            contacto: nuevo.contacto,
            empleador: nuevo.empleador,
            tipo_reclamo: nuevo.tipoReclamo,
            estado: nuevo.estado,
            notas: nuevo.notas,
          })
          .eq("id", id)
          .then(() => {});

        return actuales.map((c) => (c.id === id ? nuevo : c));
      });
    },
    [supabase],
  );

  const agregarVencimiento = useCallback(
    (casoId: string, vencimiento: Omit<Vencimiento, "id" | "cumplido">) => {
      supabase
        .from("vencimientos")
        .insert({ caso_id: casoId, fecha: vencimiento.fecha, descripcion: vencimiento.descripcion })
        .select()
        .single()
        .then(({ data }) => {
          if (!data) return;
          const nuevo = aVencimiento(data as FilaVencimiento);
          setCasos((actuales) =>
            actuales.map((c) => (c.id === casoId ? { ...c, vencimientos: [...c.vencimientos, nuevo] } : c)),
          );
        });
    },
    [supabase],
  );

  const marcarVencimiento = useCallback(
    (casoId: string, vencimientoId: string, cumplido: boolean) => {
      setCasos((actuales) =>
        actuales.map((c) =>
          c.id === casoId
            ? { ...c, vencimientos: c.vencimientos.map((v) => (v.id === vencimientoId ? { ...v, cumplido } : v)) }
            : c,
        ),
      );
      supabase.from("vencimientos").update({ cumplido }).eq("id", vencimientoId).then(() => {});
    },
    [supabase],
  );

  const quitarVencimiento = useCallback(
    (casoId: string, vencimientoId: string) => {
      setCasos((actuales) =>
        actuales.map((c) =>
          c.id === casoId ? { ...c, vencimientos: c.vencimientos.filter((v) => v.id !== vencimientoId) } : c,
        ),
      );
      supabase.from("vencimientos").delete().eq("id", vencimientoId).then(() => {});
    },
    [supabase],
  );

  return (
    <CasosContext.Provider
      value={{ casos, listo, agregar, actualizar, agregarVencimiento, marcarVencimiento, quitarVencimiento }}
    >
      {children}
    </CasosContext.Provider>
  );
}

export function useCasos() {
  const ctx = useContext(CasosContext);
  if (!ctx) throw new Error("useCasos debe usarse dentro de <CasosProvider>");
  return ctx;
}
