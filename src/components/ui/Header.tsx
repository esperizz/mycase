import Link from "next/link";
import { ButtonLink } from "./Button";
import { NavLink } from "./NavLink";

export function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-3 sm:gap-6">
          <Link href="/" className="text-lg font-bold tracking-tight text-gray-900">
            MyCase
          </Link>
          <nav className="flex items-center gap-1">
            <NavLink href="/">Panel</NavLink>
            <NavLink href="/casos">Casos</NavLink>
          </nav>
        </div>
        <ButtonLink href="/casos/nuevo">
          <span className="sm:hidden">+ Nuevo</span>
          <span className="hidden sm:inline">Nuevo caso</span>
        </ButtonLink>
      </div>
    </header>
  );
}
