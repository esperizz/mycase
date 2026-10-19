import Link from "next/link";
import { ButtonLink } from "./Button";
import { LogoutButton } from "./LogoutButton";
import { NavLink } from "./NavLink";

export function Header() {
  return (
    // Barra flotante: una píldora blanca sobre el fondo gris, separada del borde.
    <header className="px-2 pt-3 sm:px-4 sm:pt-4">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-1 rounded-full border border-linea bg-white pl-4 pr-1.5 sm:h-16 sm:gap-4 sm:pl-6 sm:pr-2">
        <div className="flex min-w-0 items-center gap-2 sm:gap-6">
          <Link href="/" className="text-base font-bold tracking-tighter text-tinta min-[360px]:text-lg">
            MyCase
          </Link>
          <nav className="flex items-center gap-0.5 sm:gap-1">
            <NavLink href="/">Panel</NavLink>
            <NavLink href="/casos">Casos</NavLink>
          </nav>
        </div>
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <ButtonLink href="/casos/nuevo" className="px-3.5 sm:px-5">
            {/* En celulares muy angostos no entra el texto: queda solo "+". */}
            <span className="min-[360px]:hidden">
              <span aria-hidden>+</span>
              <span className="sr-only">Nuevo caso</span>
            </span>
            <span className="hidden min-[360px]:inline sm:hidden">+ Nuevo</span>
            <span className="hidden sm:inline">Nuevo caso</span>
          </ButtonLink>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
