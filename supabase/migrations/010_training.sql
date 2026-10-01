-- Level Up Athletics — migration 010: Training (sport skill library + logging).
-- Run this in the SQL Editor after 009_running.sql has been applied.
-- Safe to run more than once.

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  sport text not null,
  name text not null,
  category text not null check (category in ('reps', 'timed', 'rating', 'binary', 'notes')),
  unit_label text not null default '',
  created_by uuid references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

create unique index if not exists skills_system_unique on public.skills (sport, name) where created_by is null;

create table if not exists public.skill_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  skill_id uuid not null references public.skills (id) on delete cascade,
  logged_date date not null default current_date,
  value numeric,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.skills enable row level security;
alter table public.skill_logs enable row level security;

drop policy if exists "skill library is viewable by authenticated users" on public.skills;
create policy "skill library is viewable by authenticated users"
  on public.skills for select
  to authenticated
  using (true);

drop policy if exists "users can add their own skills" on public.skills;
create policy "users can add their own skills"
  on public.skills for insert
  to authenticated
  with check (created_by = auth.uid());

drop policy if exists "users can delete their own skills" on public.skills;
create policy "users can delete their own skills"
  on public.skills for delete
  to authenticated
  using (created_by = auth.uid());

drop policy if exists "users can view their own skill logs" on public.skill_logs;
create policy "users can view their own skill logs"
  on public.skill_logs for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "users can create their own skill logs" on public.skill_logs;
create policy "users can create their own skill logs"
  on public.skill_logs for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "users can delete their own skill logs" on public.skill_logs;
create policy "users can delete their own skill logs"
  on public.skill_logs for delete
  to authenticated
  using (user_id = auth.uid());

insert into public.skills (sport, name, category, unit_label) values
  ('Basketball', 'Free throws made (out of 10)', 'reps', 'makes'),
  ('Basketball', 'Three-pointers made (out of 10)', 'reps', 'makes'),
  ('Basketball', 'Suicide sprint time', 'timed', 'seconds'),
  ('Basketball', 'Ball handling self-rating', 'rating', '/10'),
  ('Basketball', 'Defensive slide drill passed', 'binary', 'pass/fail'),
  ('Soccer', 'Juggles in a row', 'reps', 'touches'),
  ('Soccer', 'Shots on target (out of 10)', 'reps', 'makes'),
  ('Soccer', '40-yard sprint time', 'timed', 'seconds'),
  ('Soccer', 'First-touch self-rating', 'rating', '/10'),
  ('Soccer', 'Passing accuracy drill passed', 'binary', 'pass/fail'),
  ('Football', '40-yard dash time', 'timed', 'seconds'),
  ('Football', 'Catches made (out of 10)', 'reps', 'makes'),
  ('Football', 'Route-running self-rating', 'rating', '/10'),
  ('Football', 'Footwork drill passed', 'binary', 'pass/fail'),
  ('Baseball', 'Batting practice hits (out of 10)', 'reps', 'hits'),
  ('Baseball', 'Throwing velocity self-rating', 'rating', '/10'),
  ('Baseball', '60-yard dash time', 'timed', 'seconds'),
  ('Baseball', 'Fielding drill passed', 'binary', 'pass/fail'),
  ('Volleyball', 'Serves in (out of 10)', 'reps', 'in'),
  ('Volleyball', 'Approach jump self-rating', 'rating', '/10'),
  ('Volleyball', 'Passing drill passed', 'binary', 'pass/fail'),
  ('Tennis', 'Serves in (out of 10)', 'reps', 'in'),
  ('Tennis', 'Rally consistency self-rating', 'rating', '/10'),
  ('Tennis', 'Baseline footwork drill passed', 'binary', 'pass/fail'),
  ('Track & Field', '100m sprint time', 'timed', 'seconds'),
  ('Track & Field', '400m sprint time', 'timed', 'seconds'),
  ('Track & Field', 'Long jump distance', 'reps', 'ft'),
  ('Swimming', '100m freestyle time', 'timed', 'seconds'),
  ('Swimming', 'Turn technique self-rating', 'rating', '/10'),
  ('Wrestling', 'Takedown drill reps', 'reps', 'reps'),
  ('Wrestling', 'Sprawl drill passed', 'binary', 'pass/fail'),
  ('Hockey', 'Shots on target (out of 10)', 'reps', 'makes'),
  ('Hockey', 'Skating stride self-rating', 'rating', '/10'),
  ('General', 'Vertical jump height', 'reps', 'in'),
  ('General', '40-yard sprint time', 'timed', 'seconds'),
  ('General', 'Agility ladder drill passed', 'binary', 'pass/fail'),
  ('General', 'Mental focus self-rating', 'rating', '/10'),
  ('General', 'Film breakdown notes', 'notes', '')
on conflict (sport, name) where created_by is null do nothing;
