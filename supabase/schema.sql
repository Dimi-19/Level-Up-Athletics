-- Level Up Athletics — database schema and row-level security policies.
-- Run this once against a fresh Supabase project (SQL Editor -> New query -> paste -> Run).

-- ============================================================
-- Extensions
-- ============================================================
create extension if not exists "pgcrypto";

-- ============================================================
-- Tables
-- ============================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  created_at timestamptz not null default now(),
  -- Identity (Profile tab)
  sport text,
  position text,
  favorite_player text,
  favorite_team text,
  shoe_rotation text[] not null default '{}',
  -- Preferences (Settings tab)
  profile_visibility text not null default 'private' check (profile_visibility in ('public', 'private')),
  units_weight text not null default 'lb' check (units_weight in ('kg', 'lb')),
  units_distance text not null default 'mi' check (units_distance in ('km', 'mi')),
  time_format text not null default '12h' check (time_format in ('12h', '24h')),
  notif_session_reminders boolean not null default false,
  notif_badge_alerts boolean not null default false,
  notif_missed_session boolean not null default false,
  whoop_sync_enabled boolean not null default false,
  whoop_burn_override boolean not null default false,
  dietary_restriction text,
  nutrition_calories integer,
  nutrition_protein_g integer,
  nutrition_carbs_g integer,
  nutrition_fat_g integer,
  nutrition_notes text,
  -- Onboarding questionnaire
  age integer,
  height_cm numeric,
  weight_kg numeric,
  biological_sex text check (biological_sex in ('male', 'female')),
  primary_goal text check (primary_goal in ('cut', 'maintain', 'bulk')),
  workouts_per_week integer,
  onboarding_completed boolean not null default false
);

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sport text,
  invite_code text not null unique default upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6)),
  created_by uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default 'athlete' check (role in ('coach', 'captain', 'athlete')),
  created_at timestamptz not null default now(),
  unique (team_id, user_id)
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  title text not null,
  type text not null default 'practice' check (type in ('practice', 'game', 'meeting', 'other')),
  location text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  notes text,
  created_by uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.event_rsvps (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  status text not null check (status in ('yes', 'no', 'maybe')),
  created_at timestamptz not null default now(),
  unique (event_id, user_id)
);

create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  title text not null,
  description text,
  created_by uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

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

create table if not exists public.workout_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  workout_id uuid references public.workouts (id) on delete set null,
  team_id uuid not null references public.teams (id) on delete cascade,
  title text not null,
  notes text,
  duration_minutes integer,
  performed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- ============================================================
-- Helper functions (security definer to avoid RLS recursion)
-- ============================================================

create or replace function public.is_team_member(p_team_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.team_members
    where team_id = p_team_id and user_id = auth.uid()
  );
$$;

create or replace function public.is_team_leader(p_team_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.team_members
    where team_id = p_team_id and user_id = auth.uid() and role in ('coach', 'captain')
  );
$$;

-- Called by a signed-in user to join a team via its invite code.
create or replace function public.join_team_by_code(p_invite_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_team_id uuid;
begin
  select id into v_team_id from public.teams where invite_code = upper(p_invite_code);

  if v_team_id is null then
    raise exception 'Invalid invite code';
  end if;

  insert into public.team_members (team_id, user_id, role)
  values (v_team_id, auth.uid(), 'athlete')
  on conflict (team_id, user_id) do nothing;

  return v_team_id;
end;
$$;

-- Automatically add the creator of a team as its first coach.
create or replace function public.handle_new_team()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.team_members (team_id, user_id, role)
  values (new.id, new.created_by, 'coach');
  return new;
end;
$$;

drop trigger if exists on_team_created on public.teams;
create trigger on_team_created
  after insert on public.teams
  for each row execute function public.handle_new_team();

-- Automatically create a profile row when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.profiles enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.events enable row level security;
alter table public.event_rsvps enable row level security;
alter table public.workouts enable row level security;
alter table public.workout_logs enable row level security;
alter table public.goals enable row level security;
alter table public.journal_entries enable row level security;

-- profiles: visible to any signed-in user (names only), editable by owner
create policy "profiles are viewable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

create policy "users can update their own profile"
  on public.profiles for update
  to authenticated
  using (id = auth.uid());

create policy "users can insert their own profile"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid());

-- teams: visible to members, creatable by any signed-in user
create policy "team members can view their teams"
  on public.teams for select
  to authenticated
  using (public.is_team_member(id));

create policy "authenticated users can create teams"
  on public.teams for insert
  to authenticated
  with check (created_by = auth.uid());

create policy "team leaders can update their team"
  on public.teams for update
  to authenticated
  using (public.is_team_leader(id));

-- team_members: visible to fellow members; membership changes go through
-- join_team_by_code() / handle_new_team(), both security definer.
create policy "team members can view team roster"
  on public.team_members for select
  to authenticated
  using (public.is_team_member(team_id));

create policy "team leaders can update member roles"
  on public.team_members for update
  to authenticated
  using (public.is_team_leader(team_id));

create policy "team leaders can remove members"
  on public.team_members for delete
  to authenticated
  using (public.is_team_leader(team_id));

-- events: visible to team members, manageable by members / leaders
create policy "team members can view events"
  on public.events for select
  to authenticated
  using (public.is_team_member(team_id));

create policy "team members can create events"
  on public.events for insert
  to authenticated
  with check (public.is_team_member(team_id) and created_by = auth.uid());

create policy "creators and leaders can update events"
  on public.events for update
  to authenticated
  using (created_by = auth.uid() or public.is_team_leader(team_id));

create policy "creators and leaders can delete events"
  on public.events for delete
  to authenticated
  using (created_by = auth.uid() or public.is_team_leader(team_id));

-- event_rsvps: visible to team members, editable by the RSVP's owner
create policy "team members can view rsvps"
  on public.event_rsvps for select
  to authenticated
  using (
    exists (
      select 1 from public.events
      where events.id = event_rsvps.event_id
      and public.is_team_member(events.team_id)
    )
  );

create policy "users can upsert their own rsvp"
  on public.event_rsvps for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "users can update their own rsvp"
  on public.event_rsvps for update
  to authenticated
  using (user_id = auth.uid());

create policy "users can delete their own rsvp"
  on public.event_rsvps for delete
  to authenticated
  using (user_id = auth.uid());

-- workouts: visible to team members, manageable by members / leaders
create policy "team members can view workouts"
  on public.workouts for select
  to authenticated
  using (public.is_team_member(team_id));

create policy "team members can create workouts"
  on public.workouts for insert
  to authenticated
  with check (public.is_team_member(team_id) and created_by = auth.uid());

create policy "creators and leaders can update workouts"
  on public.workouts for update
  to authenticated
  using (created_by = auth.uid() or public.is_team_leader(team_id));

create policy "creators and leaders can delete workouts"
  on public.workouts for delete
  to authenticated
  using (created_by = auth.uid() or public.is_team_leader(team_id));

-- workout_logs: owners see their own logs, leaders see the whole team's logs
create policy "owners and leaders can view workout logs"
  on public.workout_logs for select
  to authenticated
  using (user_id = auth.uid() or public.is_team_leader(team_id));

create policy "users can log their own workouts"
  on public.workout_logs for insert
  to authenticated
  with check (user_id = auth.uid() and public.is_team_member(team_id));

create policy "users can update their own workout logs"
  on public.workout_logs for update
  to authenticated
  using (user_id = auth.uid());

create policy "users can delete their own workout logs"
  on public.workout_logs for delete
  to authenticated
  using (user_id = auth.uid());

-- goals: fully private to the owner
create policy "users can view their own goals"
  on public.goals for select
  to authenticated
  using (user_id = auth.uid());

create policy "users can create their own goals"
  on public.goals for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "users can update their own goals"
  on public.goals for update
  to authenticated
  using (user_id = auth.uid());

create policy "users can delete their own goals"
  on public.goals for delete
  to authenticated
  using (user_id = auth.uid());

-- journal_entries: fully private to the owner
create policy "users can view their own journal entries"
  on public.journal_entries for select
  to authenticated
  using (user_id = auth.uid());

create policy "users can create their own journal entries"
  on public.journal_entries for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "users can update their own journal entries"
  on public.journal_entries for update
  to authenticated
  using (user_id = auth.uid());

create policy "users can delete their own journal entries"
  on public.journal_entries for delete
  to authenticated
  using (user_id = auth.uid());
