"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { DialogoCerrarCaso } from "@/components/casos/CerrarCaso";import { DialogoConfirmar } from "@/components/ui/DialogoConfirmar";
import { TextField } from "@/components/ui/Field";
import { MenuAcciones } from "@/components/ui/MenuAcciones";
import { useCasos } from "@/lib/casos/CasosProvider";
import { diasHasta, fechaCorta, formatearFecha, hoyIso, textoDias } from "@/lib/casos/formato";
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
    <div className="flex flex-col gap-3 rounded-2xl border-2 border-tinta p-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Paso actual</p>
        <p className="text-lg font-bold text-tinta">{paso.tecnico}</p>
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
                rechazo === r ? "border-tinta bg-tinta text-white" : "border-linea text-gray-700"
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
        Mensaje para el cliente (podés editarlo)
        <textarea
          rows={7}
          value={texto}
          onChange={(e) => setEditado(e.target.value)}
          className="field-sizing-content min-h-40 rounded-2xl border border-linea p-3 font-normal text-tinta focus:border-tinta focus:outline-none"
        />
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button className="bg-green-700 hover:bg-green-800" onClick={() => cumplir(true)}>
          Cumplido e informarle por WhatsApp
        </Button>
        <Button variante="secondary" onClick={() => cumplir(false)}>
          Cumplido, sin informarle
        </Button>
      </div>
    </div>
  );
}

/** Seguimiento paso a paso de un caso de ART, con avisos al cliente por WhatsApp. */
export function HojaRutaArt({ caso }: { caso: Caso }) {
  const { actualizar } = useCasos();
  /** Id del paso al que se pidió volver, mientras se confirma. */
  const [volviendo, setVolviendo] = useState<string | null>(null);
  const [cerrando, setCerrando] = useState(false);

  if (!caso.hojaRuta) {
    return (
      <section className="flex flex-col gap-3 rounded-3xl border border-linea bg-white p-5">
        <h2 className="font-semibold text-tinta">Hoja de ruta de ART</h2>
        <p className="text-sm text-gray-500">
          Seguí el reclamo paso a paso, con los plazos legales calculados en días hábiles, e informale al cliente por
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

  const iVolver = pasos.findIndex((p) => p.id === volviendo);
  const pasoVolver = iVolver >= 0 ? pasos[iVolver] : null;
  const posteriores = pasos.slice(iVolver + 1).filter((p) => p.estado === "cumplido").length;
  const huboAvisos = iVolver >= 0 && pasos.slice(iVolver).some((p) => p.avisado);

  const avisarDespues = (paso: Paso) => {
    actualizar(caso.id, (c) =>
      c.hojaRuta ? { ...c, hojaRuta: { ...c.hojaRuta, avisados: { ...c.hojaRuta.avisados, [paso.id]: hoy } } } : c,
    );
    abrirWhatsApp(caso.contacto, mensajeAviso(caso, paso.id));
  };

  return (
    <section className="flex flex-col gap-4 rounded-3xl border border-linea bg-white p-5">
      <h2 className="font-semibold text-tinta">Hoja de ruta de ART</h2>

      {hoja.inicioAvisado ? (
        <p className="text-sm text-gray-500">
          Le informaste al cliente cómo va a ser el caso el {formatearFecha(hoja.inicioAvisado)}.{" "}
          <button type="button" onClick={contarInicio} className="font-semibold text-tinta underline underline-offset-2">
            Volver a mandar
          </button>
        </p>
      ) : (
        <div className="flex flex-col gap-2 rounded-2xl bg-blue-50 p-4 text-sm text-blue-900 sm:flex-row sm:items-center sm:justify-between">
          <p>Informale al cliente todo el recorrido desde el principio: después, cada paso que se cumple confirma lo que le dijiste.</p>
          <Button onClick={contarInicio}>Informarle el recorrido por WhatsApp</Button>
        </div>
      )}

      {actual ? (
        <PasoActual key={actual.id} caso={caso} paso={actual} />
      ) : (
        <div className="flex flex-col gap-3 rounded-2xl bg-green-50 p-4 text-green-900 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold">Todos los pasos están cumplidos.</p>
            {caso.estado !== "cerrado" && (
              <p className="text-sm">Si no queda nada más por hacer (por ejemplo, cobrar honorarios), cerralo.</p>
            )}
          </div>
          {caso.estado !== "cerrado" && <Button onClick={() => setCerrando(true)}>Cerrar caso</Button>}
        </div>
      )}

      <ol className="flex flex-col divide-y divide-gray-100">
        {pasos.map((p) => (
          <li key={p.id} className="flex items-start gap-3 py-3 text-sm">
            <span
              className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-xs ${
                p.estado === "cumplido"
                  ? "bg-green-600 text-white"
                  : p.estado === "actual"
                    ? "border-2 border-tinta"
                    : "border border-linea"
              }`}
              aria-hidden
            >
              {p.estado === "cumplido" ? "✓" : ""}
            </span>
            <div className="min-w-0 flex-1">
              <p className={p.estado === "pendiente" ? "text-gray-400" : "font-medium text-tinta"}>
                {p.tecnico}
                {p.id === "respuesta" && p.fecha && (hoja.rechazo ? " · rechazó" : " · aceptó")}
              </p>
              {/* Solo datos: cuándo se cumplió y si se le avisó al cliente. Las acciones van en el menú. */}
              {p.fecha && (
                <p className="mt-0.5 text-xs text-gray-500">
                  {fechaCorta(p.fecha)} · {p.avisado ? <span className="text-green-700">Informado</span> : "No informado"}
                </p>
              )}
            </div>
            {p.fecha && (
              <MenuAcciones
                etiqueta={`Acciones de “${p.tecnico}”`}
                acciones={[
                  ...(p.avisado ? [] : [{ etiqueta: "Informarle por WhatsApp", onClick: () => avisarDespues(p) }]),
                  { etiqueta: "Volver a este paso", onClick: () => setVolviendo(p.id) },
                ]}
              />
            )}
          </li>
        ))}
      </ol>

      <DialogoCerrarCaso caso={caso} abierto={cerrando} onCerrar={() => setCerrando(false)} />

      <DialogoConfirmar
        abierto={!!pasoVolver}
        titulo={pasoVolver ? `¿Volver a “${pasoVolver.tecnico}”?` : ""}
        textoConfirmar="Volver a este paso"
        onCancelar={() => setVolviendo(null)}
        onConfirmar={() => {
          if (pasoVolver) actualizar(caso.id, (c) => volverAPaso(c, pasoVolver.id));
          setVolviendo(null);
        }}
      >
        <p>
          {posteriores > 0
            ? `Ese paso y ${posteriores === 1 ? "el siguiente" : `los ${posteriores} siguientes`} vuelven a quedar pendientes. Se borran los plazos que habían abierto.`
            : "Ese paso vuelve a quedar pendiente. Se borran los plazos que había abierto."}
        </p>
        {huboAvisos && (
          <p className="rounded-2xl bg-amber-50 p-3 text-amber-900">
            Los mensajes que ya le mandaste al cliente no se borran de WhatsApp. Si hace falta, mandale una aclaración.
          </p>
        )}
      </DialogoConfirmar>
    </section>
  );
}
