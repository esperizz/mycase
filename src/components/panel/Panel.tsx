"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArtBadge, EstadoBadge } from "@/components/casos/EstadoBadge";
import { SubirCasosLocales } from "@/components/casos/SubirCasosLocales";
import { Button, ButtonLink } from "@/components/ui/Button";
import { useCasos } from "@/lib/casos/CasosProvider";
import { proximoFeriado } from "@/lib/casos/feriados";
import { formatearFecha, hoyIso, textoDias } from "@/lib/casos/formato";
import { armarPanel, DIAS_SEMANA, type Pendiente } from "@/lib/casos/panel";
import { ESTADOS, type Caso } from "@/lib/casos/tipos";
import { CargaRapida } from "./CargaRapida";

/** Número resumen. En celular es compacto (los cuatro en una fila) para que "Para hacer" entre en la primera pantalla. */
function Indicador({
  valor,
  etiqueta,
  corta,
  tono,
}: {
  valor: number;
  etiqueta: string;
  /** Etiqueta para celular. */
  corta: string;
  tono: "rojo" | "ambar" | "neutro";
}) {
  const color =
    valor > 0 && tono === "rojo"
      ? "border-red-200 bg-red-50 text-red-700"
      : valor > 0 && tono === "ambar"
        ? "border-amber-200 bg-amber-50 text-amber-800"
        : "border-gray-200 bg-white text-gray-900";
  return (
    <div className={`flex flex-col gap-0.5 rounded-lg border px-3 py-2 sm:gap-1 sm:rounded-xl sm:p-4 ${color}`}>
      <p className="text-xl font-bold tabular-nums sm:text-3xl">{valor}</p>
      <p className="text-xs font-medium sm:text-sm">
        <span className="sm:hidden">{corta}</span>
        <span className="hidden sm:inline">{etiqueta}</span>
      </p>
    </div>
  );
}

function ItemPendiente({ pendiente, onCumplir }: { pendiente: Pendiente; onCumplir: () => void }) {
  const { caso, vencimiento, dias } = pendiente;
  const color = dias < 0 ? "text-red-700" : dias === 0 ? "text-amber-800" : "text-gray-500";
  return (
    <li className="flex items-start gap-3 py-3">
      <input
        type="checkbox"
        checked={false}
        onChange={onCumplir}
        className="mt-1 size-4 shrink-0"
        aria-label={`Marcar "${vencimiento.descripcion || "vencimiento"}" como cumplido`}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4">
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="font-semibold text-gray-900">{vencimiento.descripcion || "Vencimiento sin descripción"}</p>
          <p className="text-sm text-gray-500">
            <Link href={`/casos/${caso.id}`} className="font-medium text-gray-700 underline-offset-2 hover:underline">
              {caso.cliente}
            </Link>{" "}
            · contra {caso.empleador}
          </p>
        </div>
        <div className={`shrink-0 text-sm sm:text-right ${color}`}>
          <p className="font-semibold">
            {textoDias(dias)}
            <span className="font-normal sm:hidden"> · {formatearFecha(vencimiento.fecha)}</span>
          </p>
          <p className="hidden text-xs sm:block">{formatearFecha(vencimiento.fecha)}</p>
        </div>
      </div>
    </li>
  );
}

function Grupo({
  titulo,
  pendientes,
  onCumplir,
}: {
  titulo: string;
  pendientes: Pendiente[];
  onCumplir: (p: Pendiente) => void;
}) {
  if (pendientes.length === 0) return null;
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
        {titulo} · {pendientes.length}
      </h3>
      <ul className="divide-y divide-gray-100">
        {pendientes.map((p) => (
          <ItemPendiente key={p.vencimiento.id} pendiente={p} onCumplir={() => onCumplir(p)} />
        ))}
      </ul>
    </div>
  );
}

function Tarjeta({
  titulo,
  ayuda,
  accion,
  children,
}: {
  titulo: string;
  ayuda?: string;
  /** Acción propia de la tarjeta, junto al título. */
  accion?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-semibold text-gray-900">{titulo}</h2>
          {ayuda && <p className="text-sm text-gray-500">{ayuda}</p>}
        </div>
        {accion}
      </div>
      {children}
    </section>
  );
}

const filaCorta = "flex w-full items-center justify-between gap-3 rounded-lg bg-gray-50 px-3 py-2 text-left text-sm hover:bg-gray-100";

function ContenidoFila({ caso, accion }: { caso: Caso; accion: string }) {
  return (
    <>
      <span className="min-w-0 truncate font-medium text-gray-900">{caso.cliente}</span>
      <span className="shrink-0 font-semibold text-gray-500">{accion} →</span>
    </>
  );
}

/** Lista de casos con una acción: navega a `destino` o, si se pasa `onElegir`, la resuelve ahí mismo. */
function ListaCorta({
  casos,
  accion,
  destino,
  onElegir,
}: {
  casos: Caso[];
  accion: string;
  destino?: (c: Caso) => string;
  onElegir?: (c: Caso) => void;
}) {
  return (
    <ul className="flex flex-col gap-2">
      {casos.map((c) => (
        <li key={c.id}>
          {onElegir ? (
            <button type="button" onClick={() => onElegir(c)} className={filaCorta}>
              <ContenidoFila caso={c} accion={accion} />
            </button>
          ) : (
            <Link href={destino?.(c) ?? `/casos/${c.id}`} className={filaCorta}>
              <ContenidoFila caso={c} accion={accion} />
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
}

function resumen(vencidos: number, hoy: number, semana: number): string {
  const partes = [
    vencidos && `${vencidos} vencido${vencidos === 1 ? "" : "s"}`,
    hoy && `${hoy} para hoy`,
    semana && `${semana} en los próximos ${DIAS_SEMANA} días`,
  ].filter(Boolean) as string[];
  if (partes.length === 0) return "Estás al día: no hay nada que venza esta semana.";
  const ultimo = partes.pop();
  return `Tenés ${partes.length ? `${partes.join(", ")} y ${ultimo}` : ultimo}.`;
}

export function Panel() {
  const { casos, listo, marcarVencimiento } = useCasos();
  /** null: carga rápida cerrada; "": abierta sin caso elegido; si no, el id del caso elegido. */
  const [carga, setCarga] = useState<string | null>(null);
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(""), 4000);
    return () => clearTimeout(t);
  }, [aviso]);

  if (!listo) return null;

  const hoy = hoyIso();
  const fecha = new Date().toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });
  const fechaTitulo = fecha.charAt(0).toUpperCase() + fecha.slice(1);

  if (casos.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-gray-300 py-16 text-center">
        <p className="text-lg font-semibold text-gray-900">Acá vas a ver qué tenés que hacer cada día</p>
        <p className="max-w-sm text-sm text-gray-500">
          Cargá tus casos con sus vencimientos y el panel te va a mostrar lo vencido, lo de hoy y lo que viene.
        </p>
        <ButtonLink href="/casos/nuevo">Cargar el primer caso</ButtonLink>
        <div className="max-w-sm">
          <SubirCasosLocales />
        </div>
      </div>
    );
  }

  const panel = armarPanel(casos, hoy);
  const cumplir = (p: Pendiente) => marcarVencimiento(p.caso.id, p.vencimiento.id, true);
  const feriadoCerca = proximoFeriado(hoy);
  const casosActivos = casos
    .filter((c) => c.estado !== "cerrado")
    .sort((a, b) => a.cliente.localeCompare(b.cliente, "es"));
  const hayAgenda = panel.vencidos.length + panel.hoy.length + panel.semana.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm font-medium text-gray-500">
          {fechaTitulo}
          {feriadoCerca && (
            <span>
              {" "}
              · {feriadoCerca.fecha === hoy ? "Hoy es feriado" : `Próximo feriado: ${formatearFecha(feriadoCerca.fecha)}`}{" "}
              ({feriadoCerca.nombre})
            </span>
          )}
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          {resumen(panel.vencidos.length, panel.hoy.length, panel.semana.length)}
        </h1>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        <Indicador valor={panel.vencidos.length} etiqueta="Vencidos" corta="Vencidos" tono="rojo" />
        <Indicador valor={panel.hoy.length} etiqueta="Para hoy" corta="Hoy" tono="ambar" />
        <Indicador
          valor={panel.semana.length}
          etiqueta={`Próximos ${DIAS_SEMANA} días`}
          corta={`${DIAS_SEMANA} días`}
          tono="neutro"
        />
        <Indicador valor={panel.activos} etiqueta="Casos activos" corta="Activos" tono="neutro" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Tarjeta
            titulo="Para hacer"
            ayuda="Tildá un vencimiento cuando lo cumplas y sale de la lista."
            accion={
              casosActivos.length > 0 &&
              carga === null && (
                <Button variante="secondary" className="self-start" onClick={() => setCarga("")}>
                  + Cargar vencimiento
                </Button>
              )
            }
          >
            {aviso && (
              <p role="status" className="rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-800">
                {aviso}
              </p>
            )}
            {carga !== null && (
              <CargaRapida
                key={carga}
                casos={casosActivos}
                casoInicial={carga}
                onListo={setAviso}
                onCerrar={() => setCarga(null)}
              />
            )}
            {hayAgenda ? (
              <div className="flex flex-col gap-4">
                <Grupo titulo="Vencidos" pendientes={panel.vencidos} onCumplir={cumplir} />
                <Grupo titulo="Hoy" pendientes={panel.hoy} onCumplir={cumplir} />
                <Grupo titulo={`Próximos ${DIAS_SEMANA} días`} pendientes={panel.semana} onCumplir={cumplir} />
              </div>
            ) : (
              <p className="rounded-lg bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
                Nada vence en los próximos {DIAS_SEMANA} días.
              </p>
            )}
          </Tarjeta>
        </div>

        <div className="flex flex-col gap-6">
          {panel.sinProximoPaso.length > 0 && (
            <Tarjeta
              titulo="Sin próximo paso"
              ayuda="Casos activos sin ningún vencimiento pendiente. Cargales el siguiente para no perderlos de vista."
            >
              <ListaCorta casos={panel.sinProximoPaso} onElegir={(c) => setCarga(c.id)} accion="Cargar" />
            </Tarjeta>
          )}

          {panel.cartasSinEnviar.length > 0 && (
            <Tarjeta titulo="Cartas sin enviar" ayuda="Empezaste la carta de intimación pero no la marcaste como enviada.">
              <ListaCorta casos={panel.cartasSinEnviar} destino={(c) => `/casos/${c.id}/carta`} accion="Seguir" />
            </Tarjeta>
          )}

          <Tarjeta titulo="Casos por etapa">
            <ul className="flex flex-col gap-2">
              {ESTADOS.map((e) => (
                <li key={e} className="flex items-center justify-between text-sm">
                  <EstadoBadge estado={e} />
                  <span className="font-semibold tabular-nums text-gray-900">
                    {panel.porEtapa[e]}
                  </span>
                </li>
              ))}
              <li className="flex items-center justify-between text-sm">
                <ArtBadge>ART (según hoja de ruta)</ArtBadge>
                <span className="font-semibold tabular-nums text-gray-900">{panel.art}</span>
              </li>
            </ul>
          </Tarjeta>
        </div>
      </div>
    </div>
  );
}
