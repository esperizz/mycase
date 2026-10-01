import Link from "next/link";

type Variante = "primary" | "secondary";

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg px-4 h-10 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50";

const variantes: Record<Variante, string> = {
  primary: "bg-gray-900 text-white hover:bg-gray-700",
  secondary: "border border-gray-300 bg-white text-gray-900 hover:bg-gray-50",
};

interface Props {
  variante?: Variante;
  className?: string;
}

function clases({ variante = "primary", className }: Props) {
  return [base, variantes[variante], className].filter(Boolean).join(" ");
}

export function Button({
  variante,
  className,
  ...rest
}: Props & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type="button" className={clases({ variante, className })} {...rest} />;
}

export function ButtonLink({
  variante,
  className,
  href,
  children,
}: Props & { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className={clases({ variante, className })}>
      {children}
    </Link>
  );
}
