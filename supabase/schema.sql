-- ============================================================
-- Chapter Club – Supabase Schema
-- Run this in Supabase SQL Editor (Settings → SQL Editor)
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES
-- ============================================================
create table if not exists profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_emoji text not null default '📚',
  created_at timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar_emoji)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_emoji', '📚')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ============================================================
-- BOOKS
-- ============================================================
create table if not exists books (
  id           uuid primary key default uuid_generate_v4(),
  title        text not null,
  author       text not null,
  description  text,
  cover_url    text,
  month        integer not null check (month between 1 and 12),
  year         integer not null check (year > 2000),
  suggested_by uuid references profiles(id) on delete set null,
  is_current   boolean not null default false,
  created_at   timestamptz not null default now()
);

-- Only one current book at a time
create unique index if not exists books_is_current_unique
  on books (is_current) where (is_current = true);

-- ============================================================
-- READING PROGRESS
-- ============================================================
create table if not exists reading_progress (
  id               uuid primary key default uuid_generate_v4(),
  book_id          uuid not null references books(id) on delete cascade,
  user_id          uuid not null references profiles(id) on delete cascade,
  progress_percent integer not null default 0 check (progress_percent between 0 and 100),
  status           text not null default 'not_started'
                   check (status in ('not_started','reading','finished','paused','abandoned')),
  mood             text check (mood in ('😍','😭','🤯','💤','🔥','😐')),
  updated_at       timestamptz not null default now(),
  unique(book_id, user_id)
);

-- Auto-update updated_at
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists reading_progress_updated_at on reading_progress;
create trigger reading_progress_updated_at
  before update on reading_progress
  for each row execute procedure set_updated_at();

-- ============================================================
-- REVIEWS
-- ============================================================
create table if not exists reviews (
  id                uuid primary key default uuid_generate_v4(),
  book_id           uuid not null references books(id) on delete cascade,
  user_id           uuid not null references profiles(id) on delete cascade,
  rating            integer not null check (rating between 1 and 10),
  review_text       text,
  favorite_quote    text,
  contains_spoilers boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique(book_id, user_id)
);

drop trigger if exists reviews_updated_at on reviews;
create trigger reviews_updated_at
  before update on reviews
  for each row execute procedure set_updated_at();

-- ============================================================
-- BOOK SUGGESTIONS
-- ============================================================
create table if not exists book_suggestions (
  id           uuid primary key default uuid_generate_v4(),
  title        text not null,
  author       text not null,
  description  text,
  cover_url    text,
  reason       text,
  suggested_by uuid not null references profiles(id) on delete cascade,
  target_month integer not null check (target_month between 1 and 12),
  target_year  integer not null check (target_year > 2000),
  created_at   timestamptz not null default now(),
  unique(suggested_by, target_month, target_year)
);

-- ============================================================
-- SUGGESTION VOTES
-- ============================================================
create table if not exists suggestion_votes (
  id            uuid primary key default uuid_generate_v4(),
  suggestion_id uuid not null references book_suggestions(id) on delete cascade,
  user_id       uuid not null references profiles(id) on delete cascade,
  target_month  integer not null check (target_month between 1 and 12),
  target_year   integer not null check (target_year > 2000),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique(user_id, target_month, target_year)
);

drop trigger if exists suggestion_votes_updated_at on suggestion_votes;
create trigger suggestion_votes_updated_at
  before update on suggestion_votes
  for each row execute procedure set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table profiles          enable row level security;
alter table books              enable row level security;
alter table reading_progress   enable row level security;
alter table reviews            enable row level security;
alter table book_suggestions   enable row level security;
alter table suggestion_votes   enable row level security;

-- PROFILES
create policy "Authenticated users can read profiles"
  on profiles for select
  to authenticated
  using (true);

create policy "Users can update own profile"
  on profiles for update
  to authenticated
  using (auth.uid() = id);

-- BOOKS
create policy "Authenticated users can read books"
  on books for select
  to authenticated
  using (true);

-- READING PROGRESS
create policy "Authenticated users can read progress"
  on reading_progress for select
  to authenticated
  using (true);

create policy "Users can insert own progress"
  on reading_progress for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own progress"
  on reading_progress for update
  to authenticated
  using (auth.uid() = user_id);

-- REVIEWS
create policy "Authenticated users can read reviews"
  on reviews for select
  to authenticated
  using (true);

create policy "Users can insert own review"
  on reviews for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own review"
  on reviews for update
  to authenticated
  using (auth.uid() = user_id);

-- BOOK SUGGESTIONS
create policy "Authenticated users can read suggestions"
  on book_suggestions for select
  to authenticated
  using (true);

create policy "Users can insert own suggestion"
  on book_suggestions for insert
  to authenticated
  with check (auth.uid() = suggested_by);

create policy "Users can update own suggestion"
  on book_suggestions for update
  to authenticated
  using (auth.uid() = suggested_by);

-- SUGGESTION VOTES
create policy "Authenticated users can read votes"
  on suggestion_votes for select
  to authenticated
  using (true);

create policy "Users can insert own vote"
  on suggestion_votes for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own vote"
  on suggestion_votes for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can delete own vote"
  on suggestion_votes for delete
  to authenticated
  using (auth.uid() = user_id);

-- ============================================================
-- SEED DATA (demo book – replace with real data)
-- ============================================================
-- NOTE: Run this after creating your 4 user accounts.
-- Replace the suggested_by UUID with a real profile id.
--
-- insert into books (title, author, description, cover_url, month, year, is_current)
-- values (
--   'Das Ministerium für die Zukunft',
--   'Kim Stanley Robinson',
--   'Ein erschütternder und hoffnungsvoller Roman über den Klimawandel.',
--   'https://covers.openlibrary.org/b/id/10909258-L.jpg',
--   5, 2026, true
-- );
