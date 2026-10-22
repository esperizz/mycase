"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { SelectField, TextField } from "@/components/ui/Field";
import { useCasos } from "@/lib/casos/CasosProvider";
import { feriado } from "@/lib/casos/feriados";
import { formatearFecha, hoyIso, sumarDias } from "@/lib/casos/formato";
import { sugerencias } from "@/lib/casos/sugerencias";
import type { Caso, TipoVencimiento } from "@/lib/casos/tipos";

const TEXTOS: Record<TipoVencimiento, { pregunta: string; ejemplo: string; boton: string }> = {
  plazo: { pregunta: "¿Qué vence?", ejemplo: 'Ej.: "Contestar traslado"', boton: "Agregar plazo" },
  tarea: { pregunta: "¿Qué hay que hacer?", ejemplo: 'Ej.: "Mandarle el instructivo de escaneo"', boton: "Agregar tarea" },
};

function Chip({ activo, onClick, children }: { activo: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activo}
      className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
        activo ? "border-tinta bg-tinta text-white" : "border-linea bg-white text-gray-700 hover:bg-fondo"
      }`}
    >
      {children}
    </button>
  );
}

/** Si la fecha no es día hábil, por qué: para avisar antes de cargar un vencimiento ahí. */
function avisoDiaInhabil(fecha: string): string | null {
  const nombre = feriado(fecha);
  if (nombre) return `Ese día es feriado (${nombre}).`;
  const [y, m, d] = fecha.split("-").map(Number);
  const dia = new Date(y, m - 1, d).getDay();
  if (dia === 0 || dia === 6) return `Ese día es ${dia === 0 ? "domingo" : "sábado"}.`;
  return null;
}

/** Formulario corto para cargar un plazo o una tarea en cualquier caso sin salir del panel. */
export function CargaRapida({
  casos,
  casoInicial,
  onListo,
  onCerrar,
}: {
  casos: Caso[];
  casoInicial: string;
  onListo: (mensaje: string) => void;
  onCerrar: () => void;
}) {
  const { agregarVencimiento } = useCasos();
  const [casoId, setCasoId] = useState(casoInicial || casos[0]?.id || "");
  const [tipo, setTipo] = useState<TipoVencimiento>("plazo");
  const [descripcion, setDescripcion] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [lugar, setLugar] = useState("");
  const tarjeta = useRef<HTMLElement>(null);
  const campoDescripcion = useRef<HTMLInputElement>(null);

  const hoy = hoyIso();
  const atajos = [
    { etiqueta: "Hoy", fecha: hoy },
    { etiqueta: "Mañana", fecha: sumarDias(hoy, 1) },
    { etiqueta: "5 días hábiles", fecha: sumarDias(hoy, 5, true) },
    { etiqueta: "10 días hábiles", fecha: sumarDias(hoy, 10, true) },
  ];

  // Al abrir, llevar la vista al formulario. Quien lo usa le pone `key={casoInicial}`,
  // así que elegir otro caso desde afuera lo vuelve a montar.
  useEffect(() => {
    tarjeta.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    campoDescripcion.current?.focus({ preventScroll: true });
  }, []);

  const caso = casos.find((c) => c.id === casoId);
  const aviso = fecha ? avisoDiaInhabil(fecha) : null;
  const completo = Boolean(caso && descripcion.trim() && fecha);

  const guardar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caso || !completo) return;
    agregarVencimiento(caso.id, { fecha, descripcion: descripcion.trim(), tipo, hora, lugar: lugar.trim() });
    onListo(`Listo: "${descripcion.trim()}" para ${caso.cliente}, ${formatearFecha(fecha)}.`);
    setDescripcion("");
    setFecha("");
    setHora("");
    setLugar("");
  };

  return (
    <section
      ref={tarjeta}
      aria-labelledby="carga-rapida-titulo"
      className="flex scroll-mt-4 flex-col gap-4 rounded-3xl border border-tinta bg-white p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id="carga-rapida-titulo" className="font-semibold text-tinta">
          Agregar un plazo o una tarea
        </h2>
        <button type="button" onClick={onCerrar} className="text-sm font-medium text-gray-500 hover:text-tinta">
          Cerrar
        </button>
      </div>

      <form onSubmit={guardar} className="flex flex-col gap-4">
        <SelectField label="Caso" value={casoId} onChange={(e) => setCasoId(e.target.value)}>
          {casos.map((c) => (
            <option key={c.id} value={c.id}>
              {c.cliente} — {c.empleador}
            </option>
          ))}
        </SelectField>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-tinta" id="tipo-label">
            Tipo
          </p>
          <div
            role="radiogroup"
            aria-labelledby="tipo-label"
            className="grid w-full max-w-xs grid-cols-2 rounded-2xl border border-linea p-1"
          >
            {(["plazo", "tarea"] as const).map((t) => (
              <button
                key={t}
                type="button"
                role="radio"
                aria-checked={tipo === t}
                onClick={() => setTipo(t)}
                className={`rounded-md py-1.5 text-sm font-semibold transition-colors ${
                  tipo === t ? "bg-tinta text-white" : "text-gray-600 hover:bg-fondo"
                }`}
              >
                {t === "plazo" ? "Plazo" : "Tarea"}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500">
            {tipo === "plazo"
              ? "Lo fija la ley o el juzgado y tiene consecuencias si se pasa. Si vence, aparece en rojo en el panel."
              : "Algo que te anotás para no olvidarte, como llamar al cliente. Si se atrasa no pasa nada grave: aparece en amarillo."}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <TextField
            ref={campoDescripcion}
            label={TEXTOS[tipo].pregunta}
            placeholder={TEXTOS[tipo].ejemplo}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            {(caso ? sugerencias(caso, tipo) : []).map((s) => (
              <Chip
                key={s}
                activo={descripcion === s}
                onClick={() => {
                  // Tocar el elegido lo desmarca y deja el campo listo para escribir otro motivo.
                  if (descripcion !== s) return setDescripcion(s);
                  setDescripcion("");
                  campoDescripcion.current?.focus();
                }}
              >
                {s}
              </Chip>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-tinta">Cuándo</p>
          <div className="flex flex-wrap gap-2">
            {atajos.map((a) => (
              <Chip key={a.etiqueta} activo={fecha === a.fecha} onClick={() => setFecha(fecha === a.fecha ? "" : a.fecha)}>
                {a.etiqueta}
              </Chip>
            ))}
          </div>
          <TextField label="O elegí la fecha" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
          {fecha && (
            <p className={`text-sm ${aviso ? "text-amber-800" : "text-gray-500"}`}>
              {formatearFecha(fecha)}
              {aviso && ` · ${aviso} Revisá si corresponde.`}
            </p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-[9rem_1fr]">
          <TextField label="Hora" opcional type="time" value={hora} onChange={(e) => setHora(e.target.value)} />
          <TextField
            label="Lugar"
            opcional
            placeholder='Ej.: "Juzgado 45" o "por Zoom"'
            value={lugar}
            onChange={(e) => setLugar(e.target.value)}
          />
        </div>

        <div>
          <Button type="submit" disabled={!completo}>
            {TEXTOS[tipo].boton}
          </Button>
        </div>
      </form>
    </section>
  );
}
