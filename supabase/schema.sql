-- Ejecutar en el SQL Editor del proyecto de Supabase.
-- Se puede correr más de una vez sin romper nada.

create table if not exists public.casos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  cliente text not null,
  contacto text not null default '',
  empleador text not null,
  tipo_reclamo text not null,
  estado text not null default 'consulta'
    check (estado in ('consulta', 'intimacion', 'mediacion', 'demanda', 'cerrado')),
  fecha_apertura date not null default current_date,
  notas text not null default '',
  created_at timestamptz not null default now()
);

-- Datos de la carta de intimación del caso (null si todavía no se empezó).
alter table public.casos add column if not exists carta jsonb;

alter table public.casos enable row level security;

drop policy if exists "seleccionar_casos_propios" on public.casos;
create policy "seleccionar_casos_propios" on public.casos
  for select using (auth.uid() = user_id);

drop policy if exists "crear_casos_propios" on public.casos;
create policy "crear_casos_propios" on public.casos
  for insert with check (auth.uid() = user_id);

drop policy if exists "actualizar_casos_propios" on public.casos;
create policy "actualizar_casos_propios" on public.casos
  for update using (auth.uid() = user_id);

drop policy if exists "borrar_casos_propios" on public.casos;
create policy "borrar_casos_propios" on public.casos
  for delete using (auth.uid() = user_id);

create table if not exists public.vencimientos (
  id uuid primary key default gen_random_uuid(),
  caso_id uuid not null references public.casos(id) on delete cascade,
  fecha date not null,
  descripcion text not null default '',
  cumplido boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.vencimientos enable row level security;

drop policy if exists "seleccionar_vencimientos_de_casos_propios" on public.vencimientos;
create policy "seleccionar_vencimientos_de_casos_propios" on public.vencimientos
  for select using (
    exists (select 1 from public.casos where casos.id = vencimientos.caso_id and casos.user_id = auth.uid())
  );

drop policy if exists "crear_vencimientos_en_casos_propios" on public.vencimientos;
create policy "crear_vencimientos_en_casos_propios" on public.vencimientos
  for insert with check (
    exists (select 1 from public.casos where casos.id = vencimientos.caso_id and casos.user_id = auth.uid())
  );

drop policy if exists "actualizar_vencimientos_de_casos_propios" on public.vencimientos;
create policy "actualizar_vencimientos_de_casos_propios" on public.vencimientos
  for update using (
    exists (select 1 from public.casos where casos.id = vencimientos.caso_id and casos.user_id = auth.uid())
  );

drop policy if exists "borrar_vencimientos_de_casos_propios" on public.vencimientos;
create policy "borrar_vencimientos_de_casos_propios" on public.vencimientos
  for delete using (
    exists (select 1 from public.casos where casos.id = vencimientos.caso_id and casos.user_id = auth.uid())
  );

-- Hoja de ruta de los casos de ART (pasos cumplidos, avisos al cliente; null si no se usa).
alter table public.casos add column if not exists hoja_ruta jsonb;

-- Plazo (tiene consecuencias si se pasa) o tarea (pendiente interno). Los existentes quedan como plazo.
alter table public.vencimientos add column if not exists tipo text not null default 'plazo'
  check (tipo in ('plazo', 'tarea'));

-- Historial de notas del caso (lista de {id, fecha, texto}). Reemplaza al texto único de "notas".
alter table public.casos add column if not exists notas_historial jsonb not null default '[]'::jsonb;

-- Última modificación de cada caso: la app la compara antes de guardar para no pisar
-- lo que se cambió en otro dispositivo (si cambió, fusiona y reintenta).
alter table public.casos add column if not exists updated_at timestamptz not null default now();

create or replace function public.marcar_updated_at() returns trigger
  language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists casos_updated_at on public.casos;
create trigger casos_updated_at before update on public.casos
  for each row execute function public.marcar_updated_at();
