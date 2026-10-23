import Link from "next/link";
import { ESTILOS, unir, type EstiloTexto } from "./Texto";

/** `danger` para lo que borra; `success` para lo que manda al cliente (WhatsApp). */
export type Variante = "primary" | "secondary" | "danger" | "success";

const base =
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full h-10 text-label transition-colors disabled:cursor-not-allowed disabled:border-transparent disabled:bg-fill-disabled disabled:text-disabled";

const variantes: Record<Variante, string> = {
  primary: "bg-fill-primary px-5 text-on-fill hover:bg-fill-primary-hover",
  secondary: "border border-secondary bg-surface-primary px-5 text-primary hover:border-secondary-hover",
  danger: "bg-fill-danger px-5 text-on-fill hover:bg-fill-danger-hover",
  success: "bg-fill-success px-5 text-on-fill hover:bg-fill-success-hover",
};

interface Props {
  variante?: Variante;
  /** Solo para ubicarlo (`self-start`, márgenes) o ajustar su relleno lateral. */
  className?: string;
  /** Agrega la flecha en círculo: para botones que llevan a otra pantalla. */
  flecha?: boolean;
}

function clases({ variante = "primary", className, flecha }: Props) {
  // Con flecha, el padding derecho lo ocupa el círculo.
  return unir(base, variantes[variante], flecha && "pr-1.5", className);
}

/**
 * Flecha en círculo. Se usa sola en filas que llevan a otra pantalla, con `className` para el
 * tamaño; `atras` la da vuelta para los links de volver.
 */
export function Flecha({
  variante = "primary",
  className = "ml-1 size-7",
  atras = false,
}: {
  variante?: Variante;
  className?: string;
  atras?: boolean;
}) {
  return (
    <span
      aria-hidden
      className={unir(
        "flex shrink-0 items-center justify-center rounded-full",
        className,
        variante === "secondary" ? "bg-fill-primary text-on-fill" : "bg-surface-primary text-primary",
      )}
    >
      <svg
        viewBox="0 0 16 16"
        className={unir("size-3.5", atras && "rotate-180")}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export function Button({
  variante,
  className,
  flecha,
  children,
  ...rest
}: Props & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className={clases({ variante, className, flecha })} {...rest}>
      {children}
      {flecha && <Flecha variante={variante} />}
    </button>
  );
}

export function ButtonLink({
  variante,
  className,
  flecha,
  href,
  children,
}: Props & { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className={clases({ variante, className, flecha })}>
      {children}
      {flecha && <Flecha variante={variante} />}
    </Link>
  );
}

/** Link para volver a la pantalla anterior, con la flecha en círculo hacia atrás. */
export function LinkVolver({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex w-fit items-center gap-2 text-body-sm font-medium text-secondary transition-colors hover:text-secondary-hover"
    >
      <Flecha variante="secondary" className="size-6" atras />
      {children}
    </Link>
  );
}

/**
 * Acciones con forma de texto, para lo secundario que no merece un botón.
 * - strong: la acción del lugar ("+ Agregar hora y lugar", "Ver el caso").
 * - subtle: un nombre que lleva a su ficha, dentro de un texto.
 * - quiet: cancelar o cerrar.
 * - danger: borrar algo importante ("Eliminar este caso").
 * - dangerQuiet: borrar algo chico, que solo se pone rojo al pasar por encima.
 */
export type VarianteTexto = "strong" | "subtle" | "quiet" | "danger" | "dangerQuiet";

const variantesTexto: Record<VarianteTexto, string> = {
  strong: "font-semibold text-primary hover:underline",
  subtle: "font-medium text-primary hover:underline",
  quiet: "font-medium text-secondary hover:text-secondary-hover",
  danger: "font-medium text-danger hover:underline",
  dangerQuiet: "text-secondary hover:text-danger hover:underline",
};

interface PropsTexto {
  variante?: VarianteTexto;
  /** Text style; sin él, toma el del texto que lo rodea. */
  estilo?: EstiloTexto;
  /** Subrayado siempre, para que se note como link dentro de un párrafo. */
  subrayado?: boolean;
  /** Solo para ubicarlo (`w-fit`, `truncate`, `flex-1`). */
  className?: string;
}

function clasesTexto({ variante = "strong", estilo, subrayado, className }: PropsTexto) {
  return unir(
    "underline-offset-2 transition-colors",
    variantesTexto[variante],
    subrayado && "underline",
    estilo && ESTILOS[estilo],
    className,
  );
}

export function BotonTexto({
  variante,
  estilo,
  subrayado,
  className,
  ...rest
}: PropsTexto & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type="button" className={clasesTexto({ variante, estilo, subrayado, className })} {...rest} />;
}

export function Enlace({
  href,
  variante,
  estilo,
  subrayado,
  className,
  children,
}: PropsTexto & { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className={clasesTexto({ variante, estilo, subrayado, className })}>
      {children}
    </Link>
  );
}

const fila = "flex items-center gap-3 rounded-control bg-surface-secondary px-3 py-2 text-body-sm";

/**
 * Fila de una lista corta que lleva a algún lado: a la izquierda lo que es, a la derecha la acción
 * con la flecha. Navega a `href` o, con `onClick`, resuelve ahí mismo. `extra` es una acción aparte
 * que queda dentro de la fila pero fuera del link (por ejemplo, "Descartar").
 */
export function FilaEnlace({
  href,
  onClick,
  accion,
  extra,
  children,
}: {
  href?: string;
  onClick?: () => void;
  accion?: React.ReactNode;
  extra?: React.ReactNode;
  children: React.ReactNode;
}) {
  const contenido = (
    <>
      <span className="flex min-w-0 flex-1 flex-wrap items-center gap-2 text-left">{children}</span>
      <span className="flex shrink-0 items-center gap-2 font-semibold text-primary">
        {accion}
        <Flecha variante="secondary" className="size-6" />
      </span>
    </>
  );
  const clasesElemento = extra
    ? "flex min-w-0 flex-1 items-center justify-between gap-3 hover:underline"
    : unir(fila, "w-full transition-colors hover:bg-surface-secondary-hover");
  const elemento = onClick ? (
    <button type="button" onClick={onClick} className={clasesElemento}>
      {contenido}
    </button>
  ) : (
    <Link href={href ?? "#"} className={clasesElemento}>
      {contenido}
    </Link>
  );
  if (!extra) return elemento;
  return (
    <div className={fila}>
      {elemento}
      {extra}
    </div>
  );
}
