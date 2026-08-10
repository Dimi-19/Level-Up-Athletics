-- Level Up Athletics — migration 003: onboarding questionnaire fields.
-- Run this in the SQL Editor after 002_personal_app.sql has been applied.
-- Safe to run more than once.

alter table public.profiles add column if not exists age integer;
alter table public.profiles add column if not exists height_cm numeric;
alter table public.profiles add column if not exists weight_kg numeric;
alter table public.profiles add column if not exists biological_sex text check (biological_sex in ('male', 'female'));
alter table public.profiles add column if not exists primary_goal text check (primary_goal in ('cut', 'maintain', 'bulk'));
alter table public.profiles add column if not exists workouts_per_week integer;
alter table public.profiles add column if not exists onboarding_completed boolean not null default false;
