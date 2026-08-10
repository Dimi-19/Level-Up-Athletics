-- Level Up Athletics — migration 002: personal athlete app (profile fields, goals, journal).
-- Run this in the SQL Editor of a project that already has schema.sql applied.
-- Safe to run more than once.

alter table public.profiles add column if not exists sport text;
alter table public.profiles add column if not exists position text;
alter table public.profiles add column if not exists favorite_player text;
alter table public.profiles add column if not exists favorite_team text;
alter table public.profiles add column if not exists shoe_rotation text[] not null default '{}';
alter table public.profiles add column if not exists profile_visibility text not null default 'private' check (profile_visibility in ('public', 'private'));
alter table public.profiles add column if not exists units_weight text not null default 'lb' check (units_weight in ('kg', 'lb'));
alter table public.profiles add column if not exists units_distance text not null default 'mi' check (units_distance in ('km', 'mi'));
alter table public.profiles add column if not exists time_format text not null default '12h' check (time_format in ('12h', '24h'));
alter table public.profiles add column if not exists notif_session_reminders boolean not null default false;
alter table public.profiles add column if not exists notif_badge_alerts boolean not null default false;
alter table public.profiles add column if not exists notif_missed_session boolean not null default false;
alter table public.profiles add column if not exists whoop_sync_enabled boolean not null default false;
alter table public.profiles add column if not exists whoop_burn_override boolean not null default false;
alter table public.profiles add column if not exists dietary_restriction text;
alter table public.profiles add column if not exists nutrition_calories integer;
alter table public.profiles add column if not exists nutrition_protein_g integer;
alter table public.profiles add column if not exists nutrition_carbs_g integer;
alter table public.profiles add column if not exists nutrition_fat_g integer;
alter table public.profiles add column if not exists nutrition_notes text;

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  is_completed boolean not null default false,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  entry_date date not null default current_date,
  readiness text check (readiness in ('low', 'medium', 'high')),
  content text,
  good_habits text,
  bad_habits text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, entry_date)
);

alter table public.goals enable row level security;
alter table public.journal_entries enable row level security;

drop policy if exists "users can view their own goals" on public.goals;
create policy "users can view their own goals"
  on public.goals for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "users can create their own goals" on public.goals;
create policy "users can create their own goals"
  on public.goals for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "users can update their own goals" on public.goals;
create policy "users can update their own goals"
  on public.goals for update
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "users can delete their own goals" on public.goals;
create policy "users can delete their own goals"
  on public.goals for delete
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "users can view their own journal entries" on public.journal_entries;
create policy "users can view their own journal entries"
  on public.journal_entries for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "users can create their own journal entries" on public.journal_entries;
create policy "users can create their own journal entries"
  on public.journal_entries for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "users can update their own journal entries" on public.journal_entries;
create policy "users can update their own journal entries"
  on public.journal_entries for update
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "users can delete their own journal entries" on public.journal_entries;
create policy "users can delete their own journal entries"
  on public.journal_entries for delete
  to authenticated
  using (user_id = auth.uid());
