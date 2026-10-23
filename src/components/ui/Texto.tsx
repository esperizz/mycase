/**
 * Tipografía de la app, sobre los text styles de `globals.css` (h1, h2, h3, body, body-sm,
 * caption, label, overline). Las pantallas no eligen tamaños ni colores sueltos: usan estos
 * componentes, que solo aceptan los valores del sistema.
 */

export type EstiloTexto = "h1" | "h2" | "h3" | "body" | "body-sm" | "caption" | "label" | "overline";
export type TonoTexto = "primary" | "secondary" | "tertiary" | "danger" | "warning" | "success";
type Peso = "regular" | "medium" | "semibold";

export const ESTILOS: Record<EstiloTexto, string> = {
  h1: "text-h1",
  h2: "text-h2",
  h3: "text-h3",
  body: "text-body",
  "body-sm": "text-body-sm",
  caption: "text-caption",
  label: "text-label",
  overline: "text-overline uppercase",
};

const TONOS: Record<TonoTexto, string> = {
  primary: "text-primary",
  secondary: "text-secondary",
  tertiary: "text-tertiary",
  danger: "text-danger",
  warning: "text-warning",
  success: "text-success",
};

const PESOS: Record<Peso, string> = {
  regular: "font-regular",
  medium: "font-medium",
  semibold: "font-semibold",
};

export function unir(...clases: (string | false | null | undefined)[]) {
  return clases.filter(Boolean).join(" ");
}

/**
 * Texto con un text style. Lo que no se indica se hereda del contenedor (por ejemplo, el color de
 * un aviso). `peso` es para destacar una parte dentro del estilo. `className` es solo para
 * ubicarlo (márgenes, ancho, alineación), no para darle estilo.
 */
export function Texto({
  as: Etiqueta = "p",
  estilo,
  tono,
  peso,
  tachado,
  preservarSaltos,
  numerico,
  className,
  ...resto
}: {
  as?: "p" | "span" | "div";
  estilo?: EstiloTexto;
  tono?: TonoTexto;
  peso?: Peso;
  tachado?: boolean;
  /** Respeta los saltos de línea del texto (notas, vista previa de cartas). */
  preservarSaltos?: boolean;
  /** Números en columnas parejas, para conteos alineados. */
  numerico?: boolean;
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <Etiqueta
      className={unir(
        estilo && ESTILOS[estilo],
        tono && TONOS[tono],
        peso && PESOS[peso],
        tachado && "line-through",
        preservarSaltos && "whitespace-pre-wrap",
        numerico && "tabular-nums",
        className,
      )}
      {...resto}
    />
  );
}

/** Título principal de la pantalla: `<h1>` con el estilo h1. */
export function Titulo({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h1 className={unir("text-h1 text-primary", className)}>{children}</h1>;
}

/** Segunda parte del título, en el tono apagado: "Marta Ríos *contra Acme*". */
export function TituloTenue({ children }: { children: React.ReactNode }) {
  return <span className="text-tertiary">{children}</span>;
}

/**
 * Título de una sección o tarjeta, con el estilo h3. La etiqueta (`h2` o `h3`) la da la
 * estructura de la página, no el tamaño: dentro de una pantalla con su `h1`, cada tarjeta es `h2`.
 */
export function Subtitulo({
  as: Etiqueta = "h2",
  id,
  children,
}: {
  as?: "h2" | "h3";
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <Etiqueta id={id} className="text-h3 text-primary">
      {children}
    </Etiqueta>
  );
}

/** Rótulo chico en mayúsculas (overline), sobre un dato o un grupo. */
export function Rotulo({
  as: Etiqueta = "p",
  children,
}: {
  as?: "p" | "h3";
  children: React.ReactNode;
}) {
  return <Etiqueta className="text-overline uppercase text-secondary">{children}</Etiqueta>;
}
