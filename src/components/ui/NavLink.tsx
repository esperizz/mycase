"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** "/" solo se marca activo en el inicio; el resto, también en sus subrutas (salvo el alta). */
export function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const ruta = usePathname();
  const activo = href === "/" ? ruta === "/" : ruta.startsWith(href) && ruta !== "/casos/nuevo";
  return (
    <Link
      href={href}
      aria-current={activo ? "page" : undefined}
      className={`rounded-full px-2 py-2 text-sm font-semibold transition-colors min-[360px]:px-2.5 sm:px-4 ${
        activo ? "bg-acento-suave text-acento-tinta" : "text-tenue hover:text-tinta"
      }`}
    >
      {children}
    </Link>
  );
}
