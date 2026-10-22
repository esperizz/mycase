"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { DialogoConfirmar } from "@/components/ui/DialogoConfirmar";
import { TextAreaField, TextField } from "@/components/ui/Field";
import { useCasos } from "@/lib/casos/CasosProvider";
import { linkWhatsApp } from "@/lib/casos/hojaRuta";
import { mensajeParaCliente, notaInforme } from "@/lib/casos/informarCliente";
import { ahoraIso } from "@/lib/casos/notas";
import type { Caso } from "@/lib/casos/tipos";

/**
 * Botón para contestarle al cliente cómo va su caso, haya novedades o no. Arma el mensaje,
 * deja retocarlo, lo abre en WhatsApp y anota en el historial qué se le informó.
 */
export function InformarCliente({ caso }: { caso: Caso }) {
  const { actualizar } = useCasos();
  const [abierto, setAbierto] = useState(false);
  const [hayNovedad, setHayNovedad] = useState(false);
  const [novedad, setNovedad] = useState("");
  /** null mientras no se toque el mensaje: sigue armándose solo con lo que se elige arriba. */
  const [editado, setEditado] = useState<string | null>(null);

  const novedadElegida = hayNovedad ? novedad : "";
  const texto = editado ?? mensajeParaCliente(caso, novedadElegida);
  const falta = (hayNovedad && !novedad.trim()) || !texto.trim();

  const abrir = () => {
    setHayNovedad(false);
    setNovedad("");
    setEditado(null);
    setAbierto(true);
  };

  const mandar = () => {
    if (falta) return;
    actualizar(caso.id, (c) => ({
      ...c,
      historial: [...c.historial, { id: crypto.randomUUID(), fecha: ahoraIso(), texto: notaInforme(novedadElegida) }],
    }));
    window.open(linkWhatsApp(caso.contacto, texto.trim()), "_blank", "noopener");
    setAbierto(false);
  };

  return (
    <>
      <Button variante="secondary" className="self-start" onClick={abrir}>
        Informar al cliente
      </Button>
      <DialogoConfirmar
        abierto={abierto}
        titulo={`Informarle a ${caso.cliente} cómo va su caso`}
        textoConfirmar="Mandar por WhatsApp"
        confirmarDeshabilitado={falta}
        onCancelar={() => setAbierto(false)}
        onConfirmar={mandar}
      >
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-tinta" id="hay-novedades">
            ¿Hay novedades?
          </p>
          <div
            role="radiogroup"
            aria-labelledby="hay-novedades"
            className="grid w-full max-w-xs grid-cols-2 rounded-2xl border border-linea p-1"
          >
            {[false, true].map((si) => (
              <button
                key={String(si)}
                type="button"
                role="radio"
                aria-checked={hayNovedad === si}
                onClick={() => {
                  setHayNovedad(si);
                  setEditado(null);
                }}
                className={`rounded-md py-1.5 text-sm font-semibold transition-colors ${
                  hayNovedad === si ? "bg-tinta text-white" : "text-gray-600 hover:bg-fondo"
                }`}
              >
                {si ? "Sí" : "No"}
              </button>
            ))}
          </div>
        </div>
        {hayNovedad && (
          <TextField
            label="¿Qué pasó?"
            placeholder='Ej.: "La empresa contestó la carta y ofrece pagar en cuotas"'
            value={novedad}
            onChange={(e) => {
              setNovedad(e.target.value);
              setEditado(null);
            }}
          />
        )}
        <TextAreaField
          label="Mensaje (podés editarlo)"
          rows={7}
          value={texto}
          onChange={(e) => setEditado(e.target.value)}
        />
        <p className="text-xs text-gray-500">Al mandarlo queda anotado en las notas del caso.</p>
      </DialogoConfirmar>
    </>
  );
}
