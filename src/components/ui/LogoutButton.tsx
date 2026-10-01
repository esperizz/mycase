"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "./Button";

export function LogoutButton() {
  const router = useRouter();

  const salir = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <Button variante="secondary" onClick={salir}>
      Salir
    </Button>
  );
}
