import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ButtonLink } from "./Button";
import { LogoutButton } from "./LogoutButton";

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-bold tracking-tight text-gray-900">
          MyCase
        </Link>
        <div className="flex items-center gap-3">
          {user && <span className="hidden text-sm text-gray-500 sm:inline">{user.email}</span>}
          <ButtonLink href="/casos/nuevo">Nuevo caso</ButtonLink>
          {user && <LogoutButton />}
        </div>
      </div>
    </header>
  );
}
