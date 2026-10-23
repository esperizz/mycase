"use client";

import { useState } from "react";
import { DialogoCerrarCaso } from "@/components/casos/CerrarCaso";
import { Badge } from "@/components/ui/Badge";
import { BotonTexto, Button } from "@/components/ui/Button";
import { Segmentado } from "@/components/ui/Controles";
import { MarcadorPaso } from "@/components/ui/Datos";
import { DialogoConfirmar } from "@/components/ui/DialogoConfirmar";
import { TextAreaField, TextField } from "@/components/ui/Field";
import { MenuAcciones } from "@/components/ui/MenuAcciones";
import { Aviso, ListaDividida, Recuadro, Tarjeta } from "@/components/ui/Superficies";
import { Rotulo, Texto } from "@/components/ui/Texto";
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
    <Recuadro tono="highlighted" className="flex flex-col gap-3">
      <div>
        <Rotulo>Paso actual</Rotulo>
        <Texto estilo="h2" tono="primary">
          {paso.tecnico}
        </Texto>
      </div>
      {plazo && (
        <Badge tono={diasHasta(plazo.fecha) <= 2 ? "danger" : "warning"} className="self-start">
          {plazo.descripcion}: {textoDias(diasHasta(plazo.fecha)).toLowerCase()} ({formatearFecha(plazo.fecha)})
        </Badge>
      )}
      {esRespuesta && (
        <Segmentado
          label="Respuesta de la ART"
          ocultarLabel
          opciones={[
            { valor: "acepto", etiqueta: "La ART aceptó" },
            { valor: "rechazo", etiqueta: "La ART rechazó" },
          ]}
          valor={rechazo ? "rechazo" : "acepto"}
          onChange={(v) => {
            setRechazo(v === "rechazo");
            setEditado(null);
          }}
        />
      )}
      {conFecha && (
        <div className="max-w-xs">
          <TextField
            label="¿Cuándo se notificó?"
            type="date"
            max={hoy}
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            ayuda="El plazo legal se cuenta desde esta fecha."
          />
        </div>
      )}
      <TextAreaField
        label="Mensaje para el cliente (podés editarlo)"
        rows={7}
        value={texto}
        onChange={(e) => setEditado(e.target.value)}
      />
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button variante="success" onClick={() => cumplir(true)}>
          Cumplido e informarle por WhatsApp
        </Button>
        <Button variante="secondary" onClick={() => cumplir(false)}>
          Cumplido, sin informarle
        </Button>
      </div>
    </Recuadro>
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
      <Tarjeta
        titulo="Hoja de ruta de ART"
        ayuda="Seguí el reclamo paso a paso, con los plazos legales calculados en días hábiles, e informale al cliente por WhatsApp cuando quieras."
      >
        <Button className="self-start" onClick={() => actualizar(caso.id, (c) => ({ ...c, hojaRuta: hojaRutaVacia() }))}>
          Empezar hoja de ruta
        </Button>
      </Tarjeta>
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
    <Tarjeta titulo="Hoja de ruta de ART">
      {hoja.inicioAvisado ? (
        <Texto estilo="body-sm" tono="secondary">
          Le informaste al cliente cómo va a ser el caso el {formatearFecha(hoja.inicioAvisado)}.{" "}
          <BotonTexto subrayado onClick={contarInicio}>
            Volver a mandar
          </BotonTexto>
        </Texto>
      ) : (
        <Aviso tono="info" className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Texto>
            Informale al cliente todo el recorrido desde el principio: después, cada paso que se cumple confirma lo que le
            dijiste.
          </Texto>
          <Button onClick={contarInicio}>Informarle el recorrido por WhatsApp</Button>
        </Aviso>
      )}

      {actual ? (
        <PasoActual key={actual.id} caso={caso} paso={actual} />
      ) : (
        <Recuadro tono="success" className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Texto peso="semibold">Todos los pasos están cumplidos.</Texto>
            {caso.estado !== "cerrado" && (
              <Texto estilo="body-sm">Si no queda nada más por hacer (por ejemplo, cobrar honorarios), cerralo.</Texto>
            )}
          </div>
          {caso.estado !== "cerrado" && <Button onClick={() => setCerrando(true)}>Cerrar caso</Button>}
        </Recuadro>
      )}

      <ListaDividida as="ol">
        {pasos.map((p) => (
          <li key={p.id} className="flex items-start gap-3 py-3">
            <MarcadorPaso estado={p.estado} />
            <div className="min-w-0 flex-1">
              <Texto
                estilo="body-sm"
                tono={p.estado === "pendiente" ? "tertiary" : "primary"}
                peso={p.estado === "pendiente" ? undefined : "medium"}
              >
                {p.tecnico}
                {p.id === "respuesta" && p.fecha && (hoja.rechazo ? " · rechazó" : " · aceptó")}
              </Texto>
              {/* Solo datos: cuándo se cumplió y si se le avisó al cliente. Las acciones van en el menú. */}
              {p.fecha && (
                <Texto estilo="caption" tono="secondary" className="mt-0.5">
                  {fechaCorta(p.fecha)} ·{" "}
                  {p.avisado ? (
                    <Texto as="span" tono="success">
                      Informado
                    </Texto>
                  ) : (
                    "No informado"
                  )}
                </Texto>
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
      </ListaDividida>

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
          <Aviso tono="warning">
            Los mensajes que ya le mandaste al cliente no se borran de WhatsApp. Si hace falta, mandale una aclaración.
          </Aviso>
        )}
      </DialogoConfirmar>
    </Tarjeta>
  );
}
