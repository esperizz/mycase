import Link from "next/link";
import { useId } from "react";
import { Subtitulo, Texto, unir } from "./Texto";

/**
 * Tarjeta: cada sección de una pantalla. Con `titulo` arma el encabezado (título, ayuda y una
 * acción a la derecha). `destacada` es para la que se está usando ahora (un formulario abierto).
 */
export function Tarjeta({
  id,
  ref,
  titulo,
  ayuda,
  accion,
  destacada = false,
  children,
}: {
  /** Ancla para llegar desde otra parte de la pantalla. */
  id?: string;
  ref?: React.Ref<HTMLElement>;
  titulo?: string;
  ayuda?: React.ReactNode;
  accion?: React.ReactNode;
  destacada?: boolean;
  children?: React.ReactNode;
}) {
  const idTitulo = useId();
  return (
    <section
      id={id}
      ref={ref}
      aria-labelledby={titulo ? idTitulo : undefined}
      className={unir(
        "flex scroll-mt-4 flex-col gap-4 rounded-card border bg-surface-primary p-5",
        destacada ? "border-primary" : "border-secondary",
      )}
    >
      {(titulo || accion) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {titulo && <Subtitulo id={idTitulo}>{titulo}</Subtitulo>}
            {ayuda && (
              <Texto estilo="body-sm" tono="secondary">
                {ayuda}
              </Texto>
            )}
          </div>
          {accion}
        </div>
      )}
      {children}
    </section>
  );
}

/** Tarjeta entera que lleva a otra pantalla (una fila de la lista de casos). */
export function TarjetaEnlace({
  href,
  apagada = false,
  className,
  children,
}: {
  href: string;
  /** Para lo que ya no está activo (un caso cerrado). */
  apagada?: boolean;
  /** Solo para acomodar el contenido (flex, gap). */
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={unir(
        "rounded-card border border-secondary p-4 transition-colors hover:border-secondary-hover",
        apagada ? "bg-surface-secondary" : "bg-surface-primary",
        className,
      )}
    >
      {children}
    </Link>
  );
}

export type TonoRecuadro = "neutral" | "highlighted" | "info" | "success" | "warning" | "danger";

const TONOS_RECUADRO: Record<TonoRecuadro, string> = {
  neutral: "bg-surface-secondary",
  highlighted: "border-2 border-primary",
  info: "bg-surface-info text-info",
  success: "bg-surface-success text-success",
  warning: "bg-surface-warning text-warning",
  danger: "bg-surface-danger text-danger",
};

/**
 * Bloque dentro de una tarjeta: un ítem, el paso actual, un mensaje con su color. El tono también
 * pone el color del texto, que los hijos heredan.
 */
export function Recuadro({
  as: Etiqueta = "div",
  tono = "neutral",
  centrado = false,
  className,
  children,
  ...resto
}: {
  as?: "div" | "li" | "section";
  tono?: TonoRecuadro;
  /** Para un mensaje solo, centrado y con más aire (una lista vacía). */
  centrado?: boolean;
  /** Solo para acomodar el contenido (flex, gap). */
  className?: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <Etiqueta
      className={unir("rounded-control", centrado ? "px-4 py-6 text-center" : "p-4", TONOS_RECUADRO[tono], className)}
      {...resto}
    >
      {children}
    </Etiqueta>
  );
}

/** Mensaje corto con su color: advertencia, error, confirmación o sugerencia. */
export function Aviso({
  tono,
  className,
  children,
  ...resto
}: {
  tono: Exclude<TonoRecuadro, "neutral" | "highlighted">;
  /** Solo para acomodar el contenido (flex, gap). */
  className?: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={unir("rounded-control px-4 py-3 text-body-sm", TONOS_RECUADRO[tono], className)} {...resto}>
      {children}
    </div>
  );
}

/** Mensaje de que no hay nada: con `titulo` ocupa el lugar de una pantalla vacía; sin él, de una lista. */
export function Vacio({
  titulo,
  descripcion,
  children,
}: {
  titulo?: string;
  descripcion: React.ReactNode;
  /** Acciones para empezar. */
  children?: React.ReactNode;
}) {
  if (!titulo) {
    return (
      <p className="rounded-card border border-dashed border-secondary px-4 py-8 text-center text-body-sm text-secondary">
        {descripcion}
      </p>
    );
  }
  return (
    <div className="flex flex-col items-center gap-4 rounded-card border border-dashed border-secondary px-4 py-16 text-center">
      <Texto estilo="h2" tono="primary">
        {titulo}
      </Texto>
      <Texto estilo="body-sm" tono="secondary" className="max-w-sm">
        {descripcion}
      </Texto>
      {children}
    </div>
  );
}

/** Lista con una línea entre cada ítem. */
export function ListaDividida({
  as: Etiqueta = "ul",
  children,
}: {
  as?: "ul" | "ol";
  children: React.ReactNode;
}) {
  return <Etiqueta className="flex flex-col divide-y divide-secondary">{children}</Etiqueta>;
}

/** Aviso fijo abajo de la pantalla, para un error que no depende de dónde se esté. */
export function AvisoFlotante({ children, onCerrar }: { children: React.ReactNode; onCerrar: () => void }) {
  return (
    <div
      role="alert"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-md items-center justify-between gap-3 rounded-control bg-fill-danger px-4 py-3 text-body-sm text-on-fill shadow-popover"
    >
      <span>{children}</span>
      <button type="button" className="font-semibold underline" onClick={onCerrar}>
        Cerrar
      </button>
    </div>
  );
}
