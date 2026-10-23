"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Tarjeta } from "@/components/ui/Superficies";
import { Texto } from "@/components/ui/Texto";
import { useCasos } from "@/lib/casos/CasosProvider";
import { hoyIso } from "@/lib/casos/formato";
import { SubirCasosLocales } from "./SubirCasosLocales";

/** Bajar los casos de la cuenta a un archivo y recuperarlos desde uno. */
export function CopiaSeguridad() {
  const { casos, listo, importar } = useCasos();
  const input = useRef<HTMLInputElement>(null);

  const descargar = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(casos, null, 2)], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `mycase-copia-${hoyIso()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const restaurar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    e.target.value = "";
    if (!archivo) return;
    try {
      const cantidad = importar(JSON.parse(await archivo.text()));
      window.alert(`Listo: se recuperaron ${cantidad} caso${cantidad === 1 ? "" : "s"}.`);
    } catch {
      window.alert("No pudimos leer ese archivo. Elegí una copia descargada desde MyCase.");
    }
  };

  if (!listo) return null;

  return (
    <Tarjeta titulo="Copia de seguridad">
      <SubirCasosLocales />
      <Texto estilo="body-sm" tono="secondary">
        Tus casos se guardan en tu cuenta. Si querés, podés descargar una copia en un archivo.
      </Texto>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button variante="secondary" onClick={descargar} disabled={casos.length === 0}>
          Descargar copia
        </Button>
        <Button variante="secondary" onClick={() => input.current?.click()}>
          Restaurar desde un archivo
        </Button>
        <input ref={input} type="file" accept="application/json,.json" className="hidden" onChange={restaurar} />
      </div>
    </Tarjeta>
  );
}
