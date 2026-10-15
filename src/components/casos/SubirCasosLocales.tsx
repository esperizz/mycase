"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { CLAVE_LOCAL, useCasos } from "@/lib/casos/CasosProvider";

/** Casos que la versión anterior dejó guardados en este navegador, si quedan sin subir. */
function leerCasosLocales(): unknown[] {
  try {
    const datos = JSON.parse(localStorage.getItem(CLAVE_LOCAL) ?? "[]");
    return Array.isArray(datos) ? datos : [];
  } catch {
    return [];
  }
}

/** Ofrece subir a la cuenta los casos de antes del login; no muestra nada si no hay. */
export function SubirCasosLocales() {
  const { importar } = useCasos();
  const [locales, setLocales] = useState<unknown[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- leer localStorage solo en el cliente
    setLocales(leerCasosLocales());
  }, []);

  if (locales.length === 0) return null;

  const subir = () => {
    const cantidad = importar(locales);
    try {
      // Se guarda aparte en vez de borrarse, por si hiciera falta recuperarlos.
      localStorage.setItem(`${CLAVE_LOCAL}-subidos`, JSON.stringify(locales));
      localStorage.removeItem(CLAVE_LOCAL);
    } catch {
      // Sin almacenamiento disponible: no hay nada más que limpiar.
    }
    setLocales([]);
    window.alert(`Listo: se subieron ${cantidad} caso${cantidad === 1 ? "" : "s"} a tu cuenta.`);
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg bg-amber-50 p-4 text-left text-sm text-amber-900">
      <p>
        Este navegador tiene {locales.length} caso{locales.length === 1 ? "" : "s"} de antes de crear tu cuenta.
        Subilos para tenerlos en cualquier dispositivo.
      </p>
      <div>
        <Button onClick={subir}>Subir a mi cuenta</Button>
      </div>
    </div>
  );
}
