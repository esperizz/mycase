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
  confirmarDeshabilitado = false,
  onConfirmar,
  onCancelar,
}: {
  abierto: boolean;
  titulo: string;
  children?: React.ReactNode;
  textoConfirmar: string;
  peligro?: boolean;
  /** Mientras falte algo para poder confirmar. */
  confirmarDeshabilitado?: boolean;
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
      // Con los costados fijos a 1rem y ancho automático, en celular deja ese margen y desde md se
      // queda en su ancho máximo, centrado.
      className="inset-x-4 m-auto w-auto max-w-md rounded-card bg-surface-primary p-0 shadow-dialog backdrop:bg-overlay"
    >
      <div className="flex flex-col gap-4 p-6">
        <h2 id="dialogo-titulo" className="text-h2 text-primary">
          {titulo}
        </h2>
        {children && <div className="flex flex-col gap-2 text-body-sm text-secondary">{children}</div>}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variante="secondary" onClick={onCancelar} autoFocus>
            Cancelar
          </Button>
          <Button variante={peligro ? "danger" : "primary"} onClick={onConfirmar} disabled={confirmarDeshabilitado}>
            {textoConfirmar}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
