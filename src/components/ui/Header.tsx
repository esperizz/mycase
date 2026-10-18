import Link from "next/link";
import { ButtonLink } from "./Button";
import { LogoutButton } from "./LogoutButton";
import { NavLink } from "./NavLink";

export function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-2 px-4 sm:gap-4">
        <div className="flex min-w-0 items-center gap-2 sm:gap-6">
          <Link href="/" className="text-lg font-bold tracking-tight text-gray-900">
            MyCase
          </Link>
          <nav className="flex items-center sm:gap-1">
            <NavLink href="/">Panel</NavLink>
            <NavLink href="/casos">Casos</NavLink>
          </nav>
        </div>
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <ButtonLink href="/casos/nuevo" className="px-3 sm:px-4">
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
