import { Subtitulo, Texto, unir, type EstiloTexto } from "./Texto";

/**
 * Los tokens de `globals.css`, para el catálogo del sistema. Las clases se escriben enteras para
 * que Tailwind las encuentre.
 */
type Muestra = { token: string; clase: string; uso: string };

const FONDOS: Muestra[] = [
  { token: "bg-default", clase: "bg-default", uso: "Fondo de la página" },
  { token: "bg-surface-primary", clase: "bg-surface-primary", uso: "Tarjetas, campos, menús" },
  { token: "bg-surface-primary-hover", clase: "bg-surface-primary-hover", uso: "Opción sobre blanco, al pasar" },
  { token: "bg-surface-secondary", clase: "bg-surface-secondary", uso: "Filas y recuadros" },
  { token: "bg-surface-secondary-hover", clase: "bg-surface-secondary-hover", uso: "Fila, al pasar" },
  { token: "bg-surface-tertiary", clase: "bg-surface-tertiary", uso: "Badge neutro" },
  { token: "bg-surface-accent", clase: "bg-surface-accent", uso: "Lo que hay que mirar primero" },
  { token: "bg-surface-accent-subtle", clase: "bg-surface-accent-subtle", uso: "Navegación activa, plazo" },
  { token: "bg-surface-danger", clase: "bg-surface-danger", uso: "Error, vencido" },
  { token: "bg-surface-warning", clase: "bg-surface-warning", uso: "Advertencia, urgente" },
  { token: "bg-surface-success", clase: "bg-surface-success", uso: "Confirmación" },
  { token: "bg-surface-info", clase: "bg-surface-info", uso: "Sugerencia" },
  { token: "bg-surface-special", clase: "bg-surface-special", uso: "Etapa demanda" },
  { token: "bg-surface-art", clase: "bg-surface-art", uso: "Casos de ART" },
  { token: "bg-fill-primary", clase: "bg-fill-primary", uso: "Botón principal, opción elegida" },
  { token: "bg-fill-primary-hover", clase: "bg-fill-primary-hover", uso: "Botón principal, al pasar" },
  { token: "bg-fill-danger", clase: "bg-fill-danger", uso: "Botón que borra" },
  { token: "bg-fill-danger-hover", clase: "bg-fill-danger-hover", uso: "Botón que borra, al pasar" },
  { token: "bg-fill-success", clase: "bg-fill-success", uso: "WhatsApp, paso cumplido" },
  { token: "bg-fill-success-hover", clase: "bg-fill-success-hover", uso: "WhatsApp, al pasar" },
  { token: "bg-fill-disabled", clase: "bg-fill-disabled", uso: "Botón deshabilitado" },
  { token: "bg-overlay", clase: "bg-overlay", uso: "Detrás de un diálogo" },
];

const TEXTOS: Muestra[] = [
  { token: "text-primary", clase: "text-primary", uso: "Texto principal" },
  { token: "text-secondary", clase: "text-secondary", uso: "Ayudas, fechas" },
  { token: "text-secondary-hover", clase: "text-secondary-hover", uso: "Link secundario, al pasar" },
  { token: "text-tertiary", clase: "text-tertiary", uso: "Pendiente, opcional" },
  { token: "text-disabled", clase: "text-disabled", uso: "Deshabilitado" },
  { token: "text-on-fill", clase: "text-on-fill", uso: "Sobre bg-fill-*" },
  { token: "text-accent", clase: "text-accent", uso: "Sobre el acento" },
  { token: "text-danger", clase: "text-danger", uso: "Vencido, borrar" },
  { token: "text-warning", clase: "text-warning", uso: "Urgente" },
  { token: "text-success", clase: "text-success", uso: "Cumplido" },
  { token: "text-info", clase: "text-info", uso: "Sugerencia" },
  { token: "text-special", clase: "text-special", uso: "Etapa demanda" },
  { token: "text-art", clase: "text-art", uso: "Casos de ART" },
];

const BORDES: Muestra[] = [
  { token: "border-primary", clase: "border-primary", uso: "Lo elegido o en uso" },
  { token: "border-secondary", clase: "border-secondary", uso: "Bordes y divisiones" },
  { token: "border-secondary-hover", clase: "border-secondary-hover", uso: "Borde, al pasar" },
  { token: "border-secondary-focus", clase: "border-secondary-focus", uso: "Campo con el foco" },
  { token: "border-accent", clase: "border-accent", uso: "Indicador con acento" },
  { token: "border-danger", clase: "border-danger", uso: "Indicador vencido" },
  { token: "border-warning", clase: "border-warning", uso: "Indicador urgente" },
];

function Grupo({
  titulo,
  muestras,
  dibujo,
}: {
  titulo: string;
  muestras: Muestra[];
  dibujo: (m: Muestra) => React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <Subtitulo as="h3">{titulo}</Subtitulo>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {muestras.map((m) => (
          <li key={m.token} className="flex items-center gap-3">
            {dibujo(m)}
            <span className="min-w-0">
              <Texto estilo="body-sm" peso="semibold" tono="primary" className="truncate">
                color-{m.token}
              </Texto>
              <Texto estilo="caption" tono="secondary">
                {m.uso}
              </Texto>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const cuadro = "flex size-10 shrink-0 items-center justify-center rounded-control";

export function MuestrasDeColor() {
  return (
    <div className="flex flex-col gap-6">
      <Grupo
        titulo="Background"
        muestras={FONDOS}
        dibujo={(m) => <span aria-hidden className={unir(cuadro, "border border-secondary", m.clase)} />}
      />
      <Grupo
        titulo="Text"
        muestras={TEXTOS}
        dibujo={(m) => (
          <span
            aria-hidden
            className={unir(
              cuadro,
              "text-h2",
              m.clase,
              m.token === "text-on-fill" ? "bg-fill-primary" : "border border-secondary bg-surface-primary",
            )}
          >
            Aa
          </span>
        )}
      />
      <Grupo
        titulo="Border"
        muestras={BORDES}
        dibujo={(m) => <span aria-hidden className={unir(cuadro, "border-2 bg-surface-primary", m.clase)} />}
      />
    </div>
  );
}

const TEXT_STYLES: { estilo: EstiloTexto; spec: string; uso: string }[] = [
  { estilo: "h1", spec: "24 → 30 · 1.2 · semibold · −2.5%", uso: "Título de pantalla" },
  { estilo: "h2", spec: "18 · 1.4 · semibold", uso: "Título de diálogo, estado vacío" },
  { estilo: "h3", spec: "16 · 1.5 · semibold", uso: "Título de tarjeta" },
  { estilo: "body", spec: "16 · 1.5 · regular", uso: "Texto común" },
  { estilo: "body-sm", spec: "14 · 1.43 · regular", uso: "Ayudas, filas, avisos" },
  { estilo: "caption", spec: "12 · 1.33 · regular", uso: "Fechas, notas al pie, badges" },
  { estilo: "label", spec: "14 · 1.43 · semibold", uso: "Labels, botones, pestañas" },
  { estilo: "overline", spec: "12 · 1.33 · semibold · +2.5% · mayúsculas", uso: "Rótulos de grupo" },
];

export function MuestrasDeTexto() {
  return (
    <ul className="flex flex-col divide-y divide-secondary">
      {TEXT_STYLES.map((t) => (
        <li key={t.estilo} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:gap-6">
          <span className="sm:w-56 sm:shrink-0">
            <Texto estilo="label" tono="primary">
              text-{t.estilo}
            </Texto>
            <Texto estilo="caption" tono="secondary">
              {t.spec}
            </Texto>
          </span>
          <Texto estilo={t.estilo} tono="primary">
            {t.uso}
          </Texto>
        </li>
      ))}
    </ul>
  );
}

const RADIOS = [
  { token: "radius-option", clase: "rounded-option", uso: "Opciones de menú y listas" },
  { token: "radius-control", clase: "rounded-control", uso: "Campos, filas, avisos" },
  { token: "radius-card", clase: "rounded-card", uso: "Tarjetas y diálogos" },
];

export function MuestrasDeRadio() {
  return (
    <ul className="grid gap-3 sm:grid-cols-3">
      {RADIOS.map((r) => (
        <li key={r.token} className="flex items-center gap-3">
          <span aria-hidden className={unir("size-14 shrink-0 border-2 border-primary", r.clase)} />
          <span>
            <Texto estilo="body-sm" peso="semibold" tono="primary">
              {r.token}
            </Texto>
            <Texto estilo="caption" tono="secondary">
              {r.uso}
            </Texto>
          </span>
        </li>
      ))}
    </ul>
  );
}
