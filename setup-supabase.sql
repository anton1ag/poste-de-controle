-- POSTE DE CONTRÔLE — schéma Supabase
-- À coller tel quel dans : Supabase → SQL Editor → New query → Run

create table public.kv (
  user_id    uuid not null default auth.uid(),
  k          text not null,
  v          jsonb,
  at         bigint not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, k)
);

alter table public.kv enable row level security;

create policy "chacun ses lignes"
  on public.kv
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
