-- Level Up Athletics — migration 012: personal Schedule (distinct from team events).
-- Run this in the SQL Editor after 011_film_study.sql has been applied.
-- Safe to run more than once.

create table if not exists public.scheduled_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  scheduled_date date not null,
  session_type text not null check (session_type in ('weight_room', 'run', 'skill', 'game', 'film_study', 'rest')),
  title text,
  notes text,
  is_completed boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.scheduled_sessions enable row level security;

drop policy if exists "users can view their own scheduled sessions" on public.scheduled_sessions;
create policy "users can view their own scheduled sessions"
  on public.scheduled_sessions for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "users can create their own scheduled sessions" on public.scheduled_sessions;
create policy "users can create their own scheduled sessions"
  on public.scheduled_sessions for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "users can update their own scheduled sessions" on public.scheduled_sessions;
create policy "users can update their own scheduled sessions"
  on public.scheduled_sessions for update
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "users can delete their own scheduled sessions" on public.scheduled_sessions;
create policy "users can delete their own scheduled sessions"
  on public.scheduled_sessions for delete
  to authenticated
  using (user_id = auth.uid());
