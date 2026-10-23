"use client";

import { useRouter } from "next/navigation";
import { FormularioCaso } from "@/components/casos/FormularioCaso";
import { Pagina } from "@/components/ui/Pagina";
import { Titulo } from "@/components/ui/Texto";
import { useCasos } from "@/lib/casos/CasosProvider";

export default function NuevoCasoPage() {
  const router = useRouter();
  const { agregar } = useCasos();

  return (
    <Pagina ancho="angosto">
      <Titulo>Cargar un caso nuevo</Titulo>
      <FormularioCaso
        textoBoton="Cargar caso"
        onGuardar={(datos) => {
          const caso = agregar({ ...datos, estado: "consulta" });
          router.push(`/casos/${caso.id}`);
        }}
      />
    </Pagina>
  );
}
