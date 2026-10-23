"use client";

import { useEffect, useState } from "react";
import { ArtBadge, EstadoBadge } from "@/components/casos/EstadoBadge";
import { SubirCasosLocales } from "@/components/casos/SubirCasosLocales";
import { TipoTag } from "@/components/casos/TipoTag";
import { BotonTexto, Button, ButtonLink, Enlace, FilaEnlace } from "@/components/ui/Button";
import { Casilla } from "@/components/ui/Controles";
import { Indicador } from "@/components/ui/Datos";
import { Aviso, ListaDividida, Recuadro, Tarjeta, Vacio } from "@/components/ui/Superficies";
import { Rotulo, Texto, Titulo, type TonoTexto } from "@/components/ui/Texto";
import { descargarCalendario } from "@/lib/casos/calendario";
import { tipoCartaPorId } from "@/lib/casos/cartaCatalogo";
import { useCasos } from "@/lib/casos/CasosProvider";
import { proximoFeriado } from "@/lib/casos/feriados";
import { formatearFecha, horaYLugar, hoyIso, textoPendiente } from "@/lib/casos/formato";
import { armarPanel, DIAS_SEMANA, titular, type Pendiente } from "@/lib/casos/panel";
import { ESTADOS, type Caso } from "@/lib/casos/tipos";
import { CargaRapida } from "./CargaRapida";

/** "Marta Ríos" o "Marta Ríos y 4 más". */
function yMas(nombres: string[]): string {
  return nombres.length > 1 ? `${nombres[0]} y ${nombres.length - 1} más` : (nombres[0] ?? "");
}

function ItemPendiente({ pendiente, onCumplir }: { pendiente: Pendiente; onCumplir: () => void }) {
  const { caso, vencimiento, dias } = pendiente;
  const tarea = vencimiento.tipo === "tarea";
  // Una tarea atrasada no es grave como un plazo vencido: va en ámbar, no en rojo.
  const tono: TonoTexto = dias < 0 ? (tarea ? "warning" : "danger") : dias === 0 ? "warning" : "secondary";
  const cuando = textoPendiente(dias, vencimiento.tipo);
  const cuandoExacto = [formatearFecha(vencimiento.fecha), horaYLugar(vencimiento)].filter(Boolean).join(" · ");
  return (
    <li className="flex items-start gap-3 py-3">
      <Casilla
        checked={false}
        onChange={onCumplir}
        className="mt-1"
        aria-label={`Marcar "${vencimiento.descripcion || "vencimiento"}" como cumplido`}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4">
        <div className="flex min-w-0 flex-col gap-0.5">
          <Texto peso="semibold" tono="primary">
            {vencimiento.descripcion || (tarea ? "Tarea sin descripción" : "Plazo sin descripción")}
            <TipoTag tipo={vencimiento.tipo} />
          </Texto>
          <Texto estilo="body-sm" tono="secondary">
            <Enlace href={`/casos/${caso.id}`} variante="subtle">
              {caso.cliente}
            </Enlace>{" "}
            · contra {caso.empleador}
          </Texto>
        </div>
        <Texto as="div" estilo="body-sm" tono={tono} className="shrink-0 sm:text-right">
          <Texto peso="semibold">
            {cuando}
            <Texto as="span" peso="regular" className="sm:hidden">
              {" "}
              · {cuandoExacto}
            </Texto>
          </Texto>
          <Texto estilo="caption" className="hidden sm:block">
            {cuandoExacto}
          </Texto>
        </Texto>
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
      <Rotulo as="h3">
        {titulo} · {pendientes.length}
      </Rotulo>
      <ListaDividida>
        {pendientes.map((p) => (
          <ItemPendiente key={p.vencimiento.id} pendiente={p} onCumplir={() => onCumplir(p)} />
        ))}
      </ListaDividida>
    </div>
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
          <FilaEnlace
            href={onElegir ? undefined : (destino?.(c) ?? `/casos/${c.id}`)}
            onClick={onElegir && (() => onElegir(c))}
            accion={accion}
          >
            <Texto as="span" peso="medium" tono="primary" className="truncate">
              {c.cliente}
            </Texto>
          </FilaEnlace>
        </li>
      ))}
    </ul>
  );
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
      <Vacio
        titulo="Acá vas a ver qué tenés que hacer cada día"
        descripcion="Cargá tus casos con sus vencimientos y el panel te va a mostrar lo vencido, lo de hoy y lo que viene."
      >
        <ButtonLink href="/casos/nuevo">Cargar el primer caso</ButtonLink>
        <div className="max-w-sm">
          <SubirCasosLocales />
        </div>
      </Vacio>
    );
  }

  const panel = armarPanel(casos, hoy);
  const cumplir = (p: Pendiente) => marcarVencimiento(p.caso.id, p.vencimiento.id, true);
  const feriadoCerca = proximoFeriado(hoy);
  const casosActivos = casos
    .filter((c) => c.estado !== "cerrado")
    .sort((a, b) => a.cliente.localeCompare(b.cliente, "es"));
  const proximo = panel.proximosPlazos[0];
  const hayAgenda = panel.vencidos.length + panel.atrasadas.length + panel.hoy.length + panel.semana.length > 0;
  // Todo lo que falta, también lo de más adelante: el calendario avisa el día anterior.
  const porVenir = casosActivos.flatMap((caso) =>
    caso.vencimientos.filter((v) => !v.cumplido && v.fecha >= hoy).map((vencimiento) => ({ caso, vencimiento })),
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Texto estilo="body-sm" peso="medium" tono="secondary">
          {fechaTitulo}
          {feriadoCerca && (
            <span>
              {" "}
              · {feriadoCerca.fecha === hoy ? "Hoy es feriado" : `Próximo feriado: ${formatearFecha(feriadoCerca.fecha)}`}{" "}
              ({feriadoCerca.nombre})
            </span>
          )}
        </Texto>
        <Titulo className="max-w-3xl">{titular(panel)}</Titulo>
      </div>

      <div>
        {proximo ? (
          <Indicador
            etiqueta={
              panel.proximosPlazos.length > 1 ? `Próximo plazo · ${panel.proximosPlazos.length} plazos` : "Próximo plazo"
            }
            valor={
              proximo.dias < 0 ? "vencido" : proximo.dias === 0 ? "hoy" : proximo.dias === 1 ? "mañana" : `en ${proximo.dias} días`
            }
            detalle={
              panel.proximosPlazos.length > 1
                ? yMas(panel.proximosPlazos.map((p) => p.caso.cliente))
                : `${proximo.vencimiento.descripcion || "Plazo"} · ${proximo.caso.cliente}`
            }
            href={panel.proximosPlazos.length > 1 ? "#para-hacer" : `/casos/${proximo.caso.id}`}
            tono={proximo.dias < 0 ? "danger" : proximo.dias <= 1 ? "warning" : "accent"}
          />
        ) : (
          <Indicador etiqueta="Próximo plazo" valor="ninguno" detalle="No hay plazos cargados" href="#para-hacer" />
        )}
      </div>

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
              <Aviso tono="success" role="status">
                {aviso}
              </Aviso>
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
              <Recuadro centrado>
                <Texto estilo="body-sm" tono="secondary">
                  No hay plazos ni tareas en los próximos {DIAS_SEMANA} días.
                </Texto>
              </Recuadro>
            )}
            {porVenir.length > 0 && (
              <BotonTexto estilo="body-sm" className="w-fit" onClick={() => descargarCalendario(porVenir, "mycase-plazos")}>
                Agregar {porVenir.length === 1 ? "el pendiente" : `los ${porVenir.length} pendientes`} a mi calendario
              </BotonTexto>
            )}
          </Tarjeta>
        </div>

        <div className="flex flex-col gap-6">
          {panel.sinNadaCargado.length > 0 && (
            <Tarjeta
              titulo="Sin plazos ni tareas"
              ayuda="Estos casos no tienen nada cargado que te recuerde qué sigue. Cargales lo próximo para no perderlos de vista."
            >
              <ListaCorta casos={panel.sinNadaCargado} onElegir={(c) => setCarga(c.id)} accion="Cargar" />
            </Tarjeta>
          )}

          {panel.listosParaCerrar.length > 0 && (
            <Tarjeta
              titulo="Listos para cerrar"
              ayuda="Casos de ART con todos los pasos cumplidos. Si no queda nada más por hacer, cerralos."
            >
              <ListaCorta casos={panel.listosParaCerrar} destino={(c) => `/casos/${c.id}`} accion="Ver" />
            </Tarjeta>
          )}

          {panel.cartasSinEnviar.length > 0 && (
            <Tarjeta titulo="Cartas sin enviar" ayuda="Cartas que empezaste pero no marcaste como enviadas.">
              <ul className="flex flex-col gap-2">
                {panel.cartasSinEnviar.map(({ caso, carta }) => (
                  <li key={carta.id}>
                    <FilaEnlace href={`/casos/${caso.id}/cartas/${carta.id}`} accion="Seguir">
                      <Texto as="span" peso="medium" tono="primary" className="truncate">
                        {caso.cliente}{" "}
                        <Texto as="span" peso="regular" tono="secondary">
                          · {tipoCartaPorId(carta.tipo).titulo}
                        </Texto>
                      </Texto>
                    </FilaEnlace>
                  </li>
                ))}
              </ul>
            </Tarjeta>
          )}

          <Tarjeta titulo="Casos por etapa">
            <ul className="flex flex-col gap-2">
              {ESTADOS.map((e) => (
                <li key={e} className="flex items-center justify-between">
                  <EstadoBadge estado={e} />
                  <Texto as="span" estilo="body-sm" peso="semibold" tono="primary" numerico>
                    {panel.porEtapa[e]}
                  </Texto>
                </li>
              ))}
              <li className="flex items-center justify-between">
                <ArtBadge>ART (según hoja de ruta)</ArtBadge>
                <Texto as="span" estilo="body-sm" peso="semibold" tono="primary" numerico>
                  {panel.art}
                </Texto>
              </li>
            </ul>
          </Tarjeta>
        </div>
      </div>
    </div>
  );
}
