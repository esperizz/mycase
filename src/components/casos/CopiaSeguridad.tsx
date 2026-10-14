"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/Button";
import { useCasos } from "@/lib/casos/CasosProvider";
import { hoyIso } from "@/lib/casos/formato";

/** Los casos viven solo en este navegador: esto permite bajarlos a un archivo y recuperarlos. */
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
    <section className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5">
      <h2 className="font-semibold text-gray-900">Copia de seguridad</h2>
      <p className="text-sm text-gray-500">
        Tus casos se guardan solo en este navegador. Descargá una copia de vez en cuando para no perderlos, o para
        pasarlos a otra computadora.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button variante="secondary" onClick={descargar} disabled={casos.length === 0}>
          Descargar copia
        </Button>
        <Button variante="secondary" onClick={() => input.current?.click()}>
          Restaurar desde un archivo
        </Button>
        <input ref={input} type="file" accept="application/json,.json" className="hidden" onChange={restaurar} />
      </div>
    </section>
  );
}
