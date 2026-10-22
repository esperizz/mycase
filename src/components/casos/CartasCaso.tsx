"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Flecha } from "@/components/ui/Button";
import { DialogoConfirmar } from "@/components/ui/DialogoConfirmar";
import { tipoCartaPorId, TIPOS_CARTA } from "@/lib/casos/cartaCatalogo";
import { nuevaCarta } from "@/lib/casos/cartas";
import { useCasos } from "@/lib/casos/CasosProvider";
import { fechaCorta } from "@/lib/casos/formato";
import type { CartaDatos, Caso, TipoCarta } from "@/lib/casos/tipos";

/** Las cartas documento del caso: cada una con su estado, y para empezar una nueva. */
export function CartasCaso({ caso }: { caso: Caso }) {
  const { actualizar } = useCasos();
  const router = useRouter();
  const [eligiendo, setEligiendo] = useState(false);
  const [descartando, setDescartando] = useState<CartaDatos | null>(null);

  const empezar = (tipo: TipoCarta) => {
    const carta = nuevaCarta(caso, tipo);
    actualizar(caso.id, (c) => ({ ...c, cartas: [...c.cartas, carta] }));
    router.push(`/casos/${caso.id}/cartas/${carta.id}`);
  };

  const descartar = () => {
    if (!descartando) return;
    actualizar(caso.id, (c) => ({ ...c, cartas: c.cartas.filter((x) => x.id !== descartando.id) }));
    setDescartando(null);
  };

  return (
    <section className="flex flex-col gap-4 rounded-3xl border border-linea bg-white p-5">
      <div>
        <h2 className="font-semibold text-tinta">Cartas</h2>
        <p className="text-sm text-gray-500">Cartas documento y telegramas del caso, en el orden en que los empezaste.</p>
      </div>

      {caso.cartas.length > 0 && (
        <ul className="flex flex-col gap-2">
          {caso.cartas.map((c) => (
            <li key={c.id} className="flex items-center gap-3 rounded-2xl bg-fondo px-3 py-2 text-sm">
              <Link
                href={`/casos/${caso.id}/cartas/${c.id}`}
                className="flex min-w-0 flex-1 items-center justify-between gap-3 font-medium text-tinta hover:underline"
              >
                <span className="truncate">{tipoCartaPorId(c.tipo).titulo}</span>
                <span className="flex shrink-0 items-center gap-2">
                  {c.enviadaEl ? (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">
                      Enviada {fechaCorta(c.enviadaEl)}
                    </span>
                  ) : (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">
                      Borrador
                    </span>
                  )}
                  <Flecha variante="secondary" className="size-6" />
                </span>
              </Link>
              {!c.enviadaEl && (
                <button
                  type="button"
                  onClick={() => setDescartando(c)}
                  className="shrink-0 text-xs text-gray-500 hover:text-red-700 hover:underline"
                >
                  Descartar
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {eligiendo ? (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-tinta">¿Qué carta vas a escribir?</p>
          <ul className="flex flex-col gap-2">
            {TIPOS_CARTA.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => empezar(t.id)}
                  className="flex w-full flex-col gap-0.5 rounded-2xl border border-linea px-4 py-3 text-left hover:border-tinta"
                >
                  <span className="text-sm font-semibold text-tinta">{t.titulo}</span>
                  <span className="text-xs text-gray-500">{t.descripcion}</span>
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => setEligiendo(false)}
            className="w-fit text-sm font-medium text-gray-500 hover:text-tinta"
          >
            Cancelar
          </button>
        </div>
      ) : (
        <Button variante="secondary" className="self-start" onClick={() => setEligiendo(true)}>
          + Nueva carta
        </Button>
      )}

      <DialogoConfirmar
        abierto={!!descartando}
        titulo={`¿Descartar el borrador de ${descartando ? tipoCartaPorId(descartando.tipo).titulo.toLowerCase() : ""}?`}
        textoConfirmar="Descartar"
        peligro
        onCancelar={() => setDescartando(null)}
        onConfirmar={descartar}
      >
        <p>Se borra todo lo que escribiste en esta carta. No se puede deshacer.</p>
      </DialogoConfirmar>
    </section>
  );
}
