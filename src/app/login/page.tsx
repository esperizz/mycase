"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setEnviando(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setEnviando(false);
    if (error) setError(error.message);
    else setEnviado(true);
  };

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-16">
      <h1 className="text-2xl font-bold tracking-tight text-gray-900">MyCase</h1>
      {enviado ? (
        <div className="flex max-w-sm flex-col gap-2 text-center">
          <p className="font-semibold text-gray-900">Revisá tu email</p>
          <p className="text-sm text-gray-500">
            Te mandamos un link a <strong>{email}</strong> para entrar. Si no lo ves, revisá spam.
          </p>
        </div>
      ) : (
        <form onSubmit={enviar} className="flex w-full max-w-sm flex-col gap-4">
          <TextField
            label="Tu email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {error && (
            <p role="alert" className="text-sm font-medium text-red-600">
              {error}
            </p>
          )}
          <Button type="submit" disabled={enviando}>
            {enviando ? "Enviando..." : "Enviarme el link para entrar"}
          </Button>
        </form>
      )}
    </main>
  );
}
