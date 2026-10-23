"use client";

import { useEffect, useRef, useState } from "react";
import { BotonTexto, Button } from "@/components/ui/Button";
import { Chip, Segmentado } from "@/components/ui/Controles";
import { SelectField, TextField } from "@/components/ui/Field";
import { Tarjeta } from "@/components/ui/Superficies";
import { Texto } from "@/components/ui/Texto";
import { useCasos } from "@/lib/casos/CasosProvider";
import { feriado } from "@/lib/casos/feriados";
import { formatearFecha, hoyIso, sumarDias } from "@/lib/casos/formato";
import { esCita, sugerencias } from "@/lib/casos/sugerencias";
import { CamposHoraLugar } from "@/components/casos/CamposHoraLugar";
import type { Caso, TipoVencimiento } from "@/lib/casos/tipos";

const TEXTOS: Record<TipoVencimiento, { pregunta: string; ejemplo: string; boton: string }> = {
  plazo: { pregunta: "¿Qué vence?", ejemplo: 'Ej.: "Contestar traslado"', boton: "Agregar plazo" },
  tarea: { pregunta: "¿Qué hay que hacer?", ejemplo: 'Ej.: "Mandarle el instructivo de escaneo"', boton: "Agregar tarea" },
};

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
    <Tarjeta
      ref={tarjeta}
      destacada
      titulo="Agregar un plazo o una tarea"
      accion={
        <BotonTexto variante="quiet" estilo="body-sm" className="self-start" onClick={onCerrar}>
          Cerrar
        </BotonTexto>
      }
    >
      <form onSubmit={guardar} className="flex flex-col gap-4">
        <SelectField label="Caso" value={casoId} onChange={(e) => setCasoId(e.target.value)}>
          {casos.map((c) => (
            <option key={c.id} value={c.id}>
              {c.cliente} — {c.empleador}
            </option>
          ))}
        </SelectField>

        <Segmentado
          label="Tipo"
          opciones={[
            { valor: "plazo", etiqueta: "Plazo" },
            { valor: "tarea", etiqueta: "Tarea" },
          ]}
          valor={tipo}
          onChange={setTipo}
          ayuda={
            tipo === "plazo"
              ? "Lo fija la ley o el juzgado y tiene consecuencias si se pasa. Si vence, aparece en rojo en el panel."
              : "Algo que te anotás para no olvidarte, como llamar al cliente. Si se atrasa no pasa nada grave: aparece en amarillo."
          }
        />

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
          <Texto estilo="body-sm" peso="semibold" tono="primary">
            Cuándo
          </Texto>
          <div className="flex flex-wrap gap-2">
            {atajos.map((a) => (
              <Chip key={a.etiqueta} activo={fecha === a.fecha} onClick={() => setFecha(fecha === a.fecha ? "" : a.fecha)}>
                {a.etiqueta}
              </Chip>
            ))}
          </div>
          <TextField label="O elegí la fecha" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
          {fecha && (
            <Texto estilo="body-sm" tono={aviso ? "warning" : "secondary"}>
              {formatearFecha(fecha)}
              {aviso && ` · ${aviso} Revisá si corresponde.`}
            </Texto>
          )}
        </div>

        <CamposHoraLugar hora={hora} lugar={lugar} onHora={setHora} onLugar={setLugar} abrir={esCita(descripcion)} />

        <Button type="submit" className="self-start" disabled={!completo}>
          {TEXTOS[tipo].boton}
        </Button>
      </form>
    </Tarjeta>
  );
}
