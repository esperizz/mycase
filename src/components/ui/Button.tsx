import Link from "next/link";

type Variante = "primary" | "secondary";

const base =
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full h-10 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50";

const variantes: Record<Variante, string> = {
  primary: "bg-tinta px-5 text-white hover:bg-tinta/85",
  secondary: "border border-linea bg-white px-5 text-tinta hover:border-tenue",
};

interface Props {
  variante?: Variante;
  className?: string;
  /** Agrega la flecha en círculo: para botones que llevan a otra pantalla. */
  flecha?: boolean;
}

function clases({ variante = "primary", className, flecha }: Props) {
  // Con flecha, el padding derecho lo ocupa el círculo.
  return [base, variantes[variante], flecha && "pr-1.5", className].filter(Boolean).join(" ");
}

/** Flecha en círculo. Se usa sola en filas que llevan a otra pantalla, con `className` para el tamaño. */
export function Flecha({ variante = "primary", className = "ml-1 size-7" }: { variante?: Variante; className?: string }) {
  return (
    <span
      aria-hidden
      className={`flex shrink-0 items-center justify-center rounded-full ${className} ${
        variante === "primary" ? "bg-white text-tinta" : "bg-tinta text-white"
      }`}
    >
      <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
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
