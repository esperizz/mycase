"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { SelectField, TextField } from "@/components/ui/Field";
import { TIPOS_RECLAMO } from "@/lib/casos/catalogo";
import type { Caso } from "@/lib/casos/tipos";

export type DatosCaso = Pick<Caso, "cliente" | "contacto" | "empleador" | "tipoReclamo" | "expediente" | "juzgado">;

/** Formulario de datos básicos del caso, compartido por el alta y la edición. */
export function FormularioCaso({
  inicial,
  textoBoton,
  onGuardar,
  onCancelar,
}: {
  inicial?: DatosCaso;
  textoBoton: string;
  onGuardar: (datos: DatosCaso) => void;
  onCancelar?: () => void;
}) {
  const [cliente, setCliente] = useState(inicial?.cliente ?? "");
  const [contacto, setContacto] = useState(inicial?.contacto ?? "");
  const [empleador, setEmpleador] = useState(inicial?.empleador ?? "");
  const [tipoReclamo, setTipoReclamo] = useState<string>(inicial?.tipoReclamo ?? TIPOS_RECLAMO[0]);
  const [expediente, setExpediente] = useState(inicial?.expediente ?? "");
  const [juzgado, setJuzgado] = useState(inicial?.juzgado ?? "");

  const enviar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliente.trim() || !empleador.trim()) return;
    onGuardar({ cliente, contacto, empleador, tipoReclamo, expediente: expediente.trim(), juzgado: juzgado.trim() });
  };

  // Un caso viejo puede tener un tipo que ya no está en el catálogo: se muestra igual.
  const tipos: readonly string[] = TIPOS_RECLAMO.includes(tipoReclamo as (typeof TIPOS_RECLAMO)[number])
    ? TIPOS_RECLAMO
    : [tipoReclamo, ...TIPOS_RECLAMO];

  return (
    <form onSubmit={enviar} className="flex flex-col gap-5">
      <TextField label="Nombre del cliente" value={cliente} onChange={(e) => setCliente(e.target.value)} required />
      <TextField
        label="Teléfono o email del cliente"
        opcional
        value={contacto}
        onChange={(e) => setContacto(e.target.value)}
      />
      <TextField
        label="Empleador / demandado"
        value={empleador}
        onChange={(e) => setEmpleador(e.target.value)}
        required
      />
      <SelectField label="Tipo de reclamo" value={tipoReclamo} onChange={(e) => setTipoReclamo(e.target.value)}>
        {tipos.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </SelectField>
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="Número de expediente"
          opcional
          placeholder='Ej.: "CNT 12345/2026"'
          value={expediente}
          onChange={(e) => setExpediente(e.target.value)}
        />
        <TextField
          label="Juzgado"
          opcional
          placeholder='Ej.: "Juzgado del Trabajo N.º 45"'
          value={juzgado}
          onChange={(e) => setJuzgado(e.target.value)}
        />
      </div>
      <div className="flex gap-3">
        <Button type="submit">{textoBoton}</Button>
        {onCancelar && (
          <Button variante="secondary" onClick={onCancelar}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}
