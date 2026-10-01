"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Caso, CasoNuevo, Vencimiento } from "./tipos";

const CLAVE = "mycase-casos";

interface Contexto {
  casos: Caso[];
  /** false hasta leer lo guardado, para no pisarlo con la lista vacía inicial. */
  listo: boolean;
  agregar: (caso: CasoNuevo) => Caso;
  actualizar: (id: string, cambio: (c: Caso) => Caso) => void;
  agregarVencimiento: (casoId: string, vencimiento: Omit<Vencimiento, "id" | "cumplido">) => void;
  marcarVencimiento: (casoId: string, vencimientoId: string, cumplido: boolean) => void;
  quitarVencimiento: (casoId: string, vencimientoId: string) => void;
}

const CasosContext = createContext<Contexto | null>(null);

function crearId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Tolera datos guardados con la forma vieja (un solo `proximoVencimiento`). */
function normalizar(caso: Partial<Caso> & { proximoVencimiento?: Vencimiento | null }): Caso {
  const vencimientos =
    caso.vencimientos ??
    (caso.proximoVencimiento ? [{ ...caso.proximoVencimiento, id: crearId(), cumplido: false }] : []);
  return {
    id: caso.id ?? crearId(),
    cliente: caso.cliente ?? "",
    contacto: caso.contacto ?? "",
    empleador: caso.empleador ?? "",
    tipoReclamo: caso.tipoReclamo ?? "",
    estado: caso.estado ?? "consulta",
    fechaApertura: caso.fechaApertura ?? new Date().toISOString().slice(0, 10),
    vencimientos,
    notas: caso.notas ?? "",
    carta: caso.carta ?? null,
  };
}

export function CasosProvider({ children }: { children: React.ReactNode }) {
  const [casos, setCasos] = useState<Caso[]>([]);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    try {
      const guardado = localStorage.getItem(CLAVE);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hidratar desde localStorage
      if (guardado) setCasos((JSON.parse(guardado) as Caso[]).map(normalizar));
    } catch {
      // Sin almacenamiento disponible: se arranca de cero.
    }
    setListo(true);
  }, []);

  useEffect(() => {
    if (!listo) return;
    try {
      localStorage.setItem(CLAVE, JSON.stringify(casos));
    } catch {
      // Ignorado: la persistencia es una comodidad, no un requisito.
    }
  }, [casos, listo]);

  const agregar = useCallback((caso: CasoNuevo) => {
    const nuevo = normalizar(caso);
    setCasos((actuales) => [...actuales, nuevo]);
    return nuevo;
  }, []);

  const actualizar = useCallback((id: string, cambio: (c: Caso) => Caso) => {
    setCasos((actuales) => actuales.map((c) => (c.id === id ? cambio(c) : c)));
  }, []);

  const agregarVencimiento = useCallback(
    (casoId: string, vencimiento: Omit<Vencimiento, "id" | "cumplido">) => {
      actualizar(casoId, (c) => ({
        ...c,
        vencimientos: [...c.vencimientos, { ...vencimiento, id: crearId(), cumplido: false }],
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
