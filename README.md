# Level Up Athletics

A shared space for athletes to organize themselves — team rosters, scheduling
with RSVPs, and training logs, all in one place.

Built with [Next.js](https://nextjs.org) (App Router) and
[Supabase](https://supabase.com) (Postgres, Auth, row-level security).

## Features

- **Accounts** — email/password sign up and login (Supabase Auth)
- **Teams & rosters** — create a team, share an invite code, manage member roles (coach / captain / athlete)
- **Schedule** — post practices, games, and meetings; members RSVP yes/maybe/no
- **Training log** — coaches/captains post team workouts; athletes log what they actually did

## Setup

### 1. Create a Supabase project

Create a free project at [supabase.com](https://supabase.com/dashboard).

### 2. Run the database schema

Open your project's **SQL Editor** and run the contents of
[`supabase/schema.sql`](./supabase/schema.sql). This creates all tables,
helper functions/triggers, and row-level security policies.

### 3. Configure environment variables

Copy the example env file:

```bash
cp .env.local.example .env.local
```

Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from
your Supabase project's **Settings → API** page.

### 4. Install dependencies and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. (Optional) Email confirmation

By default Supabase requires email confirmation before a new account can log
in. For local testing you can disable this under **Authentication →
Providers → Email → Confirm email** in the Supabase dashboard.

## Project structure

```
src/app/
  page.tsx                  Public landing page
  login/, signup/            Auth pages + server actions
  (app)/                     Authenticated app shell (nav, sign out)
    dashboard/                Overview: your teams, upcoming events, recent workouts
    teams/                    Create/join a team
      [teamId]/                Roster, role management
        schedule/               Events + RSVPs
        workouts/               Team workouts + personal training log
src/lib/
  supabase/                  Browser/server Supabase clients, middleware, DB types
  auth.ts                    requireUser() helper for protected pages
  queries.ts                 Shared data-fetching helpers
supabase/schema.sql          Database schema + RLS policies
```

## Deploy

Deploy on [Vercel](https://vercel.com/new) (or any Node host) and set the
same environment variables from `.env.local` in your hosting provider's
dashboard.
