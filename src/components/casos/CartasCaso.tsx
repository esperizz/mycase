"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { BotonTexto, Button, FilaEnlace } from "@/components/ui/Button";
import { DialogoConfirmar } from "@/components/ui/DialogoConfirmar";
import { Tarjeta } from "@/components/ui/Superficies";
import { Texto } from "@/components/ui/Texto";
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
    <Tarjeta titulo="Cartas" ayuda="Cartas documento y telegramas del caso, en el orden en que los empezaste.">
      {caso.cartas.length > 0 && (
        <ul className="flex flex-col gap-2">
          {caso.cartas.map((c) => (
            <li key={c.id}>
              <FilaEnlace
                href={`/casos/${caso.id}/cartas/${c.id}`}
                accion={c.enviadaEl ? <Badge tono="success">Enviada {fechaCorta(c.enviadaEl)}</Badge> : <Badge tono="warning">Borrador</Badge>}
                extra={
                  !c.enviadaEl && (
                    <BotonTexto variante="dangerQuiet" estilo="caption" className="shrink-0" onClick={() => setDescartando(c)}>
                      Descartar
                    </BotonTexto>
                  )
                }
              >
                <Texto as="span" peso="medium" tono="primary" className="truncate">
                  {tipoCartaPorId(c.tipo).titulo}
                </Texto>
              </FilaEnlace>
            </li>
          ))}
        </ul>
      )}

      {eligiendo ? (
        <div className="flex flex-col gap-2">
          <Texto estilo="body-sm" peso="semibold" tono="primary">
            ¿Qué carta vas a escribir?
          </Texto>
          <ul className="flex flex-col gap-2">
            {TIPOS_CARTA.map((t) => (
              <li key={t.id}>
                <FilaEnlace onClick={() => empezar(t.id)}>
                  <span className="flex flex-col gap-0.5">
                    <Texto as="span" peso="semibold" tono="primary">
                      {t.titulo}
                    </Texto>
                    <Texto as="span" estilo="caption" tono="secondary">
                      {t.descripcion}
                    </Texto>
                  </span>
                </FilaEnlace>
              </li>
            ))}
          </ul>
          <BotonTexto variante="quiet" estilo="body-sm" className="w-fit" onClick={() => setEligiendo(false)}>
            Cancelar
          </BotonTexto>
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
    </Tarjeta>
  );
}

