"use client";

// PROTOTIPO — barra flotante para cambiar de variante con ?variant=. No se muestra en producción.

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export function PrototypeSwitcher({ variantes, actual }: { variantes: { clave: string; nombre: string }[]; actual: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const i = Math.max(0, variantes.findIndex((v) => v.clave === actual));

  useEffect(() => {
    const ir = (paso: number) => {
      const sig = variantes[(i + paso + variantes.length) % variantes.length];
      {
        // Conserva los demás parámetros (por ejemplo ?datos=muchos).
        const params = new URLSearchParams(window.location.search);
        params.set("variant", sig.clave);
        router.replace(`${pathname}?${params}`, { scroll: false });
      }
    };
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest("input, textarea, [contenteditable]")) return;
      if (e.key === "ArrowLeft") ir(-1);
      if (e.key === "ArrowRight") ir(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [i, variantes, router, pathname]);

  if (process.env.NODE_ENV === "production") return null;

  const ir = (paso: number) => {
    const sig = variantes[(i + paso + variantes.length) % variantes.length];
    {
        // Conserva los demás parámetros (por ejemplo ?datos=muchos).
        const params = new URLSearchParams(window.location.search);
        params.set("variant", sig.clave);
        router.replace(`${pathname}?${params}`, { scroll: false });
      }
  };

  return (
    <div className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full bg-fuchsia-700 px-3 py-2 text-sm font-semibold text-white shadow-2xl">
      <button type="button" onClick={() => ir(-1)} aria-label="Variante anterior" className="rounded-full px-2 hover:bg-fuchsia-600">
        ←
      </button>
      <span>
        {variantes[i].clave} — {variantes[i].nombre}
      </span>
      <button type="button" onClick={() => ir(1)} aria-label="Variante siguiente" className="rounded-full px-2 hover:bg-fuchsia-600">
        →
      </button>
    </div>
  );
}
