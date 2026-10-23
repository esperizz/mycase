"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { Button, Enlace, LinkVolver } from "@/components/ui/Button";
import { Casilla } from "@/components/ui/Controles";
import { SelectField, TextAreaField, TextField } from "@/components/ui/Field";
import { Pagina, PaginaNoEncontrada } from "@/components/ui/Pagina";
import { Recuadro, Tarjeta } from "@/components/ui/Superficies";
import { Texto, Titulo } from "@/components/ui/Texto";
import {
  consecuenciasPara,
  INFO_TIPO,
  PLAZOS,
  pedidoPorId,
  pedidosPara,
  plazoPorId,
  tipoCartaPorId,
  VENCE_INTIMACION,
} from "@/lib/casos/cartaCatalogo";
import { useCasos } from "@/lib/casos/CasosProvider";
import { formatearFecha, hoyIso, sumarDias } from "@/lib/casos/formato";
import { generarCarta } from "@/lib/casos/generarCarta";
import type { CartaDatos, PlazoId } from "@/lib/casos/tipos";

export default function CartaPage() {
  const { id, cartaId } = useParams<{ id: string; cartaId: string }>();
  const { casos, listo, actualizar } = useCasos();
  const caso = casos.find((c) => c.id === id);
  const d = caso?.cartas.find((c) => c.id === cartaId);

  const [copiado, setCopiado] = useState(false);
  const [fechaEnvio, setFechaEnvio] = useState(hoyIso);

  if (!listo) return null;
  if (!caso || !d) {
    return (
      <PaginaNoEncontrada
        titulo="No encontramos esa carta"
        href={caso ? `/casos/${caso.id}` : "/casos"}
        enlace={caso ? "Volver al caso" : "Volver a la lista"}
      />
    );
  }

  const tipo = tipoCartaPorId(d.tipo);
  const pedidos = pedidosPara(caso.tipoReclamo);
  const pedidoActual = pedidoPorId(caso.tipoReclamo, d.pedidoId) ?? pedidos[0];
  const info = INFO_TIPO[caso.tipoReclamo] ?? INFO_TIPO.Otro;
  const consecuencias = consecuenciasPara(caso.tipoReclamo);

  // Cada cambio se guarda en el caso al instante: no hay que acordarse de guardar.
  const cambiar = (cambio: Partial<CartaDatos>) =>
    actualizar(caso.id, (c) => ({ ...c, cartas: c.cartas.map((x) => (x.id === d.id ? { ...x, ...cambio } : x)) }));

  const carta = generarCarta(caso, d);

  const plazo = plazoPorId(d.plazo);
  const venceEl = fechaEnvio ? sumarDias(fechaEnvio, plazo.dias, plazo.habiles) : "";

  const marcarEnviada = () => {
    if (!fechaEnvio) return;
    actualizar(caso.id, (c) => ({
      ...c,
      estado: c.estado === "consulta" ? "intimacion" : c.estado,
      cartas: c.cartas.map((x) => (x.id === d.id ? { ...x, enviadaEl: fechaEnvio } : x)),
      vencimientos: [
        ...c.vencimientos,
        {
          id: crypto.randomUUID(),
          fecha: venceEl,
          descripcion: `${VENCE_INTIMACION} (${plazo.titulo})`,
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
    a.download = `carta-${tipo.id}-${caso.cliente || "caso"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Pagina ancho="amplio">
      <div className="flex flex-col gap-3">
        <LinkVolver href={`/casos/${caso.id}`}>Volver al caso</LinkVolver>
        <Titulo>
          {tipo.titulo} — {caso.cliente}
        </Titulo>
        <Texto estilo="body-sm" tono="secondary">
          {tipo.descripcion}
        </Texto>
      </div>

      <Tarjeta titulo="Remitente (cliente)">
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
      </Tarjeta>

      <Tarjeta titulo="Destinatario (empleador)">
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
      </Tarjeta>

      <Tarjeta titulo="¿Qué pasó?">
        {d.tipo === "despido-indirecto" && (
          <SelectField
            label="¿Qué hizo el empleador con la carta anterior?"
            value={d.respuesta}
            onChange={(e) => cambiar({ respuesta: e.target.value as CartaDatos["respuesta"] })}
          >
            <option value="silencio">No respondió</option>
            <option value="negativa">Respondió negándose</option>
          </SelectField>
        )}
        <TextField
          label={
            d.tipo === "despido-indirecto"
              ? "Fecha de la carta anterior"
              : d.tipo === "liquidacion"
                ? "Fecha en que terminó la relación"
                : "Fecha del hecho"
          }
          opcional={d.tipo !== "despido-indirecto"}
          type="date"
          value={d.hechosFecha}
          onChange={(e) => cambiar({ hechosFecha: e.target.value })}
        />
        <TextAreaField
          label={d.tipo === "intimacion" ? "Descripción" : "Algo más que quieras contar"}
          opcional={d.tipo !== "intimacion"}
          placeholder={d.tipo === "intimacion" ? info.ejemploHechos : undefined}
          value={d.hechosDescripcion}
          onChange={(e) => cambiar({ hechosDescripcion: e.target.value })}
        />
      </Tarjeta>

      <Tarjeta titulo="Qué le pedís">
        {d.tipo === "intimacion" && (
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
        )}
        {d.tipo === "despido-indirecto" && (
          <Texto estilo="body-sm" tono="secondary">
            Que pague las indemnizaciones por el despido y la liquidación final, y que entregue los certificados de
            trabajo.
          </Texto>
        )}
        {d.tipo === "liquidacion" && (
          <Texto estilo="body-sm" tono="secondary">
            Que pague la liquidación final y entregue los certificados de trabajo.
          </Texto>
        )}
        {((d.tipo === "intimacion" && pedidoActual?.pideMonto) ||
          d.tipo === "despido-indirecto" ||
          d.tipo === "liquidacion") && (
          <TextField
            label="Monto"
            opcional={d.tipo !== "intimacion"}
            placeholder="Ej.: 450.000"
            value={d.pedidoMonto}
            onChange={(e) => cambiar({ pedidoMonto: e.target.value })}
          />
        )}
        {((d.tipo === "intimacion" && pedidoActual?.pideDetalle) || d.tipo === "otra") && (
          <TextAreaField
            label={d.tipo === "otra" ? "¿Qué le pedís?" : "Detalle"}
            placeholder={d.tipo === "otra" ? 'Ej.: "me reintegre a mi puesto de trabajo"' : undefined}
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
      </Tarjeta>

      <Tarjeta titulo="Bajo apercibimiento de...">
        <ul className="flex flex-col gap-2">
          {consecuencias.map((c) => (
            <li key={c.id}>
              <Casilla
                etiqueta={c.titulo}
                checked={d.consecuencias.includes(c.id)}
                onChange={(e) =>
                  cambiar({
                    consecuencias: e.target.checked
                      ? [...d.consecuencias, c.id]
                      : d.consecuencias.filter((x) => x !== c.id),
                  })
                }
              />
            </li>
          ))}
        </ul>
      </Tarjeta>

      <Tarjeta titulo="Vista previa">
        <Recuadro>
          <Texto estilo="body-sm" tono="primary" preservarSaltos>
            {carta.cuerpo}
          </Texto>
        </Recuadro>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button onClick={copiar}>{copiado ? "¡Copiado!" : "Copiar el texto"}</Button>
          <Button variante="secondary" onClick={descargar}>
            Descargar
          </Button>
        </div>
      </Tarjeta>

      <Tarjeta titulo="¿Ya la mandaste?">
        {d.enviadaEl ? (
          <Texto as="div" estilo="body-sm" tono="secondary" className="flex flex-col gap-2">
            <p>
              Marcada como enviada el <strong>{formatearFecha(d.enviadaEl)}</strong>. El vencimiento del plazo quedó
              cargado en la ficha del caso. Si hace falta otra carta, empezala desde la ficha.
            </p>
            <Enlace href={`/casos/${caso.id}`} subrayado className="w-fit">
              Ver el caso
            </Enlace>
          </Texto>
        ) : (
          <>
            <Texto estilo="body-sm" tono="secondary">
              Al marcarla como enviada se agrega el vencimiento del plazo a la ficha
              {caso.estado === "consulta" && <> y el caso pasa a &ldquo;Intimación enviada&rdquo;</>}. El plazo corre
              desde que el empleador la recibe: si la recepción se demora, cambiá ese vencimiento en la ficha.
            </Texto>
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
              <Texto estilo="body-sm" tono="secondary">
                Vencimiento estimado: <strong>{formatearFecha(venceEl)}</strong> ({plazo.titulo}
                {plazo.habiles && ", descontando fines de semana y feriados nacionales"}).
              </Texto>
            )}
          </>
        )}
      </Tarjeta>
    </Pagina>
  );
}
