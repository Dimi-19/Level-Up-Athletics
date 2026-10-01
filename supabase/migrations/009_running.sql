-- Level Up Athletics — migration 009: Running (manual run log + PRs).
-- Run this in the SQL Editor after 008_nutrition.sql has been applied.
-- Safe to run more than once.

create table if not exists public.runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  run_date date not null default current_date,
  distance_km numeric not null,
  duration_seconds integer not null,
  rpe integer check (rpe is null or (rpe between 1 and 10)),
  shoe text,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.runs enable row level security;

drop policy if exists "users can view their own runs" on public.runs;
create policy "users can view their own runs"
  on public.runs for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "users can create their own runs" on public.runs;
create policy "users can create their own runs"
  on public.runs for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "users can delete their own runs" on public.runs;
create policy "users can delete their own runs"
  on public.runs for delete
  to authenticated
  using (user_id = auth.uid());
