"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Segmentado } from "@/components/ui/Controles";
import { DialogoConfirmar } from "@/components/ui/DialogoConfirmar";
import { TextAreaField, TextField } from "@/components/ui/Field";
import { Texto } from "@/components/ui/Texto";
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
        <Segmentado
          label="¿Hay novedades?"
          opciones={[
            { valor: "no", etiqueta: "No" },
            { valor: "si", etiqueta: "Sí" },
          ]}
          valor={hayNovedad ? "si" : "no"}
          onChange={(v) => {
            setHayNovedad(v === "si");
            setEditado(null);
          }}
        />
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
        <Texto estilo="caption" tono="secondary">
          Al mandarlo queda anotado en las notas del caso.
        </Texto>
      </DialogoConfirmar>
    </>
  );
}
