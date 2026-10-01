-- Level Up Athletics — migration 011: Film Study (sessions + timestamped clips).
-- Run this in the SQL Editor after 010_training.sql has been applied.
-- Safe to run more than once.

create table if not exists public.film_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  video_url text not null,
  opponent text,
  session_date date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists public.film_clips (
  id uuid primary key default gen_random_uuid(),
  film_session_id uuid not null references public.film_sessions (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  timestamp_seconds integer not null default 0,
  note text not null,
  tag text,
  created_at timestamptz not null default now()
);

alter table public.film_sessions enable row level security;
alter table public.film_clips enable row level security;

drop policy if exists "users can view their own film sessions" on public.film_sessions;
create policy "users can view their own film sessions"
  on public.film_sessions for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "users can create their own film sessions" on public.film_sessions;
create policy "users can create their own film sessions"
  on public.film_sessions for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "users can delete their own film sessions" on public.film_sessions;
create policy "users can delete their own film sessions"
  on public.film_sessions for delete
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "users can view their own film clips" on public.film_clips;
create policy "users can view their own film clips"
  on public.film_clips for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "users can create their own film clips" on public.film_clips;
create policy "users can create their own film clips"
  on public.film_clips for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "users can delete their own film clips" on public.film_clips;
create policy "users can delete their own film clips"
  on public.film_clips for delete
  to authenticated
  using (user_id = auth.uid());
