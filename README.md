# MyCase

App para abogados laboralistas. Todavía en etapa inicial.

## Stack

Next.js + TypeScript + Tailwind CSS v4. Login (magic link) y base de datos con
[Supabase](https://supabase.com).

## Configurar Supabase (una sola vez)

1. Copiar `.env.local.example` a `.env.local` y completar la URL del proyecto y la
   publishable key (Supabase → Project Settings → API Keys).
2. Correr `supabase/schema.sql` en el SQL Editor del proyecto.
3. En Authentication → URL Configuration: Site URL `http://localhost:3000` y agregar
   `http://localhost:3000/auth/callback` a Redirect URLs (más la URL de producción
   cuando haya deploy).

## Desarrollo

```bash
npm install
npm run dev
```
