"use client";

import { useRouter } from "next/navigation";
import { FormularioCaso } from "@/components/casos/FormularioCaso";
import { Header } from "@/components/ui/Header";
import { useCasos } from "@/lib/casos/CasosProvider";

export default function NuevoCasoPage() {
  const router = useRouter();
  const { agregar } = useCasos();

  return (
    <>
      <Header />
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 py-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Cargar un caso nuevo</h1>
        <FormularioCaso
          textoBoton="Cargar caso"
          onGuardar={(datos) => {
            const caso = agregar({ ...datos, estado: "consulta" });
            router.push(`/casos/${caso.id}`);
          }}
        />
      </main>
    </>
  );
}
