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
      className={`rounded-lg px-2.5 py-2 text-sm sm:px-3 font-semibold transition-colors ${
        activo ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:text-gray-900"
      }`}
    >
      {children}
    </Link>
  );
}
