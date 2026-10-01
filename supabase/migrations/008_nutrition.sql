-- Level Up Athletics — migration 008: Nutrition (custom food library + meal diary).
-- Run this in the SQL Editor after 007_motivation.sql has been applied.
-- Safe to run more than once.

create table if not exists public.foods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  serving_label text not null default 'serving',
  calories integer not null default 0,
  protein_g integer not null default 0,
  carbs_g integer not null default 0,
  fat_g integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.meal_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  food_id uuid references public.foods (id) on delete set null,
  logged_date date not null default current_date,
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  name text not null,
  servings numeric not null default 1,
  calories integer not null default 0,
  protein_g integer not null default 0,
  carbs_g integer not null default 0,
  fat_g integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.foods enable row level security;
alter table public.meal_logs enable row level security;

drop policy if exists "users can view their own foods" on public.foods;
create policy "users can view their own foods"
  on public.foods for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "users can create their own foods" on public.foods;
create policy "users can create their own foods"
  on public.foods for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "users can update their own foods" on public.foods;
create policy "users can update their own foods"
  on public.foods for update
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "users can delete their own foods" on public.foods;
create policy "users can delete their own foods"
  on public.foods for delete
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "users can view their own meal logs" on public.meal_logs;
create policy "users can view their own meal logs"
  on public.meal_logs for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "users can create their own meal logs" on public.meal_logs;
create policy "users can create their own meal logs"
  on public.meal_logs for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "users can delete their own meal logs" on public.meal_logs;
create policy "users can delete their own meal logs"
  on public.meal_logs for delete
  to authenticated
  using (user_id = auth.uid());
