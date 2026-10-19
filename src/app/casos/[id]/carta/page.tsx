"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { SelectField, TextAreaField, TextField } from "@/components/ui/Field";
import { Header } from "@/components/ui/Header";
import {
  consecuenciasPara,
  INFO_TIPO,
  PLAZOS,
  pedidoPorId,
  pedidosPara,
  plazoPorId,
} from "@/lib/casos/cartaCatalogo";
import { useCasos } from "@/lib/casos/CasosProvider";
import { formatearFecha, hoyIso, sumarDias } from "@/lib/casos/formato";
import { generarCarta } from "@/lib/casos/generarCarta";
import { cartaVacia, type CartaDatos, type PlazoId } from "@/lib/casos/tipos";

export default function CartaCasoPage() {
  const { id } = useParams<{ id: string }>();
  const { casos, listo, actualizar } = useCasos();
  const caso = casos.find((c) => c.id === id);

  const [copiado, setCopiado] = useState(false);
  const [fechaEnvio, setFechaEnvio] = useState(hoyIso);

  if (!listo) return null;

  if (!caso) {
    return (
      <>
        <Header />
        <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center gap-4 px-4 py-16 text-center">
          <p className="text-lg font-semibold text-tinta">No encontramos ese caso</p>
          <Link href="/casos" className="text-sm font-semibold text-tinta underline underline-offset-2">
            Volver a la lista
          </Link>
        </main>
      </>
    );
  }

  const d = caso.carta ?? cartaVacia();
  const pedidos = pedidosPara(caso.tipoReclamo);
  const pedidoActual = pedidoPorId(caso.tipoReclamo, d.pedidoId) ?? pedidos[0];
  const info = INFO_TIPO[caso.tipoReclamo] ?? INFO_TIPO.Otro;
  const consecuencias = consecuenciasPara(caso.tipoReclamo);

  // Cada cambio se guarda en el caso al instante: no hay que acordarse de guardar.
  const cambiar = (cambio: Partial<CartaDatos>) =>
    actualizar(caso.id, (c) => ({ ...c, carta: { ...(c.carta ?? cartaVacia()), ...cambio } }));

  const carta = generarCarta({ ...caso, carta: d });

  const plazo = plazoPorId(d.plazo);
  const venceEl = fechaEnvio ? sumarDias(fechaEnvio, plazo.dias, plazo.habiles) : "";

  const marcarEnviada = () => {
    if (!fechaEnvio) return;
    actualizar(caso.id, (c) => ({
      ...c,
      estado: c.estado === "consulta" ? "intimacion" : c.estado,
      carta: { ...(c.carta ?? cartaVacia()), enviadaEl: fechaEnvio },
      vencimientos: [
        ...c.vencimientos,
        {
          id: crypto.randomUUID(),
          fecha: venceEl,
          descripcion: `Vence el plazo de la intimación (${plazo.titulo})`,
          cumplido: false,
          tipo: "plazo",
        },
      ],
    }));
  };

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(carta.cuerpo);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      window.alert("No pudimos copiar el texto. Seleccionalo y copialo a mano.");
    }
  };

  const descargar = () => {
    const contenido = ["REMITENTE", carta.remitente, "", "DESTINATARIO", carta.destinatario, "", "TEXTO", carta.cuerpo].join(
      "\n",
    );
    const url = URL.createObjectURL(new Blob([contenido], { type: "text/plain;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `carta-${caso.cliente || "caso"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Header />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-8">
        <div className="flex flex-col gap-3">
          <Link href={`/casos/${caso.id}`} className="w-fit text-sm font-medium text-gray-500 hover:text-tinta">
            ← Volver al caso
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-tinta">Carta de intimación — {caso.cliente}</h1>
          <p className="text-sm text-gray-500">{info.intro}</p>
        </div>

        <section className="flex flex-col gap-4 rounded-3xl border border-linea bg-white p-5">
          <h2 className="font-semibold text-tinta">Remitente (cliente)</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Domicilio"
              value={d.remitenteDomicilio}
              onChange={(e) => cambiar({ remitenteDomicilio: e.target.value })}
            />
            <TextField
              label="Localidad"
              value={d.remitenteLocalidad}
              onChange={(e) => cambiar({ remitenteLocalidad: e.target.value })}
            />
            <TextField
              label="DNI"
              value={d.remitenteDocumento}
              onChange={(e) => cambiar({ remitenteDocumento: e.target.value })}
            />
          </div>
        </section>

        <section className="flex flex-col gap-4 rounded-3xl border border-linea bg-white p-5">
          <h2 className="font-semibold text-tinta">Destinatario (empleador)</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Domicilio"
              value={d.destinatarioDomicilio}
              onChange={(e) => cambiar({ destinatarioDomicilio: e.target.value })}
            />
            <TextField
              label="Localidad"
              value={d.destinatarioLocalidad}
              onChange={(e) => cambiar({ destinatarioLocalidad: e.target.value })}
            />
            <TextField
              label="CUIT"
              value={d.destinatarioDocumento}
              onChange={(e) => cambiar({ destinatarioDocumento: e.target.value })}
            />
          </div>
        </section>

        <section className="flex flex-col gap-4 rounded-3xl border border-linea bg-white p-5">
          <h2 className="font-semibold text-tinta">¿Qué pasó?</h2>
          <TextField
            label="Fecha del hecho"
            opcional
            type="date"
            value={d.hechosFecha}
            onChange={(e) => cambiar({ hechosFecha: e.target.value })}
          />
          <TextAreaField
            label="Descripción"
            placeholder={info.ejemploHechos}
            value={d.hechosDescripcion}
            onChange={(e) => cambiar({ hechosDescripcion: e.target.value })}
          />
        </section>

        <section className="flex flex-col gap-4 rounded-3xl border border-linea bg-white p-5">
          <h2 className="font-semibold text-tinta">Qué le pedís</h2>
          <SelectField
            label="Pedido"
            value={pedidoActual?.id ?? ""}
            onChange={(e) => cambiar({ pedidoId: e.target.value })}
          >
            {pedidos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.titulo}
              </option>
            ))}
          </SelectField>
          {pedidoActual?.pideMonto && (
            <TextField
              label="Monto"
              placeholder="Ej.: 450.000"
              value={d.pedidoMonto}
              onChange={(e) => cambiar({ pedidoMonto: e.target.value })}
            />
          )}
          {pedidoActual?.pideDetalle && (
            <TextAreaField
              label="Detalle"
              value={d.pedidoDetalle}
              onChange={(e) => cambiar({ pedidoDetalle: e.target.value })}
            />
          )}
          <SelectField label="Plazo" value={d.plazo} onChange={(e) => cambiar({ plazo: e.target.value as PlazoId })}>
            {PLAZOS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.titulo} — {p.descripcion}
              </option>
            ))}
          </SelectField>
        </section>

        <section className="flex flex-col gap-3 rounded-3xl border border-linea bg-white p-5">
          <h2 className="font-semibold text-tinta">Bajo apercibimiento de...</h2>
          <ul className="flex flex-col gap-2">
            {consecuencias.map((c) => (
              <li key={c.id} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="size-4"
                  checked={d.consecuencias.includes(c.id)}
                  onChange={(e) =>
                    cambiar({
                      consecuencias: e.target.checked
                        ? [...d.consecuencias, c.id]
                        : d.consecuencias.filter((x) => x !== c.id),
                    })
                  }
                  aria-label={c.titulo}
                />
                <span className="text-sm text-gray-700">{c.titulo}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-4 rounded-3xl border border-linea bg-white p-5">
          <h2 className="font-semibold text-tinta">Vista previa</h2>
          <pre className="whitespace-pre-wrap rounded-2xl bg-fondo p-4 font-sans text-sm text-tinta">
            {carta.cuerpo}
          </pre>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button onClick={copiar}>{copiado ? "¡Copiado!" : "Copiar el texto"}</Button>
            <Button variante="secondary" onClick={descargar}>
              Descargar
            </Button>
          </div>
        </section>

        <section className="flex flex-col gap-4 rounded-3xl border border-linea bg-white p-5">
          <h2 className="font-semibold text-tinta">¿Ya la mandaste?</h2>
          {d.enviadaEl ? (
            <div className="flex flex-col gap-2 text-sm text-gray-700">
              <p>
                Marcada como enviada el <strong>{formatearFecha(d.enviadaEl)}</strong>. El vencimiento del plazo quedó
                cargado en la ficha del caso.
              </p>
              <Link
                href={`/casos/${caso.id}`}
                className="w-fit font-semibold text-tinta underline underline-offset-2"
              >
                Ver el caso
              </Link>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500">
                Al marcarla como enviada, el caso pasa a &ldquo;Intimación enviada&rdquo; y se agrega el vencimiento
                del plazo a la ficha. El plazo corre desde que el empleador la recibe: si la recepción se demora, quitá
                ese vencimiento en la ficha y cargalo con la fecha correcta.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <TextField
                    label="Fecha de envío"
                    type="date"
                    value={fechaEnvio}
                    onChange={(e) => setFechaEnvio(e.target.value)}
                  />
                </div>
                <Button onClick={marcarEnviada} disabled={!fechaEnvio}>
                  Marcar como enviada
                </Button>
              </div>
              {venceEl && (
                <p className="text-sm text-gray-500">
                  Vencimiento estimado: <strong>{formatearFecha(venceEl)}</strong> ({plazo.titulo}
                  {plazo.habiles && ", descontando fines de semana y feriados nacionales"}).
                </p>
              )}
            </>
          )}
        </section>
      </main>
    </>
  );
}
