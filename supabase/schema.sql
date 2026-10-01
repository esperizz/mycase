-- Ejecutar en el SQL Editor del proyecto de Supabase (una sola vez).

create table if not exists public.casos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
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

alter table public.casos enable row level security;

create policy "seleccionar_casos_propios" on public.casos
  for select using (auth.uid() = user_id);

create policy "crear_casos_propios" on public.casos
  for insert with check (auth.uid() = user_id);

create policy "actualizar_casos_propios" on public.casos
  for update using (auth.uid() = user_id);

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

create policy "seleccionar_vencimientos_de_casos_propios" on public.vencimientos
  for select using (
    exists (select 1 from public.casos where casos.id = vencimientos.caso_id and casos.user_id = auth.uid())
  );

create policy "crear_vencimientos_en_casos_propios" on public.vencimientos
  for insert with check (
    exists (select 1 from public.casos where casos.id = vencimientos.caso_id and casos.user_id = auth.uid())
  );

create policy "actualizar_vencimientos_de_casos_propios" on public.vencimientos
  for update using (
    exists (select 1 from public.casos where casos.id = vencimientos.caso_id and casos.user_id = auth.uid())
  );

create policy "borrar_vencimientos_de_casos_propios" on public.vencimientos
  for delete using (
    exists (select 1 from public.casos where casos.id = vencimientos.caso_id and casos.user_id = auth.uid())
  );
