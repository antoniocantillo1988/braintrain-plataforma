-- ============================================
-- ESQUEMA: Sistema de citas para Orienta
-- ============================================

-- Tabla de huecos disponibles que Antonio define
create table public.disponibilidad (
  id uuid primary key default gen_random_uuid(),
  fecha date not null,
  hora_inicio time not null,
  hora_fin time not null,
  ocupado boolean default false,
  created_at timestamptz default now()
);

-- Tabla de citas solicitadas/confirmadas
create table public.citas (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid references auth.users(id) not null,
  disponibilidad_id uuid references public.disponibilidad(id) not null,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'confirmada', 'cancelada', 'completada')),
  enlace_videollamada text,
  motivo_consulta text,
  notas_admin text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Cuando se crea una cita, marcamos el hueco como ocupado
create or replace function public.marcar_hueco_ocupado()
returns trigger as $$
begin
  update public.disponibilidad
  set ocupado = true
  where id = new.disponibilidad_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_marcar_ocupado
after insert on public.citas
for each row execute function public.marcar_hueco_ocupado();

-- Si se cancela una cita, liberamos el hueco
create or replace function public.liberar_hueco_si_cancelada()
returns trigger as $$
begin
  if new.estado = 'cancelada' and old.estado != 'cancelada' then
    update public.disponibilidad
    set ocupado = false
    where id = new.disponibilidad_id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_liberar_hueco
after update on public.citas
for each row execute function public.liberar_hueco_si_cancelada();

-- RLS: cada usuario solo ve sus propias citas, Antonio (admin) las ve todas
alter table public.citas enable row level security;
alter table public.disponibilidad enable row level security;

create policy "usuarios_ven_sus_citas" on public.citas
  for select using (auth.uid() = usuario_id);

create policy "usuarios_crean_sus_citas" on public.citas
  for insert with check (auth.uid() = usuario_id);

create policy "todos_ven_disponibilidad" on public.disponibilidad
  for select using (true);

-- NOTA: para que Antonio (admin) pueda ver/editar todas las citas,
-- crea un campo "rol" en la tabla de perfiles y añade una policy adicional
-- que compruebe rol = 'admin'. Te lo dejo preparado abajo:

-- alter table public.citas
--   add policy "admin_ve_todas" on public.citas
--   for all using (
--     exists (select 1 from public.perfiles where id = auth.uid() and rol = 'admin')
--   );
