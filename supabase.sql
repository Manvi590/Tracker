-- Run this entire file in Supabase SQL Editor.
create extension if not exists pgcrypto;

-- ─── CORE TABLES ──────────────────────────────────────────────────────────────

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz default now()
);
create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  name text not null, icon text default '♡', target integer default 31, created_at timestamptz default now()
);
create table if not exists public.daily_logs (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  activity_id uuid not null references public.activities(id) on delete cascade, log_date date not null,
  unique(user_id,activity_id,log_date)
);
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  title text not null, amount numeric(12,2) not null check(amount>=0), category text not null default 'Other',
  spent_on date not null default current_date, note text default '', created_at timestamptz default now()
);
create table if not exists public.cheat_logs (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  cheat_date date not null default current_date, note text not null, created_at timestamptz default now()
);

-- ─── MONTHLY GOALS ────────────────────────────────────────────────────────────
-- e.g. "Read 5 books this month", "Go to gym 20 times", "Call mom 4 times"
create table if not exists public.monthly_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  icon text default '🎯',
  target integer not null default 1,   -- how many completions = goal achieved
  month_key text not null,             -- 'YYYY-MM'  e.g. '2025-10'
  created_at timestamptz default now()
);

-- Each tick/check-in toward a monthly goal
create table if not exists public.monthly_goal_checks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  goal_id uuid not null references public.monthly_goals(id) on delete cascade,
  check_date date not null default current_date,
  note text default '',
  created_at timestamptz default now()
);

-- ─── DAILY EXTRAS ─────────────────────────────────────────────────────────────
-- One-off tasks added for a specific day (not part of recurring activities)
create table if not exists public.daily_extras (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  task text not null,
  icon text default '⭐',
  extra_date date not null default current_date,
  done boolean default false,
  created_at timestamptz default now()
);

-- ─── ROW LEVEL SECURITY ───────────────────────────────────────────────────────

alter table public.profiles enable row level security;
alter table public.activities enable row level security;
alter table public.daily_logs enable row level security;
alter table public.expenses enable row level security;
alter table public.cheat_logs enable row level security;
alter table public.monthly_goals enable row level security;
alter table public.monthly_goal_checks enable row level security;
alter table public.daily_extras enable row level security;

create policy "profiles own" on public.profiles for all using (auth.uid()=id) with check (auth.uid()=id);
create policy "activities own" on public.activities for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "logs own" on public.daily_logs for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "expenses own" on public.expenses for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "cheat own" on public.cheat_logs for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "monthly_goals own" on public.monthly_goals for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "monthly_goal_checks own" on public.monthly_goal_checks for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "daily_extras own" on public.daily_extras for all using (auth.uid()=user_id) with check (auth.uid()=user_id);

-- ─── NEW USER TRIGGER ─────────────────────────────────────────────────────────

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin insert into public.profiles(id) values(new.id) on conflict do nothing; return new; end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
