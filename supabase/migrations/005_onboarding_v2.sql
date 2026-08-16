-- Level Up Athletics — migration 005: richer onboarding (experience + equipment access).
-- Run this in the SQL Editor after 004_weight_room.sql has been applied.
-- Safe to run more than once.

alter table public.profiles add column if not exists experience_level text check (experience_level in ('beginner', 'intermediate', 'advanced'));
alter table public.profiles add column if not exists equipment_access text[] not null default '{}';
