create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.frameworks (
  key text primary key,
  name text not null,
  summary text not null,
  components jsonb not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.topics (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null check (category in ('general_thinking', 'opinion', 'interview')),
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard')),
  framework text not null references public.frameworks(key),
  tags text[] not null default '{}',
  prompt_style text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.topic_framework_rules (
  id uuid primary key default gen_random_uuid(),
  topic_category text not null,
  default_framework text not null references public.frameworks(key),
  allow_manual_override boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.practice_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  guest_key text,
  mode text not null,
  difficulty text not null,
  framework text not null references public.frameworks(key),
  topic_id text not null,
  status text not null check (status in ('topic_generated', 'completed')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.practice_attempts (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.practice_sessions(id) on delete set null,
  user_id uuid references public.profiles(id) on delete cascade,
  guest_key text,
  topic_id text not null,
  topic_title text not null,
  framework text not null references public.frameworks(key),
  transcript text not null,
  raw_evaluation jsonb not null,
  overall_score numeric(4,1) not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.attempt_component_scores (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.practice_attempts(id) on delete cascade,
  framework text not null references public.frameworks(key),
  component_key text not null,
  component_label text not null,
  score numeric(4,1) not null,
  evidence text,
  feedback text
);

create table if not exists public.attempt_communication_scores (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.practice_attempts(id) on delete cascade,
  metric_key text not null,
  metric_label text not null,
  score numeric(4,1) not null,
  feedback text
);

create materialized view if not exists public.progress_snapshots as
select
  coalesce(user_id::text, guest_key) as scope_key,
  framework,
  round(avg(overall_score), 1) as average_score,
  count(*) as attempts
from public.practice_attempts
group by 1, 2;

alter table public.profiles enable row level security;
alter table public.practice_sessions enable row level security;
alter table public.practice_attempts enable row level security;
alter table public.attempt_component_scores enable row level security;
alter table public.attempt_communication_scores enable row level security;

create policy "profiles are self readable"
on public.profiles
for select
using (auth.uid() = id);

create policy "profiles are self writable"
on public.profiles
for all
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "sessions belong to owner"
on public.practice_sessions
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "attempts belong to owner"
on public.practice_attempts
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "component scores belong to owner"
on public.attempt_component_scores
for select
using (
  exists (
    select 1
    from public.practice_attempts
    where public.practice_attempts.id = attempt_component_scores.attempt_id
      and public.practice_attempts.user_id = auth.uid()
  )
);

create policy "component scores are inserted by owner"
on public.attempt_component_scores
for insert
with check (
  exists (
    select 1
    from public.practice_attempts
    where public.practice_attempts.id = attempt_component_scores.attempt_id
      and public.practice_attempts.user_id = auth.uid()
  )
);

create policy "communication scores belong to owner"
on public.attempt_communication_scores
for select
using (
  exists (
    select 1
    from public.practice_attempts
    where public.practice_attempts.id = attempt_communication_scores.attempt_id
      and public.practice_attempts.user_id = auth.uid()
  )
);

create policy "communication scores are inserted by owner"
on public.attempt_communication_scores
for insert
with check (
  exists (
    select 1
    from public.practice_attempts
    where public.practice_attempts.id = attempt_communication_scores.attempt_id
      and public.practice_attempts.user_id = auth.uid()
  )
);
