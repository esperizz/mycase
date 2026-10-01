"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { SelectField, TextField } from "@/components/ui/Field";
import { TIPOS_RECLAMO } from "@/lib/casos/catalogo";
import { useCasos } from "@/lib/casos/CasosProvider";

export function FormularioNuevoCaso() {
  const router = useRouter();
  const { agregar } = useCasos();
  const [cliente, setCliente] = useState("");
  const [contacto, setContacto] = useState("");
  const [empleador, setEmpleador] = useState("");
  const [tipoReclamo, setTipoReclamo] = useState<string>(TIPOS_RECLAMO[0]);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliente.trim() || !empleador.trim()) return;
    setEnviando(true);
    setError("");
    try {
      const caso = await agregar({ cliente, contacto, empleador, tipoReclamo, estado: "consulta" });
      router.push(`/casos/${caso.id}`);
    } catch {
      setError("No pudimos cargar el caso. Probá de nuevo.");
      setEnviando(false);
    }
  };

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
        {TIPOS_RECLAMO.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </SelectField>
      {error && (
        <p role="alert" className="text-sm font-medium text-red-600">
          {error}
        </p>
      )}
      <div>
        <Button type="submit" disabled={enviando}>
          {enviando ? "Cargando..." : "Cargar caso"}
        </Button>
      </div>
    </form>
  );
}
