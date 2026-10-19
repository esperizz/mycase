"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArtBadge, EstadoBadge } from "@/components/casos/EstadoBadge";
import { SubirCasosLocales } from "@/components/casos/SubirCasosLocales";
import { TipoTag } from "@/components/casos/TipoTag";
import { Button, ButtonLink } from "@/components/ui/Button";
import { useCasos } from "@/lib/casos/CasosProvider";
import { proximoFeriado } from "@/lib/casos/feriados";
import { diasEntre, formatearFecha, hoyIso, textoDias } from "@/lib/casos/formato";
import { armarPanel, DIAS_SEMANA, titular, type Pendiente } from "@/lib/casos/panel";
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
  const tarea = vencimiento.tipo === "tarea";
  // Una tarea atrasada no es grave como un plazo vencido: va en ámbar, no en rojo.
  const color = dias < 0 ? (tarea ? "text-amber-800" : "text-red-700") : dias === 0 ? "text-amber-800" : "text-gray-500";
  // Las tareas no "vencen": se dice para cuándo son.
  const cuando = !tarea
    ? textoDias(dias)
    : dias < 0
      ? `Atrasada ${-dias} día${dias === -1 ? "" : "s"}`
      : dias === 0
        ? "Para hoy"
        : dias === 1
          ? "Para mañana"
          : `En ${dias} días`;
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
          <p className="font-semibold text-gray-900">
            {vencimiento.descripcion || (tarea ? "Tarea sin descripción" : "Plazo sin descripción")}
            <TipoTag tipo={vencimiento.tipo} />
          </p>
          <p className="text-sm text-gray-500">
            <Link href={`/casos/${caso.id}`} className="font-medium text-gray-700 underline-offset-2 hover:underline">
              {caso.cliente}
            </Link>{" "}
            · contra {caso.empleador}
          </p>
        </div>
        <div className={`shrink-0 text-sm sm:text-right ${color}`}>
          <p className="font-semibold">
            {cuando}
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

/** PROTOTIPO: pendientes sin cumplir de hoy en adelante, sin límite de días. */
function todosLosPendientesFuturos(casos: Caso[], hoy: string): Pendiente[] {
  return casos
    .filter((c) => c.estado !== "cerrado")
    .flatMap((caso) =>
      caso.vencimientos
        .filter((v) => !v.cumplido && v.fecha >= hoy)
        .map((vencimiento) => ({ caso, vencimiento, dias: diasEntre(hoy, vencimiento.fecha) })),
    );
}

function Tarjeta({
  id,
  titulo,
  ayuda,
  accion,
  children,
}: {
  id?: string;
  titulo: string;
  ayuda?: string;
  /** Acción propia de la tarjeta, junto al título. */
  accion?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="flex scroll-mt-4 flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5">
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

/** PROTOTIPO: qué tarjetas de números mostrar arriba del panel. */
export type VarianteIndicadores = "actual" | "ninguno" | "nuevos";

/** PROTOTIPO: tarjeta con un dato y su detalle, que lleva a la acción al tocarla. */
function Dato({
  valor,
  etiqueta,
  detalle,
  href,
  tono = "neutro",
}: {
  valor: string;
  etiqueta: string;
  detalle?: string;
  href: string;
  tono?: "ambar" | "neutro";
}) {
  const color = tono === "ambar" ? "border-amber-200 bg-amber-50 text-amber-900" : "border-gray-200 bg-white text-gray-900";
  return (
    <a href={href} className={`flex min-w-0 flex-col gap-0.5 rounded-lg border px-3 py-2 hover:border-gray-400 sm:rounded-xl sm:p-4 ${color}`}>
      <p className="text-xs font-medium sm:text-sm">{etiqueta}</p>
      <p className="text-lg font-bold sm:text-2xl">{valor}</p>
      {detalle && <p className="truncate text-xs text-gray-500">{detalle}</p>}
    </a>
  );
}

export function Panel({ indicadores = "actual" }: { indicadores?: VarianteIndicadores } = {}) {
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
  // PROTOTIPO: datos para la variante "nuevos".
  const proximoPlazo = [...panel.hoy, ...panel.semana, ...todosLosPendientesFuturos(casos, hoy)]
    .filter((p) => p.vencimiento.tipo === "plazo")
    .sort((a, b) => a.dias - b.dias)[0];
  const avisosPendientes = casos.filter(
    (c) =>
      c.estado !== "cerrado" &&
      c.hojaRuta &&
      Object.keys(c.hojaRuta.cumplidos).some((id) => !c.hojaRuta!.avisados[id]),
  );
  const hayAgenda = panel.vencidos.length + panel.atrasadas.length + panel.hoy.length + panel.semana.length > 0;

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
          {titular(panel)}
        </h1>
      </div>

      {indicadores === "nuevos" && (
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {proximoPlazo ? (
            <Dato
              etiqueta="Próximo plazo"
              valor={proximoPlazo.dias === 0 ? "hoy" : proximoPlazo.dias === 1 ? "mañana" : `en ${proximoPlazo.dias} días`}
              detalle={`${proximoPlazo.vencimiento.descripcion} · ${proximoPlazo.caso.cliente}`}
              href={`/casos/${proximoPlazo.caso.id}`}
              tono={proximoPlazo.dias <= 2 ? "ambar" : "neutro"}
            />
          ) : (
            <Dato etiqueta="Próximo plazo" valor="ninguno" detalle="No hay plazos cargados" href="#para-hacer" />
          )}
          <Dato
            etiqueta="Sin próximo paso"
            valor={`${panel.sinProximoPaso.length} caso${panel.sinProximoPaso.length === 1 ? "" : "s"}`}
            detalle={panel.sinProximoPaso.length ? "Cargales el siguiente" : "Todos tienen algo"}
            href="#sin-proximo-paso"
            tono={panel.sinProximoPaso.length ? "ambar" : "neutro"}
          />
          {avisosPendientes.length > 0 && (
            <Dato
              etiqueta="Avisos pendientes"
              valor={`${avisosPendientes.length} cliente${avisosPendientes.length === 1 ? "" : "s"}`}
              detalle={avisosPendientes.map((c) => c.cliente).join(", ")}
              href={`/casos/${avisosPendientes[0].id}`}
              tono="ambar"
            />
          )}
        </div>
      )}

      {indicadores === "actual" && (
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
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Tarjeta
            id="para-hacer"
            titulo="Para hacer"
            ayuda="Plazos y tareas. Tildalos cuando los cumplas y salen de la lista."
            accion={
              casosActivos.length > 0 &&
              carga === null && (
                <Button variante="secondary" className="self-start" onClick={() => setCarga("")}>
                  + Agregar
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
                <Grupo titulo="Plazos vencidos" pendientes={panel.vencidos} onCumplir={cumplir} />
                <Grupo titulo="Tareas atrasadas" pendientes={panel.atrasadas} onCumplir={cumplir} />
                <Grupo titulo="Hoy" pendientes={panel.hoy} onCumplir={cumplir} />
                <Grupo titulo={`Próximos ${DIAS_SEMANA} días`} pendientes={panel.semana} onCumplir={cumplir} />
              </div>
            ) : (
              <p className="rounded-lg bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
                No hay plazos ni tareas en los próximos {DIAS_SEMANA} días.
              </p>
            )}
          </Tarjeta>
        </div>

        <div className="flex flex-col gap-6">
          {panel.sinProximoPaso.length > 0 && (
            <Tarjeta
              id="sin-proximo-paso"
              titulo="Sin próximo paso"
              ayuda="Casos activos sin plazos ni tareas pendientes. Cargales el siguiente para no perderlos de vista."
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
