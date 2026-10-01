-- Level Up Athletics — migration 007: Motivation content library.
-- Run this in the SQL Editor after 006_body_metrics.sql has been applied.
-- Safe to run more than once.

create table if not exists public.motivation_content (
  id uuid primary key default gen_random_uuid(),
  content_type text not null check (content_type in ('quote', 'video', 'podcast')),
  body text unique,
  author text,
  url text,
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.motivation_content enable row level security;

drop policy if exists "motivation content is viewable by authenticated users" on public.motivation_content;
create policy "motivation content is viewable by authenticated users"
  on public.motivation_content for select
  to authenticated
  using (true);

insert into public.motivation_content (content_type, body, author, tags) values
  ('quote', 'Hard work beats talent when talent doesn''t work hard.', 'Tim Notke', '{}'),
  ('quote', 'I''ve failed over and over and over again in my life and that is why I succeed.', 'Michael Jordan', '{"Michael Jordan","basketball"}'),
  ('quote', 'Obstacles don''t have to stop you. If you run into a wall, don''t turn around and give up. Figure out how to climb it, go through it, or work around it.', 'Michael Jordan', '{"Michael Jordan","basketball"}'),
  ('quote', 'It''s not whether you get knocked down, it''s whether you get up.', 'Vince Lombardi', '{"football"}'),
  ('quote', 'You miss 100% of the shots you don''t take.', 'Wayne Gretzky', '{"Wayne Gretzky","hockey"}'),
  ('quote', 'The more difficult the victory, the greater the happiness in winning.', 'Pelé', '{"Pele","soccer","football"}'),
  ('quote', 'Champions keep playing until they get it right.', 'Billie Jean King', '{"tennis"}'),
  ('quote', 'I hated every minute of training, but I said, Don''t quit. Suffer now and live the rest of your life as a champion.', 'Muhammad Ali', '{"boxing"}'),
  ('quote', 'Set your goals high, and don''t stop till you get there.', 'Bo Jackson', '{}'),
  ('quote', 'You can''t put a limit on anything. The more you dream, the farther you get.', 'Michael Phelps', '{"Michael Phelps","swimming"}'),
  ('quote', 'It always seems impossible until it''s done.', 'Nelson Mandela', '{}'),
  ('quote', 'The difference between the impossible and the possible lies in a person''s determination.', 'Tommy Lasorda', '{"baseball"}'),
  ('quote', 'Success is no accident. It is hard work, perseverance, learning, studying, sacrifice and most of all, love of what you are doing.', 'Pelé', '{"Pele","soccer","football"}'),
  ('quote', 'A champion is defined not by their wins but by how they can recover when they fall.', 'Serena Williams', '{"Serena Williams","tennis"}'),
  ('quote', 'You have to expect things of yourself before you can do them.', 'Michael Jordan', '{"Michael Jordan","basketball"}'),
  ('quote', 'Talent wins games, but teamwork and intelligence win championships.', 'Michael Jordan', '{"Michael Jordan","basketball"}'),
  ('quote', 'The harder the battle, the sweeter the victory.', 'Les Brown', '{}'),
  ('quote', 'Winners are not people who never fail, but people who never quit.', 'Edwin Louis Cole', '{}'),
  ('quote', 'Play every game as if it''s your last.', 'Bruce Lee', '{}'),
  ('quote', 'Pressure is a privilege.', 'Billie Jean King', '{"tennis"}')
on conflict (body) do nothing;
