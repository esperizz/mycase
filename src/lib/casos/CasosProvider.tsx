"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Caso, CasoNuevo } from "./tipos";

const CLAVE = "mycase-casos";

interface Contexto {
  casos: Caso[];
  /** false hasta leer lo guardado, para no pisarlo con la lista vacía inicial. */
  listo: boolean;
  agregar: (caso: CasoNuevo) => Caso;
  actualizar: (id: string, cambio: (c: Caso) => Caso) => void;
}

const CasosContext = createContext<Contexto | null>(null);

function crearId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function CasosProvider({ children }: { children: React.ReactNode }) {
  const [casos, setCasos] = useState<Caso[]>([]);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    try {
      const guardado = localStorage.getItem(CLAVE);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hidratar desde localStorage
      if (guardado) setCasos(JSON.parse(guardado));
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
    const nuevo: Caso = {
      ...caso,
      id: crearId(),
      fechaApertura: new Date().toISOString().slice(0, 10),
      proximoVencimiento: caso.proximoVencimiento ?? null,
      notas: caso.notas ?? "",
    };
    setCasos((actuales) => [...actuales, nuevo]);
    return nuevo;
  }, []);

  const actualizar = useCallback((id: string, cambio: (c: Caso) => Caso) => {
    setCasos((actuales) => actuales.map((c) => (c.id === id ? cambio(c) : c)));
  }, []);

  return (
    <CasosContext.Provider value={{ casos, listo, agregar, actualizar }}>
      {children}
    </CasosContext.Provider>
  );
}

export function useCasos() {
  const ctx = useContext(CasosContext);
  if (!ctx) throw new Error("useCasos debe usarse dentro de <CasosProvider>");
  return ctx;
}
