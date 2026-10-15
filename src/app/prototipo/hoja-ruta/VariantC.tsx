"use client";

// PROTOTIPO — Variante C: avisos. La abogada no "actualiza el caso": le avisa al cliente.
// Cada paso cumplido genera un mensaje con la plantilla etapa / qué se hizo / próximo paso.

import { useState } from "react";
import { formatearFecha } from "@/lib/casos/formato";
import { Columnas, Plazo, Telefono, type VarianteProps } from "./comun";
import { CASO, type PasoVista } from "./datos";

export const nombre = "Avisos al cliente";

function borrador(hecho: PasoVista, siguiente: PasoVista | undefined, rechazo: boolean) {
  const lineas = [`Hola ${CASO.primerNombre}, te cuento cómo va tu caso.`];
  if (hecho.id !== "respuesta") lineas.push(`✓ ${hecho.titulo}.`);
  else if (rechazo) lineas.push("La ART rechazó, como te había anticipado que podía pasar. Ya sabemos qué hacer.");
  else lineas.push("✓ La ART aceptó tu caso.");
  if (siguiente) {
    lineas.push(`Lo que sigue: ${siguiente.titulo.toLowerCase()}. ${siguiente.explicacion}`);
    if (siguiente.teToca) lineas.push(`Te pido: ${siguiente.teToca}`);
  }
  return lineas.join("\n\n");
}

export function VariantC({ pasos, acciones }: VarianteProps) {
  const [mensajes, setMensajes] = useState<Record<string, string>>({});
  const [editado, setEditado] = useState<string | null>(null);
  const i = pasos.findIndex((p) => p.estado === "actual");
  const actual = i >= 0 ? pasos[i] : null;
  const siguiente = i >= 0 ? pasos[i + 1] : undefined;
  const esRespuesta = actual?.id === "respuesta";
  // Si la ART rechaza, lo que sigue es la rama de la comisión médica.
  const [rechazoElegido, setRechazoElegido] = useState(false);
  const siguienteMostrado =
    esRespuesta && rechazoElegido
      ? { ...siguiente!, titulo: "Vamos a la comisión médica por el rechazo", explicacion: "Lo lleva la comisión médica.", teToca: "Mandame la carta de rechazo y tu historia clínica." }
      : siguiente;
  const texto = actual ? editado ?? borrador(actual, siguienteMostrado, esRespuesta && rechazoElegido) : "";

  const enviar = () => {
    if (!actual) return;
    setMensajes((m) => ({ ...m, [actual.id]: texto }));
    setEditado(null);
    if (esRespuesta) acciones.responderArt(rechazoElegido);
    else acciones.cumplir(actual.id);
    setRechazoElegido(false);
  };

  const abogado = (
    <div className="grid gap-4 md:grid-cols-[220px_1fr]">
      <ol className="flex flex-col gap-1 text-sm">
        {pasos.map((p) => (
          <li
            key={p.id}
            className={`rounded-md px-2 py-1 ${
              p.estado === "actual" ? "bg-blue-50 font-semibold text-blue-900" : p.estado === "cumplido" ? "text-gray-500 line-through" : "text-gray-400"
            }`}
          >
            {p.tecnico}
          </li>
        ))}
      </ol>
      {actual ? (
        <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Paso actual</p>
          <p className="text-lg font-bold text-gray-900">{actual.tecnico}</p>
          <Plazo paso={actual} />
          {esRespuesta && (
            <div className="flex gap-2 text-sm">
              {[false, true].map((r) => (
                <button
                  key={String(r)}
                  type="button"
                  onClick={() => {
                    setRechazoElegido(r);
                    setEditado(null);
                  }}
                  className={`rounded-full border px-3 py-1 ${rechazoElegido === r ? "border-gray-900 bg-gray-900 text-white" : "border-gray-300"}`}
                >
                  {r ? "La ART rechazó" : "La ART aceptó"}
                </button>
              ))}
            </div>
          )}
          <label className="text-sm font-semibold text-gray-900" htmlFor="aviso">
            Aviso para {CASO.primerNombre} (podés editarlo)
          </label>
          <textarea
            id="aviso"
            rows={8}
            value={texto}
            onChange={(e) => setEditado(e.target.value)}
            className="rounded-lg border border-gray-300 p-3 text-sm"
          />
          <button type="button" onClick={enviar} className="h-11 rounded-lg bg-green-700 font-semibold text-white">
            Marcar cumplido y avisarle
          </button>
          <p className="text-xs text-gray-400">En la app real: se publica en su link y se puede compartir por WhatsApp.</p>
        </div>
      ) : (
        <div className="rounded-xl bg-green-50 p-5 text-green-900">Caso terminado.</div>
      )}
    </div>
  );

  const cumplidos = pasos.filter((p) => p.estado === "cumplido");
  const cliente = (
    <Telefono>
      <div className="flex min-h-full flex-col bg-[#efeae2]">
        <div className="sticky top-0 bg-white p-3 shadow-sm">
          <p className="text-xs text-gray-500">Tu caso con {CASO.abogada}</p>
          <p className="text-sm font-semibold text-gray-900">
            Ahora: {actual ? actual.titulo : "¡terminado!"}
          </p>
        </div>
        <div className="flex flex-col gap-3 p-3">
          {cumplidos.map((p) => (
            <div key={p.id} className="max-w-[85%] rounded-lg rounded-tl-none bg-white p-3 text-sm shadow-sm">
              <p className="whitespace-pre-line text-gray-900">{mensajes[p.id] ?? `✓ ${p.titulo}.`}</p>
              {p.fecha && <p className="mt-1 text-right text-[10px] text-gray-400">{formatearFecha(p.fecha)}</p>}
            </div>
          ))}
        </div>
      </div>
    </Telefono>
  );

  return <Columnas abogado={abogado} cliente={cliente} />;
}
