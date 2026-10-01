import Link from "next/link";
import { ButtonLink } from "./Button";

export function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-bold tracking-tight text-gray-900">
          MyCase
        </Link>
        <ButtonLink href="/casos/nuevo">Nuevo caso</ButtonLink>
      </div>
    </header>
  );
}
