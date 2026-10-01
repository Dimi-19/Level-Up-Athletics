-- Level Up Athletics — migration 013: Verified Athlete Passport (shareable read-only stats page).
-- Run this in the SQL Editor after 012_schedule.sql has been applied.
-- Safe to run more than once.

create table if not exists public.athlete_passports (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  slug text not null unique,
  is_public boolean not null default false,
  snapshot jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.athlete_passports enable row level security;

drop policy if exists "passports are viewable when public or owned" on public.athlete_passports;
create policy "passports are viewable when public or owned"
  on public.athlete_passports for select
  to public
  using (is_public = true or user_id = auth.uid());

drop policy if exists "users can create their own passport" on public.athlete_passports;
create policy "users can create their own passport"
  on public.athlete_passports for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "users can update their own passport" on public.athlete_passports;
create policy "users can update their own passport"
  on public.athlete_passports for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
