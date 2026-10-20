"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { DialogoConfirmar } from "@/components/ui/DialogoConfirmar";
import { TextAreaField } from "@/components/ui/Field";
import { useCasos } from "@/lib/casos/CasosProvider";
import { formatearFecha } from "@/lib/casos/formato";
import { ahoraIso, ordenarNotas } from "@/lib/casos/notas";
import type { Caso, Nota } from "@/lib/casos/tipos";

/** "19 de oct de 2026 · 14:32"; las notas migradas no tienen hora (00:00) y se muestran sin ella. */
function cuando(fecha: string) {
  const [dia, hora] = fecha.split("T");
  return hora && hora !== "00:00" ? `${formatearFecha(dia)} · ${hora}` : formatearFecha(dia);
}

function ItemNota({ casoId, nota, onBorrar }: { casoId: string; nota: Nota; onBorrar: () => void }) {
  const { actualizar } = useCasos();
  const [editando, setEditando] = useState(false);
  const [texto, setTexto] = useState(nota.texto);

  if (editando) {
    const guardar = (e: React.FormEvent) => {
      e.preventDefault();
      if (!texto.trim()) return;
      actualizar(casoId, (c) => ({
        ...c,
        historial: c.historial.map((n) => (n.id === nota.id ? { ...n, texto: texto.trim() } : n)),
      }));
      setEditando(false);
    };
    return (
      <li className="py-3">
        <form onSubmit={guardar} className="flex flex-col gap-2">
          <TextAreaField label={cuando(nota.fecha)} value={texto} onChange={(e) => setTexto(e.target.value)} />
          <div className="flex gap-2">
            <Button type="submit" disabled={!texto.trim()}>
              Guardar
            </Button>
            <Button
              variante="secondary"
              onClick={() => {
                setTexto(nota.texto);
                setEditando(false);
              }}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="flex flex-col gap-1 py-3">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-xs font-semibold text-gray-500">{cuando(nota.fecha)}</p>
        <div className="flex gap-3 text-xs text-gray-500">
          <button type="button" onClick={() => setEditando(true)} className="hover:text-tinta hover:underline">
            Editar
          </button>
          <button type="button" onClick={onBorrar} className="hover:text-red-700 hover:underline">
            Borrar
          </button>
        </div>
      </div>
      <p className="whitespace-pre-line text-sm text-tinta">{nota.texto}</p>
    </li>
  );
}

/** Historial de notas del caso: cada nota con su fecha y hora, de la más nueva a la más vieja. */
export function NotasCaso({ caso }: { caso: Caso }) {
  const { actualizar } = useCasos();
  const [nueva, setNueva] = useState("");
  const [borrando, setBorrando] = useState<string | null>(null);
  const notas = ordenarNotas(caso.historial);

  const agregar = (e: React.FormEvent) => {
    e.preventDefault();
    const texto = nueva.trim();
    if (!texto) return;
    actualizar(caso.id, (c) => ({
      ...c,
      historial: [...c.historial, { id: crypto.randomUUID(), fecha: ahoraIso(), texto }],
    }));
    setNueva("");
  };

  return (
    <section className="flex flex-col gap-4 rounded-3xl border border-linea bg-white p-5">
      <div>
        <h2 className="font-semibold text-tinta">Notas</h2>
        <p className="text-sm text-gray-500">Lo que te contó el cliente, datos sueltos, cosas a tener en cuenta. Solo lo ves vos.</p>
      </div>

      <form onSubmit={agregar} className="flex flex-col gap-2">
        <TextAreaField
          label="Nueva nota"
          value={nueva}
          onChange={(e) => setNueva(e.target.value)}
          placeholder='Ej.: "Llamó: dice que la ART no le contestó todavía."'
        />
        <div>
          <Button type="submit" disabled={!nueva.trim()}>
            Agregar nota
          </Button>
        </div>
      </form>

      {notas.length === 0 ? (
        <p className="text-sm text-gray-500">Todavía no hay notas en este caso.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-gray-100">
          {notas.map((n) => (
            <ItemNota key={n.id} casoId={caso.id} nota={n} onBorrar={() => setBorrando(n.id)} />
          ))}
        </ul>
      )}

      <DialogoConfirmar
        abierto={!!borrando}
        titulo="¿Borrar esta nota?"
        textoConfirmar="Borrar nota"
        peligro
        onCancelar={() => setBorrando(null)}
        onConfirmar={() => {
          actualizar(caso.id, (c) => ({ ...c, historial: c.historial.filter((n) => n.id !== borrando) }));
          setBorrando(null);
        }}
      >
        <p>No se puede deshacer.</p>
      </DialogoConfirmar>
    </section>
  );
}
