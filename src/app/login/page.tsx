"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { Pagina } from "@/components/ui/Pagina";
import { Texto, Titulo } from "@/components/ui/Texto";
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
    <Pagina ancho="angosto" centrada encabezado={false}>
      <Titulo>MyCase</Titulo>
      {enviado ? (
        <div className="flex max-w-sm flex-col gap-2">
          <Texto peso="semibold" tono="primary">
            Revisá tu email
          </Texto>
          <Texto estilo="body-sm" tono="secondary">
            Te mandamos un link a <strong>{email}</strong> para entrar. Si no lo ves, revisá spam.
          </Texto>
        </div>
      ) : (
        <form onSubmit={enviar} className="flex w-full max-w-sm flex-col gap-4 text-left">
          <TextField
            label="Tu email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {error && (
            <Texto role="alert" estilo="body-sm" peso="medium" tono="danger">
              {error}
            </Texto>
          )}
          <Button type="submit" disabled={enviando}>
            {enviando ? "Enviando..." : "Enviarme el link para entrar"}
          </Button>
        </form>
      )}
    </Pagina>
  );
}
