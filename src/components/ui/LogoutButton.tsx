"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/** En celular es solo un ícono, para dejarle lugar a la navegación; desde sm muestra el texto. */
export function LogoutButton() {
  const router = useRouter();

  const salir = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={salir}
      aria-label="Salir"
      title="Salir"
      className="inline-flex size-10 shrink-0 items-center justify-center rounded-full text-tenue transition-colors hover:bg-fondo hover:text-tinta sm:h-10 sm:w-auto sm:border sm:border-linea sm:bg-white sm:px-5 sm:text-sm sm:font-semibold sm:text-tinta sm:hover:border-tenue"
    >
      <svg
        className="size-5 sm:hidden"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <path d="m16 17 5-5-5-5" />
        <path d="M21 12H9" />
      </svg>
      <span className="hidden sm:inline">Salir</span>
    </button>
  );
}
