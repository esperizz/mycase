# MyCase

App para abogados laboralistas. Gestión de casos: alta, estado del caso (Consulta →
Intimación → Mediación → Demanda → Cerrado) y vencimientos.

## Stack

Next.js + TypeScript + Tailwind CSS v4. Login y base de datos con [Supabase](https://supabase.com)
(Postgres + autenticación por magic link).

## Configurar Supabase (una sola vez)

1. Creá un proyecto gratis en [supabase.com](https://supabase.com).
2. En **Settings → API**, copiá el **Project URL** y la **anon public key**.
3. Agregalos como variables de entorno (`NEXT_PUBLIC_SUPABASE_URL` y
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`) — ver `.env.local.example`. **Nunca los commitees.**
4. En **SQL Editor**, pegá y ejecutá el contenido de [`supabase/schema.sql`](./supabase/schema.sql)
   para crear las tablas `casos` y `vencimientos` con Row Level Security (cada abogado solo ve
   sus propios casos).
5. El login es por **magic link**: el abogado pone su email, le llega un link, entra. No hay
   contraseñas que gestionar. Supabase manda el email automáticamente (plan gratis incluido,
   con límite de envíos).

## Desarrollo

```bash
cp .env.local.example .env.local   # y completar con tus valores reales
npm install
npm run dev
```
