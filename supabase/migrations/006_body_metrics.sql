-- Level Up Athletics — migration 006: body weight & body fat tracking.
-- Run this in the SQL Editor after 005_onboarding_v2.sql has been applied.
-- Safe to run more than once.

create table if not exists public.body_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  recorded_at date not null default current_date,
  weight_kg numeric,
  body_fat_pct numeric,
  created_at timestamptz not null default now(),
  unique (user_id, recorded_at)
);

alter table public.body_metrics enable row level security;

drop policy if exists "users can view their own body metrics" on public.body_metrics;
create policy "users can view their own body metrics"
  on public.body_metrics for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "users can log their own body metrics" on public.body_metrics;
create policy "users can log their own body metrics"
  on public.body_metrics for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "users can update their own body metrics" on public.body_metrics;
create policy "users can update their own body metrics"
  on public.body_metrics for update
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "users can delete their own body metrics" on public.body_metrics;
create policy "users can delete their own body metrics"
  on public.body_metrics for delete
  to authenticated
  using (user_id = auth.uid());
