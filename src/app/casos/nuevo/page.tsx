"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { SelectField, TextField } from "@/components/ui/Field";
import { Header } from "@/components/ui/Header";
import { TIPOS_RECLAMO } from "@/lib/casos/catalogo";
import { useCasos } from "@/lib/casos/CasosProvider";

export default function NuevoCasoPage() {
  const router = useRouter();
  const { agregar } = useCasos();
  const [cliente, setCliente] = useState("");
  const [contacto, setContacto] = useState("");
  const [empleador, setEmpleador] = useState("");
  const [tipoReclamo, setTipoReclamo] = useState<string>(TIPOS_RECLAMO[0]);

  const enviar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliente.trim() || !empleador.trim()) return;
    const caso = agregar({ cliente, contacto, empleador, tipoReclamo, estado: "consulta" });
    router.push(`/casos/${caso.id}`);
  };

  return (
    <>
      <Header />
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 py-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Cargar un caso nuevo</h1>
        <form onSubmit={enviar} className="flex flex-col gap-5">
          <TextField
            label="Nombre del cliente"
            value={cliente}
            onChange={(e) => setCliente(e.target.value)}
            required
          />
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
          <SelectField
            label="Tipo de reclamo"
            value={tipoReclamo}
            onChange={(e) => setTipoReclamo(e.target.value)}
          >
            {TIPOS_RECLAMO.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </SelectField>
          <div>
            <Button type="submit">Cargar caso</Button>
          </div>
        </form>
      </main>
    </>
  );
}
