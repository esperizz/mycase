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
/** Mucho volumen: plazos que coinciden, uno vencido, varios casos sin próximo paso y avisos pendientes. */
const haceDias = (n: number) => new Date(Date.now() - n * 86_400_000).toLocaleDateString("en-CA");
const NOMBRES = [
  "Ana Torres", "Bruno Díaz", "Camila Sosa", "Diego Romero", "Elena Ruiz", "Facundo Molina", "Gabriela Castro",
  "Hernán Ortiz", "Inés Silva", "Javier Núñez", "Karina Luna", "Leandro Paz", "Micaela Ríos", "Nicolás Vega",
  "Olga Medina", "Pablo Herrera", "Rocío Blanco", "Sergio Méndez",
];
const MUCHOS: Caso[] = NOMBRES.map((cliente, i) => {
  const caso: Caso = { ...base, id: `m${i}`, cliente, empleador: `Empresa ${i + 1}`, tipoReclamo: "Despido sin causa", vencimientos: [] };
  if (i < 3) caso.vencimientos = [{ id: `p${i}`, fecha: sumarDias(hoy, 2), descripcion: "Contestar demanda", cumplido: false, tipo: "plazo" }];
  else if (i === 3 || i === 4) caso.vencimientos = [{ id: `venc${i}`, fecha: haceDias(i - 1), descripcion: "Presentar escrito", cumplido: false, tipo: "plazo" }];
  else if (i < 8) caso.vencimientos = [{ id: `t${i}`, fecha: sumarDias(hoy, i - 3), descripcion: "Llamar al cliente", cumplido: false, tipo: "tarea" }];
  else if (i < 14) {
    caso.tipoReclamo = "Accidente de trabajo";
    caso.hojaRuta = { ...hojaRutaVacia(), cumplidos: { denuncia: hoy, respuesta: hoy } };
  }
  // del 14 en adelante: sin próximo paso
  return caso;
});

const nada = () => {};

export function Prototipo({ variante, muchos }: { variante: string; muchos: boolean }) {
  const actual = VARIANTES.find((v) => v.clave === variante) ?? VARIANTES[0];
  const casos = muchos ? MUCHOS : CASOS;
  return (
    <CasosContext.Provider
      value={{
        casos,
        listo: true,
        agregar: () => casos[0],
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
          barra de abajo o las flechas ← →.{" "}
          <a href={`?variant=${actual.clave}${muchos ? "" : "&datos=muchos"}`} className="font-semibold underline">
            {muchos ? "Ver con pocos casos" : "Ver con muchos casos"}
          </a>
        </p>
        <Panel indicadores={actual.indicadores} />
      </main>
      <PrototypeSwitcher variantes={VARIANTES} actual={actual.clave} />
    </CasosContext.Provider>
  );
}
