-- Level Up Athletics — migration 004: Weight Room (exercise library, templates, live logging).
-- Run this in the SQL Editor after 003_onboarding.sql has been applied.
-- Safe to run more than once (guarded with if not exists / on conflict).

-- ============================================================
-- Tables
-- ============================================================

create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  muscle_group text not null check (muscle_group in (
    'Chest', 'Back', 'Shoulders', 'Quads', 'Hamstrings/Glutes', 'Calves',
    'Biceps', 'Triceps', 'Core', 'Olympic/Power', 'Full Body/Functional', 'Explosive/Plyometric'
  )),
  primary_muscles text not null,
  secondary_muscles text,
  equipment text not null
);

create table if not exists public.workout_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.template_exercises (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.workout_templates (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id) on delete restrict,
  position integer not null default 0,
  superset_group integer,
  created_at timestamptz not null default now()
);

create table if not exists public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  template_id uuid references public.workout_templates (id) on delete set null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.session_exercises (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.workout_sessions (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id) on delete restrict,
  position integer not null default 0,
  superset_group integer,
  created_at timestamptz not null default now()
);

create table if not exists public.session_sets (
  id uuid primary key default gen_random_uuid(),
  session_exercise_id uuid not null references public.session_exercises (id) on delete cascade,
  set_number integer not null,
  weight numeric,
  reps integer,
  set_type text not null default 'normal' check (set_type in ('normal', 'warmup', 'failure', 'dropset')),
  is_confirmed boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Helper functions (security definer to avoid RLS recursion)
-- ============================================================

create or replace function public.owns_template(p_template_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.workout_templates
    where id = p_template_id and user_id = auth.uid()
  );
$$;

create or replace function public.owns_session(p_session_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.workout_sessions
    where id = p_session_id and user_id = auth.uid()
  );
$$;

create or replace function public.owns_session_exercise(p_session_exercise_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.session_exercises se
    join public.workout_sessions ws on ws.id = se.session_id
    where se.id = p_session_exercise_id and ws.user_id = auth.uid()
  );
$$;

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.exercises enable row level security;
alter table public.workout_templates enable row level security;
alter table public.template_exercises enable row level security;
alter table public.workout_sessions enable row level security;
alter table public.session_exercises enable row level security;
alter table public.session_sets enable row level security;

drop policy if exists "exercises are viewable by authenticated users" on public.exercises;
create policy "exercises are viewable by authenticated users"
  on public.exercises for select
  to authenticated
  using (true);

drop policy if exists "users can view their own templates" on public.workout_templates;
create policy "users can view their own templates"
  on public.workout_templates for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "users can create their own templates" on public.workout_templates;
create policy "users can create their own templates"
  on public.workout_templates for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "users can update their own templates" on public.workout_templates;
create policy "users can update their own templates"
  on public.workout_templates for update
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "users can delete their own templates" on public.workout_templates;
create policy "users can delete their own templates"
  on public.workout_templates for delete
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "users can view their own template exercises" on public.template_exercises;
create policy "users can view their own template exercises"
  on public.template_exercises for select
  to authenticated
  using (public.owns_template(template_id));

drop policy if exists "users can add their own template exercises" on public.template_exercises;
create policy "users can add their own template exercises"
  on public.template_exercises for insert
  to authenticated
  with check (public.owns_template(template_id));

drop policy if exists "users can update their own template exercises" on public.template_exercises;
create policy "users can update their own template exercises"
  on public.template_exercises for update
  to authenticated
  using (public.owns_template(template_id));

drop policy if exists "users can delete their own template exercises" on public.template_exercises;
create policy "users can delete their own template exercises"
  on public.template_exercises for delete
  to authenticated
  using (public.owns_template(template_id));

drop policy if exists "users can view their own sessions" on public.workout_sessions;
create policy "users can view their own sessions"
  on public.workout_sessions for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "users can create their own sessions" on public.workout_sessions;
create policy "users can create their own sessions"
  on public.workout_sessions for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "users can update their own sessions" on public.workout_sessions;
create policy "users can update their own sessions"
  on public.workout_sessions for update
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "users can delete their own sessions" on public.workout_sessions;
create policy "users can delete their own sessions"
  on public.workout_sessions for delete
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "users can view their own session exercises" on public.session_exercises;
create policy "users can view their own session exercises"
  on public.session_exercises for select
  to authenticated
  using (public.owns_session(session_id));

drop policy if exists "users can add their own session exercises" on public.session_exercises;
create policy "users can add their own session exercises"
  on public.session_exercises for insert
  to authenticated
  with check (public.owns_session(session_id));

drop policy if exists "users can update their own session exercises" on public.session_exercises;
create policy "users can update their own session exercises"
  on public.session_exercises for update
  to authenticated
  using (public.owns_session(session_id));

drop policy if exists "users can delete their own session exercises" on public.session_exercises;
create policy "users can delete their own session exercises"
  on public.session_exercises for delete
  to authenticated
  using (public.owns_session(session_id));

drop policy if exists "users can view their own session sets" on public.session_sets;
create policy "users can view their own session sets"
  on public.session_sets for select
  to authenticated
  using (public.owns_session_exercise(session_exercise_id));

drop policy if exists "users can add their own session sets" on public.session_sets;
create policy "users can add their own session sets"
  on public.session_sets for insert
  to authenticated
  with check (public.owns_session_exercise(session_exercise_id));

drop policy if exists "users can update their own session sets" on public.session_sets;
create policy "users can update their own session sets"
  on public.session_sets for update
  to authenticated
  using (public.owns_session_exercise(session_exercise_id));

drop policy if exists "users can delete their own session sets" on public.session_sets;
create policy "users can delete their own session sets"
  on public.session_sets for delete
  to authenticated
  using (public.owns_session_exercise(session_exercise_id));

-- ============================================================
-- Exercise library seed data (240 exercises across 12 muscle groups)
-- ============================================================

-- Auto-generated exercise seed data (240 exercises across 12 muscle groups).
insert into public.exercises (name, muscle_group, primary_muscles, secondary_muscles, equipment) values
  ('Barbell Bench Press', 'Chest', 'Chest', 'Triceps, Shoulders', 'Barbell'),
  ('Incline Barbell Bench Press', 'Chest', 'Chest', 'Triceps, Shoulders', 'Barbell'),
  ('Decline Barbell Bench Press', 'Chest', 'Chest', 'Triceps', 'Barbell'),
  ('Dumbbell Bench Press', 'Chest', 'Chest', 'Triceps, Shoulders', 'Dumbbell'),
  ('Incline Dumbbell Press', 'Chest', 'Chest', 'Triceps, Shoulders', 'Dumbbell'),
  ('Decline Dumbbell Press', 'Chest', 'Chest', 'Triceps', 'Dumbbell'),
  ('Machine Chest Press', 'Chest', 'Chest', 'Triceps, Shoulders', 'Machine'),
  ('Smith Machine Bench Press', 'Chest', 'Chest', 'Triceps, Shoulders', 'Machine'),
  ('Push-ups', 'Chest', 'Chest', 'Triceps, Shoulders, Core', 'Bodyweight'),
  ('Weighted Push-ups', 'Chest', 'Chest', 'Triceps, Shoulders, Core', 'Bodyweight'),
  ('Incline Push-ups', 'Chest', 'Chest (lower)', 'Triceps', 'Bodyweight'),
  ('Decline Push-ups', 'Chest', 'Chest (upper)', 'Triceps, Shoulders', 'Bodyweight'),
  ('Dumbbell Flyes', 'Chest', 'Chest', 'Shoulders', 'Dumbbell'),
  ('Incline Dumbbell Flyes', 'Chest', 'Chest (upper)', 'Shoulders', 'Dumbbell'),
  ('Cable Flyes (mid)', 'Chest', 'Chest', 'Shoulders', 'Cable'),
  ('Cable Flyes (low-to-high)', 'Chest', 'Chest (upper)', 'Shoulders', 'Cable'),
  ('Cable Flyes (high-to-low)', 'Chest', 'Chest (lower)', 'Shoulders', 'Cable'),
  ('Pec Deck Machine', 'Chest', 'Chest', null, 'Machine'),
  ('Chest Dips', 'Chest', 'Chest', 'Triceps, Shoulders', 'Bodyweight'),
  ('Svend Press', 'Chest', 'Chest', 'Shoulders', 'Plate'),
  ('Pull-ups', 'Back', 'Back', 'Biceps, Shoulders', 'Bodyweight'),
  ('Chin-ups', 'Back', 'Back', 'Biceps', 'Bodyweight'),
  ('Wide-Grip Pull-up', 'Back', 'Back', 'Biceps', 'Bodyweight'),
  ('Neutral-Grip Pull-up', 'Back', 'Back', 'Biceps', 'Bodyweight'),
  ('Lat Pulldown (wide)', 'Back', 'Back', 'Biceps', 'Cable'),
  ('Lat Pulldown (close grip)', 'Back', 'Back', 'Biceps', 'Cable'),
  ('Straight-Arm Pulldown', 'Back', 'Back', 'Triceps', 'Cable'),
  ('Barbell Row', 'Back', 'Back', 'Biceps, Shoulders', 'Barbell'),
  ('Pendlay Row', 'Back', 'Back', 'Biceps', 'Barbell'),
  ('Single-Arm Dumbbell Row', 'Back', 'Back', 'Biceps, Shoulders', 'Dumbbell'),
  ('T-Bar Row', 'Back', 'Back', 'Biceps, Shoulders', 'Machine/Barbell'),
  ('Seated Cable Row', 'Back', 'Back', 'Biceps, Shoulders', 'Cable'),
  ('Chest-Supported Row', 'Back', 'Back', 'Biceps, Shoulders', 'Machine'),
  ('Meadows Row', 'Back', 'Back', 'Biceps', 'Barbell'),
  ('Conventional Deadlift', 'Back', 'Back', 'Glutes, Hamstrings', 'Barbell'),
  ('Sumo Deadlift', 'Back', 'Back', 'Glutes, Hamstrings, Quads', 'Barbell'),
  ('Rack Pull', 'Back', 'Back', 'Glutes, Hamstrings', 'Barbell'),
  ('Good Morning', 'Back', 'Back', 'Hamstrings, Glutes', 'Barbell'),
  ('Barbell Shrug', 'Back', 'Traps', null, 'Barbell'),
  ('Face Pull', 'Back', 'Back (rear delt/rhomboid)', 'Shoulders', 'Cable'),
  ('Barbell Overhead Press', 'Shoulders', 'Shoulders', 'Triceps, Core', 'Barbell'),
  ('Seated Barbell Press', 'Shoulders', 'Shoulders', 'Triceps', 'Barbell'),
  ('Dumbbell Shoulder Press', 'Shoulders', 'Shoulders', 'Triceps', 'Dumbbell'),
  ('Arnold Press', 'Shoulders', 'Shoulders', 'Triceps', 'Dumbbell'),
  ('Machine Shoulder Press', 'Shoulders', 'Shoulders', 'Triceps', 'Machine'),
  ('Push Press', 'Shoulders', 'Shoulders', 'Triceps, Legs', 'Barbell'),
  ('Behind-the-Neck Press', 'Shoulders', 'Shoulders', 'Triceps', 'Barbell'),
  ('Lateral Raise', 'Shoulders', 'Shoulders', 'Traps', 'Dumbbell'),
  ('Cable Lateral Raise', 'Shoulders', 'Shoulders', 'Traps', 'Cable'),
  ('Leaning Lateral Raise', 'Shoulders', 'Shoulders', 'Traps', 'Dumbbell'),
  ('Front Raise', 'Shoulders', 'Shoulders', 'Chest', 'Dumbbell'),
  ('Plate Front Raise', 'Shoulders', 'Shoulders', 'Chest', 'Plate'),
  ('Dumbbell Rear Delt Flye', 'Shoulders', 'Shoulders (rear)', 'Back', 'Dumbbell'),
  ('Machine Rear Delt Flye', 'Shoulders', 'Shoulders (rear)', 'Back', 'Machine'),
  ('Cable Rear Delt Flye', 'Shoulders', 'Shoulders (rear)', 'Back', 'Cable'),
  ('Barbell Upright Row', 'Shoulders', 'Shoulders', 'Traps, Biceps', 'Barbell'),
  ('Cable Upright Row', 'Shoulders', 'Shoulders', 'Traps, Biceps', 'Cable'),
  ('Cuban Press', 'Shoulders', 'Shoulders', 'Rotator Cuff', 'Dumbbell'),
  ('Bradford Press', 'Shoulders', 'Shoulders', 'Triceps', 'Barbell'),
  ('Single-Arm Landmine Press', 'Shoulders', 'Shoulders', 'Triceps, Core', 'Barbell'),
  ('Back Squat', 'Quads', 'Quads', 'Glutes', 'Barbell'),
  ('Front Squat', 'Quads', 'Quads', 'Glutes, Core', 'Barbell'),
  ('Box Squat', 'Quads', 'Quads', 'Glutes', 'Barbell'),
  ('Goblet Squat', 'Quads', 'Quads', 'Glutes, Core', 'Dumbbell'),
  ('Hack Squat', 'Quads', 'Quads', 'Glutes', 'Machine'),
  ('Leg Press', 'Quads', 'Quads', 'Glutes, Hamstrings', 'Machine'),
  ('Bulgarian Split Squat', 'Quads', 'Quads', 'Glutes', 'Dumbbell'),
  ('Walking Lunge', 'Quads', 'Quads', 'Glutes, Hamstrings', 'Dumbbell'),
  ('Reverse Lunge', 'Quads', 'Quads', 'Glutes', 'Dumbbell'),
  ('Step-Up', 'Quads', 'Quads', 'Glutes', 'Dumbbell'),
  ('Leg Extension', 'Quads', 'Quads', null, 'Machine'),
  ('Zercher Squat', 'Quads', 'Quads', 'Glutes, Core', 'Barbell'),
  ('Smith Machine Squat', 'Quads', 'Quads', 'Glutes', 'Machine'),
  ('Sissy Squat', 'Quads', 'Quads', null, 'Bodyweight'),
  ('Pistol Squat', 'Quads', 'Quads', 'Glutes, Core', 'Bodyweight'),
  ('Belt Squat', 'Quads', 'Quads', 'Glutes', 'Machine'),
  ('Overhead Squat', 'Quads', 'Quads', 'Core, Shoulders', 'Barbell'),
  ('Wall Sit', 'Quads', 'Quads', null, 'Bodyweight'),
  ('Curtsy Lunge', 'Quads', 'Quads', 'Glutes', 'Dumbbell'),
  ('Cyclist Squat (heels elevated)', 'Quads', 'Quads', null, 'Barbell'),
  ('Romanian Deadlift', 'Hamstrings/Glutes', 'Hamstrings', 'Glutes, Back', 'Barbell'),
  ('Stiff-Leg Deadlift', 'Hamstrings/Glutes', 'Hamstrings', 'Glutes, Back', 'Barbell'),
  ('Sumo Romanian Deadlift', 'Hamstrings/Glutes', 'Hamstrings', 'Glutes, Adductors', 'Barbell'),
  ('Cable Pull-Through', 'Hamstrings/Glutes', 'Glutes', 'Hamstrings', 'Cable'),
  ('Hip Thrust', 'Hamstrings/Glutes', 'Glutes', 'Hamstrings', 'Barbell'),
  ('Barbell Glute Bridge', 'Hamstrings/Glutes', 'Glutes', 'Hamstrings', 'Barbell'),
  ('Single-Leg Hip Thrust', 'Hamstrings/Glutes', 'Glutes', 'Hamstrings', 'Bodyweight'),
  ('Seated Leg Curl', 'Hamstrings/Glutes', 'Hamstrings', null, 'Machine'),
  ('Lying Leg Curl', 'Hamstrings/Glutes', 'Hamstrings', 'Calves', 'Machine'),
  ('Standing Leg Curl', 'Hamstrings/Glutes', 'Hamstrings', null, 'Machine'),
  ('Nordic Curl', 'Hamstrings/Glutes', 'Hamstrings', null, 'Bodyweight'),
  ('Cable Glute Kickback', 'Hamstrings/Glutes', 'Glutes', 'Hamstrings', 'Cable'),
  ('Machine Glute Kickback', 'Hamstrings/Glutes', 'Glutes', 'Hamstrings', 'Machine'),
  ('Reverse Hyperextension', 'Hamstrings/Glutes', 'Glutes', 'Hamstrings, Back', 'Machine'),
  ('45-Degree Back Extension', 'Hamstrings/Glutes', 'Hamstrings', 'Glutes, Back', 'Bodyweight'),
  ('Single-Leg RDL', 'Hamstrings/Glutes', 'Hamstrings', 'Glutes, Core', 'Dumbbell'),
  ('Kettlebell Swing', 'Hamstrings/Glutes', 'Glutes', 'Hamstrings, Back', 'Kettlebell'),
  ('Frog Pump', 'Hamstrings/Glutes', 'Glutes', null, 'Bodyweight'),
  ('Cable Hip Abduction', 'Hamstrings/Glutes', 'Glutes (medius)', null, 'Cable'),
  ('Banded Lateral Walk', 'Hamstrings/Glutes', 'Glutes (medius)', null, 'Band'),
  ('Standing Calf Raise (machine)', 'Calves', 'Calves', null, 'Machine'),
  ('Standing Calf Raise (barbell)', 'Calves', 'Calves', null, 'Barbell'),
  ('Seated Calf Raise', 'Calves', 'Calves', null, 'Machine'),
  ('Leg Press Calf Raise', 'Calves', 'Calves', null, 'Machine'),
  ('Smith Machine Calf Raise', 'Calves', 'Calves', null, 'Machine'),
  ('Single-Leg Calf Raise (bodyweight)', 'Calves', 'Calves', null, 'Bodyweight'),
  ('Single-Leg Calf Raise (dumbbell)', 'Calves', 'Calves', null, 'Dumbbell'),
  ('Donkey Calf Raise', 'Calves', 'Calves', null, 'Machine'),
  ('Calf Press on Hack Squat', 'Calves', 'Calves', null, 'Machine'),
  ('Farmer''s Carry Calf Raise', 'Calves', 'Calves', 'Forearms', 'Dumbbell'),
  ('Jump Rope', 'Calves', 'Calves', null, 'Bodyweight'),
  ('Seated Dumbbell Calf Raise', 'Calves', 'Calves', null, 'Dumbbell'),
  ('Tibia Raise (anterior)', 'Calves', 'Calves (anterior)', null, 'Bodyweight'),
  ('Standing Calf Raise (dumbbell, single)', 'Calves', 'Calves', null, 'Dumbbell'),
  ('Calf Raise on Leg Press (single-leg)', 'Calves', 'Calves', null, 'Machine'),
  ('Isometric Calf Hold', 'Calves', 'Calves', null, 'Bodyweight'),
  ('Explosive Calf Raise', 'Calves', 'Calves', null, 'Bodyweight'),
  ('Bent-Knee Seated Raise', 'Calves', 'Calves (soleus)', null, 'Machine'),
  ('Straight-Leg Standing Raise', 'Calves', 'Calves (gastrocnemius)', null, 'Barbell'),
  ('Sled Calf Push', 'Calves', 'Calves', null, 'Sled'),
  ('Barbell Curl', 'Biceps', 'Biceps', 'Forearms', 'Barbell'),
  ('EZ-Bar Curl', 'Biceps', 'Biceps', 'Forearms', 'Barbell'),
  ('Dumbbell Curl', 'Biceps', 'Biceps', 'Forearms', 'Dumbbell'),
  ('Alternating Dumbbell Curl', 'Biceps', 'Biceps', 'Forearms', 'Dumbbell'),
  ('Hammer Curl', 'Biceps', 'Biceps', 'Forearms', 'Dumbbell'),
  ('Cross-Body Hammer Curl', 'Biceps', 'Biceps', 'Forearms', 'Dumbbell'),
  ('Incline Dumbbell Curl', 'Biceps', 'Biceps', null, 'Dumbbell'),
  ('Preacher Curl (barbell)', 'Biceps', 'Biceps', null, 'Barbell'),
  ('Preacher Curl (dumbbell)', 'Biceps', 'Biceps', null, 'Dumbbell'),
  ('Preacher Curl (machine)', 'Biceps', 'Biceps', null, 'Machine'),
  ('Cable Curl', 'Biceps', 'Biceps', 'Forearms', 'Cable'),
  ('Cable Hammer Curl (rope)', 'Biceps', 'Biceps', 'Forearms', 'Cable'),
  ('Concentration Curl', 'Biceps', 'Biceps', null, 'Dumbbell'),
  ('Spider Curl', 'Biceps', 'Biceps', null, 'Barbell/Dumbbell'),
  ('Drag Curl', 'Biceps', 'Biceps', null, 'Barbell'),
  ('21s', 'Biceps', 'Biceps', 'Forearms', 'Barbell'),
  ('Reverse Curl', 'Biceps', 'Forearms', 'Biceps', 'Barbell'),
  ('Zottman Curl', 'Biceps', 'Biceps', 'Forearms', 'Dumbbell'),
  ('Behind-Back Cable Curl', 'Biceps', 'Biceps', 'Forearms', 'Cable'),
  ('Machine Bicep Curl', 'Biceps', 'Biceps', null, 'Machine'),
  ('Close-Grip Bench Press', 'Triceps', 'Triceps', 'Chest, Shoulders', 'Barbell'),
  ('Tricep Pushdown (rope)', 'Triceps', 'Triceps', null, 'Cable'),
  ('Tricep Pushdown (straight bar)', 'Triceps', 'Triceps', null, 'Cable'),
  ('Overhead Extension (dumbbell)', 'Triceps', 'Triceps', null, 'Dumbbell'),
  ('Overhead Extension (cable)', 'Triceps', 'Triceps', null, 'Cable'),
  ('Skull Crusher (barbell)', 'Triceps', 'Triceps', null, 'Barbell'),
  ('Skull Crusher (dumbbell)', 'Triceps', 'Triceps', null, 'Dumbbell'),
  ('Tricep Dips', 'Triceps', 'Triceps', 'Chest, Shoulders', 'Bodyweight'),
  ('Bench Dips', 'Triceps', 'Triceps', 'Shoulders', 'Bodyweight'),
  ('Cable Kickback', 'Triceps', 'Triceps', null, 'Cable'),
  ('Diamond Push-ups', 'Triceps', 'Triceps', 'Chest', 'Bodyweight'),
  ('JM Press', 'Triceps', 'Triceps', 'Chest', 'Barbell'),
  ('Single-Arm Overhead Extension', 'Triceps', 'Triceps', null, 'Dumbbell'),
  ('Machine Tricep Extension', 'Triceps', 'Triceps', null, 'Machine'),
  ('Tate Press', 'Triceps', 'Triceps', null, 'Dumbbell'),
  ('French Press', 'Triceps', 'Triceps', null, 'Barbell'),
  ('Rope Overhead Extension', 'Triceps', 'Triceps', null, 'Cable'),
  ('Reverse-Grip Pushdown', 'Triceps', 'Triceps', 'Forearms', 'Cable'),
  ('Bodyweight Tricep Extension (bench)', 'Triceps', 'Triceps', null, 'Bodyweight'),
  ('Landmine Tricep Extension', 'Triceps', 'Triceps', null, 'Barbell'),
  ('Plank', 'Core', 'Core', 'Shoulders', 'Bodyweight'),
  ('Side Plank', 'Core', 'Core (obliques)', 'Glutes', 'Bodyweight'),
  ('Hanging Leg Raise', 'Core', 'Core', 'Hip Flexors', 'Bodyweight'),
  ('Hanging Knee Raise', 'Core', 'Core', 'Hip Flexors', 'Bodyweight'),
  ('Cable Crunch', 'Core', 'Core', null, 'Cable'),
  ('Ab Wheel Rollout', 'Core', 'Core', 'Back, Shoulders', 'Equipment'),
  ('Weighted Sit-Up', 'Core', 'Core', 'Hip Flexors', 'Plate'),
  ('Russian Twist', 'Core', 'Core (obliques)', null, 'Plate'),
  ('Pallof Press', 'Core', 'Core (obliques)', null, 'Cable'),
  ('Bicycle Crunch', 'Core', 'Core (obliques)', 'Hip Flexors', 'Bodyweight'),
  ('V-Up', 'Core', 'Core', 'Hip Flexors', 'Bodyweight'),
  ('Toe Touches', 'Core', 'Core', null, 'Bodyweight'),
  ('Reverse Crunch', 'Core', 'Core (lower)', 'Hip Flexors', 'Bodyweight'),
  ('Dead Bug', 'Core', 'Core', null, 'Bodyweight'),
  ('Mountain Climbers', 'Core', 'Core', 'Hip Flexors, Shoulders', 'Bodyweight'),
  ('Cable Woodchopper', 'Core', 'Core (obliques)', 'Shoulders', 'Cable'),
  ('Flutter Kicks', 'Core', 'Core (lower)', 'Hip Flexors', 'Bodyweight'),
  ('Hollow Body Hold', 'Core', 'Core', null, 'Bodyweight'),
  ('Landmine Rotation', 'Core', 'Core (obliques)', 'Shoulders', 'Barbell'),
  ('Sit-Up', 'Core', 'Core', 'Hip Flexors', 'Bodyweight'),
  ('Power Clean', 'Olympic/Power', 'Full Body (Traps, Glutes, Quads)', 'Shoulders', 'Barbell'),
  ('Hang Power Clean', 'Olympic/Power', 'Full Body', 'Shoulders', 'Barbell'),
  ('Clean and Jerk', 'Olympic/Power', 'Full Body', 'Triceps, Core', 'Barbell'),
  ('Snatch', 'Olympic/Power', 'Full Body', 'Shoulders, Core', 'Barbell'),
  ('Power Snatch', 'Olympic/Power', 'Full Body', 'Shoulders', 'Barbell'),
  ('Hang Snatch', 'Olympic/Power', 'Full Body', 'Shoulders', 'Barbell'),
  ('Split Jerk', 'Olympic/Power', 'Shoulders, Quads', 'Core', 'Barbell'),
  ('Push Jerk', 'Olympic/Power', 'Shoulders', 'Triceps, Quads', 'Barbell'),
  ('Clean Pull', 'Olympic/Power', 'Back, Traps', 'Glutes', 'Barbell'),
  ('Snatch Pull', 'Olympic/Power', 'Back, Traps', 'Glutes', 'Barbell'),
  ('Muscle Snatch', 'Olympic/Power', 'Shoulders', 'Traps', 'Barbell'),
  ('Muscle Clean', 'Olympic/Power', 'Shoulders', 'Traps', 'Barbell'),
  ('Hang Clean', 'Olympic/Power', 'Full Body', 'Shoulders', 'Barbell'),
  ('Clean High Pull', 'Olympic/Power', 'Traps, Back', 'Shoulders', 'Barbell'),
  ('Snatch Balance', 'Olympic/Power', 'Quads, Shoulders', 'Core', 'Barbell'),
  ('Overhead Squat', 'Olympic/Power', 'Quads', 'Shoulders, Core', 'Barbell'),
  ('Push Press', 'Olympic/Power', 'Shoulders', 'Triceps, Quads', 'Barbell'),
  ('Jerk Balance', 'Olympic/Power', 'Quads, Shoulders', 'Core', 'Barbell'),
  ('Tall Clean', 'Olympic/Power', 'Traps, Shoulders', null, 'Barbell'),
  ('Tall Snatch', 'Olympic/Power', 'Traps, Shoulders', null, 'Barbell'),
  ('Farmer''s Carry', 'Full Body/Functional', 'Traps, Forearms', 'Core', 'Dumbbell/Kettlebell'),
  ('Suitcase Carry', 'Full Body/Functional', 'Core (obliques)', 'Forearms', 'Dumbbell'),
  ('Sled Push', 'Full Body/Functional', 'Quads', 'Glutes, Calves', 'Sled'),
  ('Sled Pull (backward)', 'Full Body/Functional', 'Quads', 'Hamstrings', 'Sled'),
  ('Sled Row', 'Full Body/Functional', 'Back', 'Biceps', 'Sled'),
  ('Kettlebell Swing', 'Full Body/Functional', 'Glutes', 'Hamstrings, Back', 'Kettlebell'),
  ('Turkish Get-Up', 'Full Body/Functional', 'Core, Shoulders', 'Glutes, Quads', 'Kettlebell'),
  ('Man Maker', 'Full Body/Functional', 'Full Body', 'Shoulders, Core', 'Dumbbell'),
  ('Battle Ropes', 'Full Body/Functional', 'Shoulders', 'Core', 'Rope'),
  ('Tire Flip', 'Full Body/Functional', 'Full Body (Quads, Back)', 'Shoulders', 'Tire'),
  ('Sandbag Carry', 'Full Body/Functional', 'Core', 'Forearms', 'Sandbag'),
  ('Yoke Walk', 'Full Body/Functional', 'Full Body (Traps, Core)', 'Quads', 'Yoke'),
  ('Zercher Carry', 'Full Body/Functional', 'Core', 'Back, Biceps', 'Barbell'),
  ('Bear Crawl', 'Full Body/Functional', 'Core', 'Shoulders', 'Bodyweight'),
  ('Burpees', 'Full Body/Functional', 'Full Body', 'Shoulders, Quads', 'Bodyweight'),
  ('Thruster', 'Full Body/Functional', 'Quads, Shoulders', 'Glutes, Triceps', 'Barbell'),
  ('Wall Ball', 'Full Body/Functional', 'Quads, Shoulders', 'Core', 'Med Ball'),
  ('Devil Press', 'Full Body/Functional', 'Full Body', 'Shoulders', 'Dumbbell'),
  ('Lateral Sled Drag', 'Full Body/Functional', 'Quads, Glutes', 'Core', 'Sled'),
  ('Log Press', 'Full Body/Functional', 'Shoulders', 'Triceps, Core', 'Log'),
  ('Box Jump', 'Explosive/Plyometric', 'Quads, Glutes', 'Calves', 'Bodyweight'),
  ('Depth Jump', 'Explosive/Plyometric', 'Quads, Glutes', 'Calves, Tendons', 'Bodyweight'),
  ('Broad Jump', 'Explosive/Plyometric', 'Glutes, Quads', 'Calves', 'Bodyweight'),
  ('Lateral Bound', 'Explosive/Plyometric', 'Glutes (medius)', 'Adductors', 'Bodyweight'),
  ('Tuck Jump', 'Explosive/Plyometric', 'Quads, Glutes', 'Calves', 'Bodyweight'),
  ('Single-Leg Bound', 'Explosive/Plyometric', 'Glutes, Quads', 'Calves', 'Bodyweight'),
  ('Skater Jump', 'Explosive/Plyometric', 'Glutes (medius)', 'Quads', 'Bodyweight'),
  ('Squat Jump', 'Explosive/Plyometric', 'Quads, Glutes', 'Calves', 'Bodyweight'),
  ('Medicine Ball Slam', 'Explosive/Plyometric', 'Core', 'Shoulders', 'Med Ball'),
  ('Medicine Ball Rotational Throw', 'Explosive/Plyometric', 'Core (obliques)', 'Shoulders', 'Med Ball'),
  ('Medicine Ball Chest Pass', 'Explosive/Plyometric', 'Chest', 'Shoulders', 'Med Ball'),
  ('Medicine Ball Overhead Throw', 'Explosive/Plyometric', 'Shoulders', 'Core', 'Med Ball'),
  ('Depth Drop', 'Explosive/Plyometric', 'Quads, Glutes', 'Calves', 'Bodyweight'),
  ('Lateral Box Jump', 'Explosive/Plyometric', 'Glutes (medius)', 'Quads', 'Bodyweight'),
  ('Split Jump (jumping lunge)', 'Explosive/Plyometric', 'Quads, Glutes', 'Calves', 'Bodyweight'),
  ('Bounding', 'Explosive/Plyometric', 'Glutes, Hamstrings', 'Calves', 'Bodyweight'),
  ('Hurdle Hops', 'Explosive/Plyometric', 'Quads, Glutes', 'Calves', 'Bodyweight'),
  ('Box Jump Step-Down', 'Explosive/Plyometric', 'Quads', 'Glutes', 'Bodyweight'),
  ('Reactive Broad Jump', 'Explosive/Plyometric', 'Glutes, Quads', 'Calves', 'Bodyweight'),
  ('Consecutive Box Jumps', 'Explosive/Plyometric', 'Quads, Glutes', 'Calves', 'Bodyweight')
on conflict (name) do nothing;
