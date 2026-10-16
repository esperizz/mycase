"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { useCasos } from "@/lib/casos/CasosProvider";
import { formatearFecha, diasHasta, hoyIso, textoDias } from "@/lib/casos/formato";
import {
  abrePlazo,
  cumplirPaso,
  hojaRutaVacia,
  linkWhatsApp,
  mensajeAviso,
  mensajeInicio,
  pasosDe,
  volverAPaso,
  type Paso,
} from "@/lib/casos/hojaRuta";
import type { Caso } from "@/lib/casos/tipos";

function abrirWhatsApp(contacto: string, texto: string) {
  window.open(linkWhatsApp(contacto, texto), "_blank", "noopener");
}

/** Paso actual: se marca cumplido, con o sin aviso al cliente por WhatsApp. */
function PasoActual({ caso, paso }: { caso: Caso; paso: Paso }) {
  const { actualizar } = useCasos();
  const esRespuesta = paso.id === "respuesta";
  const [rechazo, setRechazo] = useState(false);
  const [editado, setEditado] = useState<string | null>(null);
  const hoy = hoyIso();
  // En los pasos que abren un plazo legal, el plazo corre desde la notificación, no desde hoy.
  const [fecha, setFecha] = useState(hoy);
  const conFecha = abrePlazo(paso.id);

  const borrador = mensajeAviso(cumplirPaso(caso, paso.id, fecha, { rechazo }), paso.id);
  const texto = editado ?? borrador;

  const vencimientoId = caso.hojaRuta?.vencimientos[paso.id];
  const plazo = caso.vencimientos.find((v) => v.id === vencimientoId && !v.cumplido);

  const cumplir = (avisar: boolean) => {
    actualizar(caso.id, (c) => {
      const nuevo = cumplirPaso(c, paso.id, fecha || hoy, { rechazo });
      if (!avisar || !nuevo.hojaRuta) return nuevo;
      return { ...nuevo, hojaRuta: { ...nuevo.hojaRuta, avisados: { ...nuevo.hojaRuta.avisados, [paso.id]: hoy } } };
    });
    if (avisar) abrirWhatsApp(caso.contacto, texto);
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg border-2 border-gray-900 p-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Paso actual</p>
        <p className="text-lg font-bold text-gray-900">{paso.tecnico}</p>
      </div>
      {plazo && (
        <p
          className={`w-fit rounded-md px-2 py-1 text-sm font-semibold ${
            diasHasta(plazo.fecha) <= 2 ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-900"
          }`}
        >
          {plazo.descripcion}: {textoDias(diasHasta(plazo.fecha)).toLowerCase()} ({formatearFecha(plazo.fecha)})
        </p>
      )}
      {esRespuesta && (
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Respuesta de la ART">
          {[false, true].map((r) => (
            <button
              key={String(r)}
              type="button"
              role="radio"
              aria-checked={rechazo === r}
              onClick={() => {
                setRechazo(r);
                setEditado(null);
              }}
              className={`rounded-full border px-3 py-1 text-sm font-semibold ${
                rechazo === r ? "border-gray-900 bg-gray-900 text-white" : "border-gray-300 text-gray-700"
              }`}
            >
              {r ? "La ART rechazó" : "La ART aceptó"}
            </button>
          ))}
        </div>
      )}
      {conFecha && (
        <div className="max-w-xs">
          <TextField
            label="¿Cuándo se notificó?"
            type="date"
            max={hoy}
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
          <p className="mt-1 text-xs text-gray-500">El plazo legal se cuenta desde esta fecha.</p>
        </div>
      )}
      <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700">
        Aviso para el cliente (podés editarlo)
        <textarea
          rows={7}
          value={texto}
          onChange={(e) => setEditado(e.target.value)}
          className="rounded-lg border border-gray-300 p-3 font-normal text-gray-900 focus:border-gray-900 focus:outline-none"
        />
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button className="bg-green-700 hover:bg-green-800" onClick={() => cumplir(true)}>
          Cumplido y avisarle por WhatsApp
        </Button>
        <Button variante="secondary" onClick={() => cumplir(false)}>
          Cumplido, sin avisar
        </Button>
      </div>
    </div>
  );
}

/** Seguimiento paso a paso de un caso de ART, con avisos al cliente por WhatsApp. */
export function HojaRutaArt({ caso }: { caso: Caso }) {
  const { actualizar } = useCasos();

  if (!caso.hojaRuta) {
    return (
      <section className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="font-semibold text-gray-900">Hoja de ruta de ART</h2>
        <p className="text-sm text-gray-500">
          Seguí el reclamo paso a paso, con los plazos legales calculados en días hábiles, y avisale al cliente por
          WhatsApp cuando quieras.
        </p>
        <div>
          <Button onClick={() => actualizar(caso.id, (c) => ({ ...c, hojaRuta: hojaRutaVacia() }))}>
            Empezar hoja de ruta
          </Button>
        </div>
      </section>
    );
  }

  const hoja = caso.hojaRuta;
  const pasos = pasosDe(hoja);
  const actual = pasos.find((p) => p.estado === "actual");
  const hoy = hoyIso();

  const contarInicio = () => {
    actualizar(caso.id, (c) => (c.hojaRuta ? { ...c, hojaRuta: { ...c.hojaRuta, inicioAvisado: hoy } } : c));
    abrirWhatsApp(caso.contacto, mensajeInicio(caso));
  };

  const volver = (paso: Paso) => {
    const i = pasos.findIndex((p) => p.id === paso.id);
    const posteriores = pasos.slice(i + 1).filter((p) => p.estado === "cumplido").length;
    const avisos = pasos.slice(i).some((p) => p.avisado);
    const mensaje = [
      `¿Volver a "${paso.tecnico}"?`,
      posteriores > 0
        ? `Ese paso y los ${posteriores} posteriores quedan pendientes.`
        : "Ese paso queda pendiente.",
      avisos ? "Los avisos que ya le mandaste al cliente no se borran de WhatsApp: si hace falta, mandale una aclaración." : "",
    ]
      .filter(Boolean)
      .join("\n\n");
    if (window.confirm(mensaje)) actualizar(caso.id, (c) => volverAPaso(c, paso.id));
  };

  const avisarDespues = (paso: Paso) => {
    actualizar(caso.id, (c) =>
      c.hojaRuta ? { ...c, hojaRuta: { ...c.hojaRuta, avisados: { ...c.hojaRuta.avisados, [paso.id]: hoy } } } : c,
    );
    abrirWhatsApp(caso.contacto, mensajeAviso(caso, paso.id));
  };

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5">
      <h2 className="font-semibold text-gray-900">Hoja de ruta de ART</h2>

      {hoja.inicioAvisado ? (
        <p className="text-sm text-gray-500">
          Le contaste al cliente cómo va a ser el caso el {formatearFecha(hoja.inicioAvisado)}.{" "}
          <button type="button" onClick={contarInicio} className="font-semibold text-gray-900 underline underline-offset-2">
            Volver a mandar
          </button>
        </p>
      ) : (
        <div className="flex flex-col gap-2 rounded-lg bg-blue-50 p-4 text-sm text-blue-900 sm:flex-row sm:items-center sm:justify-between">
          <p>Contale al cliente todo el recorrido desde el principio: después, cada paso que se cumple confirma lo que le dijiste.</p>
          <Button onClick={contarInicio}>Contarle por WhatsApp</Button>
        </div>
      )}

      {actual ? <PasoActual key={actual.id} caso={caso} paso={actual} /> : <p className="rounded-lg bg-green-50 p-4 text-sm font-semibold text-green-900">Todos los pasos están cumplidos.</p>}

      <ol className="flex flex-col divide-y divide-gray-100">
        {pasos.map((p) => (
          <li key={p.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2 text-sm">
            <span
              className={`flex size-5 items-center justify-center rounded-full text-xs ${
                p.estado === "cumplido"
                  ? "bg-green-600 text-white"
                  : p.estado === "actual"
                    ? "border-2 border-gray-900"
                    : "border border-gray-300"
              }`}
              aria-hidden
            >
              {p.estado === "cumplido" ? "✓" : ""}
            </span>
            <span className={`flex-1 ${p.estado === "pendiente" ? "text-gray-400" : "text-gray-900"}`}>
              {p.tecnico}
              {p.id === "respuesta" && p.fecha && (hoja.rechazo ? " · rechazó" : " · aceptó")}
            </span>
            {p.fecha && (
              <span className="flex items-center gap-3 text-xs text-gray-500">
                {formatearFecha(p.fecha)}
                {p.avisado ? (
                  <span className="text-green-700">Avisado</span>
                ) : (
                  <button type="button" onClick={() => avisarDespues(p)} className="font-semibold text-gray-900 underline underline-offset-2">
                    Avisarle
                  </button>
                )}
                <button type="button" onClick={() => volver(p)} className="hover:underline">
                  Volver a este paso
                </button>
              </span>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
