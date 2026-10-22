"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { DialogoConfirmar } from "@/components/ui/DialogoConfirmar";
import { TextAreaField } from "@/components/ui/Field";
import { useCasos } from "@/lib/casos/CasosProvider";
import { linkWhatsApp } from "@/lib/casos/hojaRuta";
import { ahoraIso } from "@/lib/casos/notas";
import { mensajeSinNovedades, NOTA_SIN_NOVEDADES } from "@/lib/casos/sinNovedades";
import type { Caso } from "@/lib/casos/tipos";

/** Botón para contestar "¿cómo va mi caso?" con un mensaje armado; deja una nota en el historial. */
export function SinNovedades({ caso }: { caso: Caso }) {
  const { actualizar } = useCasos();
  /** null: cerrado; si no, el texto del mensaje, que se puede retocar antes de mandar. */
  const [texto, setTexto] = useState<string | null>(null);

  const mandar = () => {
    if (!texto?.trim()) return;
    actualizar(caso.id, (c) => ({
      ...c,
      historial: [...c.historial, { id: crypto.randomUUID(), fecha: ahoraIso(), texto: NOTA_SIN_NOVEDADES }],
    }));
    window.open(linkWhatsApp(caso.contacto, texto.trim()), "_blank", "noopener");
    setTexto(null);
  };

  return (
    <>
      <Button variante="secondary" className="w-fit" onClick={() => setTexto(mensajeSinNovedades(caso))}>
        Responder: sin novedades
      </Button>
      <DialogoConfirmar
        abierto={texto !== null}
        titulo={`Avisarle a ${caso.cliente} que no hay novedades`}
        textoConfirmar="Mandar por WhatsApp"
        onCancelar={() => setTexto(null)}
        onConfirmar={mandar}
      >
        <TextAreaField
          label="Mensaje (podés editarlo)"
          rows={7}
          value={texto ?? ""}
          onChange={(e) => setTexto(e.target.value)}
        />
        <p className="text-xs text-gray-500">Al mandarlo queda anotado en las notas del caso.</p>
      </DialogoConfirmar>
    </>
  );
}
