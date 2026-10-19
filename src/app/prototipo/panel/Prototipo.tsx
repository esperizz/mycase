"use client";

// PROTOTIPO — descartable. El panel real con casos de ejemplo en memoria (nada se guarda).

import { Panel, type VarianteIndicadores } from "@/components/panel/Panel";
import { Header } from "@/components/ui/Header";
import { PrototypeSwitcher } from "@/components/ui/PrototypeSwitcher";
import { CasosContext } from "@/lib/casos/CasosProvider";
import { hoyIso, sumarDias } from "@/lib/casos/formato";
import { hojaRutaVacia } from "@/lib/casos/hojaRuta";
import type { Caso } from "@/lib/casos/tipos";

const VARIANTES: { clave: string; nombre: string; indicadores: VarianteIndicadores }[] = [
  { clave: "A", nombre: "Como está hoy", indicadores: "actual" },
  { clave: "B", nombre: "Sin tarjetas", indicadores: "ninguno" },
  { clave: "C", nombre: "Tarjetas nuevas", indicadores: "nuevos" },
];

const hoy = hoyIso();
const base = { contacto: "", estado: "consulta" as const, fechaApertura: hoy, notas: "", carta: null, hojaRuta: null };
const CASOS: Caso[] = [
  {
    ...base,
    id: "1",
    cliente: "Juan Pérez",
    empleador: "Cardales SA",
    tipoReclamo: "Despido sin causa",
    vencimientos: [
      { id: "a", fecha: sumarDias(hoy, 1), descripcion: "Llamar al cliente", cumplido: false, tipo: "tarea" },
    ],
  },
  {
    ...base,
    id: "2",
    cliente: "Carla Jaurez",
    empleador: "Metalúrgica Sur",
    tipoReclamo: "Despido sin causa",
    vencimientos: [
      { id: "b", fecha: sumarDias(hoy, 4), descripcion: "Contestar demanda", cumplido: false, tipo: "plazo" },
      { id: "c", fecha: sumarDias(hoy, 2), descripcion: "Pedir documentación", cumplido: false, tipo: "tarea" },
    ],
  },
  {
    ...base,
    id: "3",
    cliente: "Marta Ríos",
    empleador: "Textil Norte",
    tipoReclamo: "Accidente de trabajo",
    vencimientos: [],
    hojaRuta: { ...hojaRutaVacia(), cumplidos: { denuncia: hoy, respuesta: hoy }, avisados: { denuncia: hoy } },
  },
  { ...base, id: "4", cliente: "Pedro Gómez", empleador: "Logística Este", tipoReclamo: "Trabajo no registrado", vencimientos: [] },
  { ...base, id: "5", cliente: "Lucía Fernández", empleador: "Comercio Oeste", tipoReclamo: "Diferencias salariales", vencimientos: [] },
];
const nada = () => {};

export function Prototipo({ variante }: { variante: string }) {
  const actual = VARIANTES.find((v) => v.clave === variante) ?? VARIANTES[0];
  return (
    <CasosContext.Provider
      value={{
        casos: CASOS,
        listo: true,
        agregar: () => CASOS[0],
        actualizar: nada,
        eliminar: nada,
        importar: () => 0,
        agregarVencimiento: nada,
        marcarVencimiento: nada,
        quitarVencimiento: nada,
      }}
    >
      <Header />
      <main className="mx-auto w-full max-w-5xl px-4 py-8 pb-24">
        <p className="mb-6 rounded-lg border border-dashed border-fuchsia-400 bg-fuchsia-50 p-3 text-sm text-fuchsia-900">
          <strong>Prototipo descartable.</strong> El panel con casos de ejemplo. Compará las tarjetas de arriba con la
          barra de abajo o las flechas ← →.
        </p>
        <Panel indicadores={actual.indicadores} />
      </main>
      <PrototypeSwitcher variantes={VARIANTES} actual={actual.clave} />
    </CasosContext.Provider>
  );
}
