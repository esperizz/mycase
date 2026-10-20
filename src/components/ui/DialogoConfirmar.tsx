"use client";

import { useEffect, useRef } from "react";
import { Button } from "./Button";

/**
 * Modal de confirmación con el estilo de la app. Usa <dialog>, que ya resuelve el foco,
 * la tecla Esc y bloquear el resto de la página mientras está abierto.
 */
export function DialogoConfirmar({
  abierto,
  titulo,
  children,
  textoConfirmar,
  peligro = false,
  onConfirmar,
  onCancelar,
}: {
  abierto: boolean;
  titulo: string;
  children?: React.ReactNode;
  textoConfirmar: string;
  peligro?: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialogo = ref.current;
    if (!dialogo) return;
    if (abierto && !dialogo.open) dialogo.showModal();
    if (!abierto && dialogo.open) dialogo.close();
  }, [abierto]);

  return (
    <dialog
      ref={ref}
      onClose={onCancelar}
      onClick={(e) => e.target === ref.current && onCancelar()}
      aria-labelledby="dialogo-titulo"
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-3xl bg-white p-0 shadow-xl backdrop:bg-tinta/50"
    >
      <div className="flex flex-col gap-4 p-6">
        <h2 id="dialogo-titulo" className="text-lg font-bold text-tinta">
          {titulo}
        </h2>
        {children && <div className="flex flex-col gap-2 text-sm text-gray-600">{children}</div>}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variante="secondary" onClick={onCancelar} autoFocus>
            Cancelar
          </Button>
          <Button className={peligro ? "bg-red-600 hover:bg-red-700" : undefined} onClick={onConfirmar}>
            {textoConfirmar}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
