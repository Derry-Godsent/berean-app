-- =====================================================================
-- Berean — initial backend schema (Supabase / PostgreSQL 15+)
--
-- Design rules
--   1. Every table has Row Level Security ON. Nothing is readable or
--      writable unless a policy below says so.
--   2. The client is untrusted. Anything that grants status, money,
--      roles or moderation is written only by service_role (Edge
--      Functions / webhooks) or by SECURITY DEFINER functions.
--   3. Pastors see AGGREGATES about their church, never an individual's
--      reading history unless the member opted in (share_progress).
--   4. "Day" columns are the reader's LOCAL calendar date, sent by the
--      client, so streaks respect time zones. The server only accepts
--      today ±1 to blunt trivial cheating.
--   5. Bible text itself is NOT stored here. Only references
--      (book, chapter, verse) are. Text ships with the app (KJV/WEB,
--      public domain) or comes from a licensed source.
--
-- Run:  supabase db reset      (local)   |   supabase db push   (hosted)
-- =====================================================================

create extension if not exists pgcrypto;
create extension if not exists citext;

-- ---------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------
create type public.church_role   as enum ('member', 'cell_leader', 'pastor', 'admin');
create type public.group_kind    as enum ('cell', 'family', 'friends', 'public');
create type public.channel_kind  as enum ('global', 'season', 'verse', 'group', 'church');
create type public.content_state as enum ('draft', 'review', 'published', 'archived');
create type public.report_status as enum ('open', 'actioned', 'dismissed');
create type public.age_band      as enum ('13_17', '18_plus');
create type public.reaction_kind as enum ('pray', 'fire', 'heart');
create type public.game_kind     as enum ('wordle', 'trivia', 'timeline', 'verse_match', 'live_quiz');

-- ---------------------------------------------------------------------
-- Helpers that don't depend on tables
-- ---------------------------------------------------------------------
create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------------------------------------------------------------------
-- Identity
-- ---------------------------------------------------------------------
create table public.profiles (
  id             uuid primary key references auth.users (id) on delete cascade,
  handle         citext unique check (handle ~ '^[a-z0-9_]{3,24}$'),
  display_name   text not null default 'Friend' check (char_length(display_name) between 1 and 60),
  avatar_url     text,
  city           text check (char_length(city) <= 80),
  country_code   char(2),
  locale         text not null default 'en',
  translation    text not null default 'kjv',
  goal           text check (goal in ('consistency', 'returning', 'exploring', 'deeper')),
  age_band       public.age_band not null default '18_plus',
  church_id      uuid,                       -- FK added after churches exists
  share_progress boolean not null default false, -- opt-in: let my pastor/leader see MY activity
  deleted_at     timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

-- Clients may edit their own profile, but not the fields that carry trust.
create or replace function public.profiles_guard() returns trigger
language plpgsql as $$
begin
  if current_user = 'authenticated' then      -- PostgREST/JWT requests; definer functions & service_role pass
    new.church_id  := old.church_id;
    new.deleted_at := old.deleted_at;
    new.age_band   := old.age_band;
  end if;
  return new;
end $$;
create trigger profiles_guard before update on public.profiles
  for each row execute function public.profiles_guard();

-- Create a profile row automatically for every new auth user.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(nullif(new.raw_user_meta_data ->> 'name', ''), 'Friend'))
  on conflict (id) do nothing;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Platform staff (you, and later trusted moderators / content editors).
create table public.app_staff (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role    text not null check (role in ('admin', 'editor', 'moderator')),
  created_at timestamptz not null default now()
);

create or replace function public.staff_role() returns text
language sql stable security definer set search_path = public as $$
  select role from public.app_staff where user_id = auth.uid()
$$;

create or replace function public.is_staff(roles text[] default array['admin','editor','moderator'])
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.staff_role() = any (roles), false)
$$;

-- ---------------------------------------------------------------------
-- Churches & groups
-- ---------------------------------------------------------------------
create table public.churches (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (char_length(name) between 2 and 120),
  slug       citext unique not null check (slug ~ '^[a-z0-9-]{3,40}$'),
  city       text,
  country_code char(2),
  join_code  text unique not null default upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 8)),
  plan       text not null default 'free' check (plan in ('free', 'congregation', 'network')),
  plan_until timestamptz,                    -- written by billing webhook only
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.profiles
  add constraint profiles_church_fk foreign key (church_id)
  references public.churches (id) on delete set null;

create table public.church_members (
  church_id uuid not null references public.churches (id) on delete cascade,
  user_id   uuid not null references auth.users (id) on delete cascade,
  role      public.church_role not null default 'member',
  joined_at timestamptz not null default now(),
  primary key (church_id, user_id)
);
create index church_members_user_idx on public.church_members (user_id);

create table public.groups (
  id           uuid primary key default gen_random_uuid(),
  church_id    uuid references public.churches (id) on delete cascade,
  kind         public.group_kind not null default 'cell',
  name         text not null check (char_length(name) between 2 and 80),
  meeting_info text check (char_length(meeting_info) <= 200),
  invite_code  text unique not null default upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 8)),
  created_by   uuid not null references auth.users (id) on delete cascade,
  created_at   timestamptz not null default now()
);

create table public.group_members (
  group_id  uuid not null references public.groups (id) on delete cascade,
  user_id   uuid not null references auth.users (id) on delete cascade,
  is_leader boolean not null default false,
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);
create index group_members_user_idx on public.group_members (user_id);

-- Membership helpers (SECURITY DEFINER so RLS policies can call them
-- without recursing into the tables they protect).
create or replace function public.is_group_member(gid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.group_members where group_id = gid and user_id = auth.uid())
$$;

create or replace function public.is_group_leader(gid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.group_members where group_id = gid and user_id = auth.uid() and is_leader)
$$;

create or replace function public.church_role_of(cid uuid) returns public.church_role
language sql stable security definer set search_path = public as $$
  select role from public.church_members where church_id = cid and user_id = auth.uid()
$$;

create or replace function public.is_church_staff(cid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(public.church_role_of(cid) in ('pastor', 'admin'), false)
$$;

-- Joining a group needs the secret invite code, so it goes through a function
-- rather than an open INSERT policy.
create or replace function public.join_group(p_code text) returns uuid
language plpgsql security definer set search_path = public as $$
declare gid uuid;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  select id into gid from public.groups where invite_code = upper(trim(p_code));
  if gid is null then raise exception 'invalid invite code'; end if;
  insert into public.group_members (group_id, user_id) values (gid, auth.uid())
  on conflict do nothing;
  return gid;
end $$;

-- Churches: creating one makes you its admin; joining needs the church's code.
-- Promoting someone to 'pastor' is done by a church admin (UPDATE on church_members).
-- Later, "verified church" status is a manual/Edge-Function step, not a client right.
create or replace function public.create_church(p_name text, p_slug text, p_city text default null,
                                                p_country char(2) default null)
returns public.churches language plpgsql security definer set search_path = public as $$
declare c public.churches;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  insert into public.churches (name, slug, city, country_code, created_by)
  values (p_name, p_slug, p_city, p_country, auth.uid()) returning * into c;
  insert into public.church_members (church_id, user_id, role) values (c.id, auth.uid(), 'admin');
  return c;
end $$;

create or replace function public.join_church(p_code text) returns uuid
language plpgsql security definer set search_path = public as $$
declare cid uuid;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  select id into cid from public.churches where join_code = upper(trim(p_code));
  if cid is null then raise exception 'invalid church code'; end if;
  insert into public.church_members (church_id, user_id) values (cid, auth.uid())
  on conflict do nothing;
  return cid;
end $$;

-- Creating a group also makes the creator its leader (atomic).
create or replace function public.create_group(p_name text, p_kind public.group_kind default 'cell',
                                               p_church uuid default null, p_meeting text default null)
returns public.groups language plpgsql security definer set search_path = public as $$
declare g public.groups;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  if p_church is not null and public.church_role_of(p_church) is null then
    raise exception 'not a member of that church';
  end if;
  insert into public.groups (name, kind, church_id, meeting_info, created_by)
  values (p_name, p_kind, p_church, p_meeting, auth.uid()) returning * into g;
  insert into public.group_members (group_id, user_id, is_leader) values (g.id, auth.uid(), true);
  return g;
end $$;

-- ---------------------------------------------------------------------
-- Content: seasons ("the Bible as a series") and episodes
-- ---------------------------------------------------------------------
create table public.seasons (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  n            int  not null,
  locale       text not null default 'en',
  title        text not null,
  tagline      text,
  poster_path  text,                       -- Supabase Storage / CDN path
  gradient     text,
  genre        text,
  state        public.content_state not null default 'draft',
  premiere_at  timestamptz,
  sponsor_name text,                       -- "Season sponsored by ..." (see funding plan)
  created_by   uuid references auth.users (id) on delete set null,
  published_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (locale, n)
);
create trigger seasons_touch before update on public.seasons
  for each row execute function public.touch_updated_at();

create table public.episodes (
  id          uuid primary key default gen_random_uuid(),
  season_id   uuid not null references public.seasons (id) on delete cascade,
  n           int  not null,
  title       text not null,
  book_id     text not null,               -- USFM-style id: GEN, MAT, 1TI ...
  chapter     int  not null check (chapter > 0),
  verse_start int,
  verse_end   int,
  minutes     int  not null default 5 check (minutes between 1 and 60),
  synopsis    text not null,
  next_time   text,
  -- Optional "cinematic" beats: [{ "from":1,"to":5,"caption":"...","media":"path","mood":"dawn" }]
  scenes      jsonb not null default '[]'::jsonb,
  state       public.content_state not null default 'draft',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (season_id, n)
);
create trigger episodes_touch before update on public.episodes
  for each row execute function public.touch_updated_at();
create index episodes_book_idx on public.episodes (book_id, chapter);

-- ---------------------------------------------------------------------
-- Personal reading data
-- ---------------------------------------------------------------------
create table public.reading_progress (
  user_id       uuid not null references auth.users (id) on delete cascade,
  book_id       text not null,
  chapter       int  not null check (chapter > 0),
  first_read_at timestamptz not null default now(),
  primary key (user_id, book_id, chapter)
);

create table public.episode_progress (
  user_id      uuid not null references auth.users (id) on delete cascade,
  episode_id   uuid not null references public.episodes (id) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (user_id, episode_id)
);

create table public.reading_days (
  user_id uuid not null references auth.users (id) on delete cascade,
  day     date not null,
  minutes int  not null default 0 check (minutes between 0 and 600),
  primary key (user_id, day)
);

create table public.highlights (
  user_id    uuid not null references auth.users (id) on delete cascade,
  ref_key    text not null,               -- "MAT.6.21"
  color      text not null check (color in ('gold', 'sage', 'ember')),
  created_at timestamptz not null default now(),
  primary key (user_id, ref_key)
);

create table public.notes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  ref_key    text not null,
  body       text not null check (char_length(body) between 1 and 8000),
  group_id   uuid references public.groups (id) on delete set null, -- non-null = shared with that group
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger notes_touch before update on public.notes
  for each row execute function public.touch_updated_at();
create index notes_user_idx on public.notes (user_id, ref_key);

create table public.saved_questions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  question   text not null check (char_length(question) <= 1200),
  answer     text,
  ref_key    text,
  created_at timestamptz not null default now()
);

-- Record a finished chapter / episode. One call = progress + today's streak day.
create or replace function public.log_reading(
  p_book text, p_chapter int, p_minutes int default 0,
  p_day date default current_date, p_episode uuid default null
) returns void language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not authenticated'; end if;
  if p_day not between current_date - 1 and current_date + 1 then
    raise exception 'day out of range';
  end if;
  insert into public.reading_progress (user_id, book_id, chapter)
  values (uid, p_book, p_chapter) on conflict do nothing;
  insert into public.reading_days (user_id, day, minutes)
  values (uid, p_day, least(greatest(p_minutes, 0), 600))
  on conflict (user_id, day) do update
    set minutes = least(public.reading_days.minutes + excluded.minutes, 600);
  if p_episode is not null then
    insert into public.episode_progress (user_id, episode_id) values (uid, p_episode)
    on conflict do nothing;
  end if;
end $$;

-- Consecutive-day streak. Today may still be "open": a streak that ended
-- yesterday is still alive until the reader's day is over.
create or replace function public.shares_group_with(other uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.group_members a
    join public.group_members b on b.group_id = a.group_id
    where a.user_id = auth.uid() and b.user_id = other)
$$;

create or replace function public.current_streak(p_user uuid default auth.uid())
returns int language sql stable security definer set search_path = public as $$
  with d as (
    select day,
           row_number() over (order by day desc) as rn,
           day + (row_number() over (order by day desc))::int as grp
    from public.reading_days
    where user_id = p_user and day <= current_date + 1
      and (p_user = auth.uid() or auth.uid() is null   -- null = server-side/cron context
           or public.shares_group_with(p_user))
  )
  select coalesce((
    select count(*) from d
    where grp = (select grp from d where rn = 1)
      and (select day from d where rn = 1) >= current_date - 1
  ), 0)::int
$$;
revoke execute on function public.current_streak(uuid) from public, anon;
grant  execute on function public.current_streak(uuid) to authenticated, service_role;

-- ---------------------------------------------------------------------
-- Community: channels, messages, reactions, prayer
-- ---------------------------------------------------------------------
create table public.channels (
  id        uuid primary key default gen_random_uuid(),
  kind      public.channel_kind not null,
  slug      text,                          -- 'room', 's2', 'JHN.3.16' ...
  name      text not null,
  season_id uuid references public.seasons (id) on delete cascade,
  group_id  uuid references public.groups (id) on delete cascade,
  church_id uuid references public.churches (id) on delete cascade,
  created_at timestamptz not null default now(),
  check ((kind = 'group')  = (group_id  is not null)),
  check ((kind = 'church') = (church_id is not null)),
  unique nulls not distinct (kind, slug, group_id, church_id)
);

create or replace function public.can_read_channel(cid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.channels c
    where c.id = cid and (
      c.kind in ('global', 'season', 'verse')
      or (c.kind = 'group'  and public.is_group_member(c.group_id))
      or (c.kind = 'church' and public.church_role_of(c.church_id) is not null)
    )
  )
$$;

create table public.messages (
  id         uuid primary key default gen_random_uuid(),
  channel_id uuid not null references public.channels (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  body       text not null check (char_length(btrim(body)) between 1 and 2000),
  reply_to   uuid references public.messages (id) on delete set null,
  hidden     boolean not null default false,    -- set by moderators
  created_at timestamptz not null default now(),
  edited_at  timestamptz,
  deleted_at timestamptz
);
create index messages_channel_idx on public.messages (channel_id, created_at desc);
create index messages_user_idx on public.messages (user_id, created_at desc);

-- Basic anti-flood: max 20 messages per rolling minute per user.
create or replace function public.messages_rate_limit() returns trigger
language plpgsql as $$
begin
  if (select count(*) from public.messages
        where user_id = new.user_id and created_at > now() - interval '1 minute') >= 20 then
    raise exception 'slow down — too many messages' using errcode = 'P0001';
  end if;
  return new;
end $$;
create trigger messages_rate before insert on public.messages
  for each row execute function public.messages_rate_limit();

-- Authors may edit their text; only moderators may change visibility or identity fields.
create or replace function public.messages_guard() returns trigger
language plpgsql as $$
begin
  if current_user = 'authenticated' and not public.is_staff(array['admin', 'moderator']) then
    new.hidden     := old.hidden;
    new.user_id    := old.user_id;
    new.channel_id := old.channel_id;
    new.created_at := old.created_at;
    if new.body is distinct from old.body then new.edited_at := now(); end if;
  end if;
  return new;
end $$;
create trigger messages_guard before update on public.messages
  for each row execute function public.messages_guard();

create table public.reactions (
  message_id uuid not null references public.messages (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  kind       public.reaction_kind not null,
  created_at timestamptz not null default now(),
  primary key (message_id, user_id, kind)
);

create table public.prayer_requests (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  group_id   uuid not null references public.groups (id) on delete cascade,
  body       text not null check (char_length(btrim(body)) between 1 and 1000),
  anonymous  boolean not null default false,
  answered   boolean not null default false,
  created_at timestamptz not null default now()
);
create index prayer_group_idx on public.prayer_requests (group_id, created_at desc);

create or replace function public.is_prayer_visible(rid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.prayer_requests r
                 where r.id = rid and public.is_group_member(r.group_id))
$$;


create table public.prayer_events (
  request_id uuid not null references public.prayer_requests (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (request_id, user_id)
);

-- Group members read prayer through this view so an ANONYMOUS request never
-- exposes its author, even to someone inspecting the raw API response.
create or replace view public.prayer_feed with (security_invoker = false) as
select r.id, r.group_id, r.body, r.anonymous, r.answered, r.created_at,
       case when r.anonymous then null else r.user_id end as user_id,
       (select count(*) from public.prayer_events e where e.request_id = r.id)::int as praying
from public.prayer_requests r
where public.is_group_member(r.group_id);
grant select on public.prayer_feed to authenticated;

-- ---------------------------------------------------------------------
-- Safety: blocks, reports (required by Apple 1.2 and Google UGC policy)
-- ---------------------------------------------------------------------
create table public.blocks (
  blocker_id uuid not null references auth.users (id) on delete cascade,
  blocked_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

create table public.reports (
  id          uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users (id) on delete cascade,
  message_id  uuid references public.messages (id) on delete set null,
  target_user uuid references auth.users (id) on delete set null,
  reason      text not null check (reason in ('spam', 'harassment', 'hate', 'sexual', 'self_harm', 'false_teaching', 'other')),
  detail      text check (char_length(detail) <= 1000),
  status      public.report_status not null default 'open',
  handled_by  uuid references auth.users (id) on delete set null,
  created_at  timestamptz not null default now(),
  check (message_id is not null or target_user is not null)
);
create index reports_open_idx on public.reports (status, created_at);

-- ---------------------------------------------------------------------
-- Games & quizzes
-- ---------------------------------------------------------------------
create table public.quiz_sets (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null references auth.users (id) on delete cascade,
  church_id  uuid references public.churches (id) on delete cascade,
  group_id   uuid references public.groups (id) on delete cascade,
  title      text not null check (char_length(title) between 2 and 120),
  visibility text not null default 'private' check (visibility in ('private', 'group', 'church', 'public')),
  created_at timestamptz not null default now()
);

create table public.quiz_questions (
  id           uuid primary key default gen_random_uuid(),
  set_id       uuid not null references public.quiz_sets (id) on delete cascade,
  position     int  not null default 0,
  prompt       text not null,
  options      jsonb not null check (jsonb_typeof(options) = 'array' and jsonb_array_length(options) between 2 and 6),
  answer_index int  not null check (answer_index >= 0),
  ref_key      text,
  explanation  text
);
create index quiz_questions_set_idx on public.quiz_questions (set_id, position);

create or replace function public.can_read_quiz(sid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.quiz_sets q where q.id = sid and (
      q.owner_id = auth.uid()
      or q.visibility = 'public'
      or (q.visibility = 'group'  and q.group_id  is not null and public.is_group_member(q.group_id))
      or (q.visibility = 'church' and q.church_id is not null and public.church_role_of(q.church_id) is not null)
    )
  )
$$;

-- Daily challenge content (the "word of the day", trivia of the day ...)
create table public.daily_challenges (
  day     date not null,
  game    public.game_kind not null,
  payload jsonb not null,
  primary key (day, game)
);

create table public.game_scores (
  id       uuid primary key default gen_random_uuid(),
  user_id  uuid not null references auth.users (id) on delete cascade,
  game     public.game_kind not null,
  day      date not null default current_date,
  score    int  not null check (score between 0 and 100000),
  meta     jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, game, day)              -- one ranked result per game per day
);
create index game_scores_board_idx on public.game_scores (game, day, score desc);

-- Live (Kahoot-style) quiz for a cell group or a Sunday-school class.
create table public.live_sessions (
  id          uuid primary key default gen_random_uuid(),
  set_id      uuid not null references public.quiz_sets (id) on delete cascade,
  host_id     uuid not null references auth.users (id) on delete cascade,
  join_code   text unique not null default upper(substr(encode(gen_random_bytes(4), 'hex'), 1, 6)),
  status      text not null default 'lobby' check (status in ('lobby', 'running', 'finished')),
  question_ix int  not null default 0,
  created_at  timestamptz not null default now()
);

create table public.live_players (
  session_id uuid not null references public.live_sessions (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  nickname   text not null check (char_length(nickname) between 1 and 24),
  score      int  not null default 0,
  primary key (session_id, user_id)
);

create or replace function public.is_live_host(sid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.live_sessions where id = sid and host_id = auth.uid())
$$;
create or replace function public.is_live_player(sid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.live_players where session_id = sid and user_id = auth.uid())
$$;


-- ---------------------------------------------------------------------
-- Pastor workspace
-- ---------------------------------------------------------------------
create table public.sermons (
  id          uuid primary key default gen_random_uuid(),
  church_id   uuid not null references public.churches (id) on delete cascade,
  author_id   uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title       text not null,
  main_ref    text not null,               -- "PHP.4.4-9"
  big_idea    text,
  outline     jsonb not null default '[]'::jsonb,  -- points, refs, applications
  cell_questions jsonb not null default '[]'::jsonb,
  reading_plan   jsonb not null default '[]'::jsonb, -- Mon..Sat passages for the week
  state       public.content_state not null default 'draft',
  preached_on date,
  published_at timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create trigger sermons_touch before update on public.sermons
  for each row execute function public.touch_updated_at();
create index sermons_church_idx on public.sermons (church_id, preached_on desc);

-- ---------------------------------------------------------------------
-- Funding & entitlements (written ONLY by webhooks / service_role)
-- ---------------------------------------------------------------------
create table public.donations (
  id           uuid primary key default gen_random_uuid(),
  provider     text not null,              -- 'kofi' | 'paystack' | 'paypal' | 'revenuecat' | 'manual'
  provider_ref text not null,
  amount_minor bigint not null check (amount_minor > 0),
  currency     char(3) not null,
  amount_usd_minor bigint,                 -- snapshot for the public meter
  recurring    boolean not null default false,
  donor_name   text,
  message      text,
  show_publicly boolean not null default false,
  user_id      uuid references auth.users (id) on delete set null,
  created_at   timestamptz not null default now(),
  unique (provider, provider_ref)
);

create table public.funding_goals (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text,
  target_usd_minor bigint not null check (target_usd_minor > 0),
  period       text not null default 'monthly' check (period in ('monthly', 'once')),
  active       boolean not null default true,
  created_at   timestamptz not null default now()
);

create table public.entitlements (
  user_id    uuid not null references auth.users (id) on delete cascade,
  key        text not null,                -- 'supporter', 'plus'
  source     text not null,                -- 'revenuecat' | 'church' | 'grant' | 'donation'
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (user_id, key)
);

-- Public, privacy-safe view for the transparency meter and supporters wall.
create or replace view public.funding_public
with (security_invoker = false) as
select
  g.id as goal_id,
  g.title,
  g.target_usd_minor,
  g.period,
  coalesce((
    select sum(d.amount_usd_minor) from public.donations d
    where d.amount_usd_minor is not null
      and (g.period = 'once' or d.created_at >= date_trunc('month', now()))
  ), 0)::bigint as raised_usd_minor,
  (select count(distinct coalesce(d.user_id::text, d.provider || d.provider_ref))
     from public.donations d
     where g.period = 'once' or d.created_at >= date_trunc('month', now())) as supporters
from public.funding_goals g
where g.active;

create or replace view public.supporters_wall
with (security_invoker = false) as
select coalesce(nullif(btrim(donor_name), ''), 'A friend') as name, message, created_at
from public.donations
where show_publicly
order by created_at desc
limit 200;

-- Push notification tokens
create table public.push_tokens (
  user_id  uuid not null references auth.users (id) on delete cascade,
  token    text not null,
  platform text not null check (platform in ('ios', 'android', 'web')),
  tz       text,                           -- IANA zone, for "remind me at 7pm my time"
  remind_at time,
  created_at timestamptz not null default now(),
  primary key (user_id, token)
);

-- ---------------------------------------------------------------------
-- Church insights — aggregates only, gated to pastors/admins.
-- A member appears in "active" counts only if they opted in (share_progress).
-- Numbers under 5 are suppressed so a tiny church can't identify people.
-- ---------------------------------------------------------------------
create or replace function public.church_weekly_stats(p_church uuid)
returns table (members int, sharing int, active_sharing int, chapters_read int, minutes int)
language plpgsql stable security definer set search_path = public as $$
declare
  m int; s int; a int; c int; mins int;
begin
  if not public.is_church_staff(p_church) then
    raise exception 'not allowed';
  end if;
  select count(*) into m from public.church_members where church_id = p_church;
  select count(*) into s from public.church_members cm
    join public.profiles p on p.id = cm.user_id
    where cm.church_id = p_church and p.share_progress;
  select count(distinct rd.user_id), coalesce(sum(rd.minutes), 0)
    into a, mins
    from public.reading_days rd
    join public.church_members cm on cm.user_id = rd.user_id and cm.church_id = p_church
    join public.profiles p on p.id = rd.user_id and p.share_progress
    where rd.day >= current_date - 6;
  select count(*) into c
    from public.reading_progress rp
    join public.church_members cm on cm.user_id = rp.user_id and cm.church_id = p_church
    join public.profiles p on p.id = rp.user_id and p.share_progress
    where rp.first_read_at >= now() - interval '7 days';
  if s < 5 then a := null; c := null; mins := null; end if;
  return query select m, s, a, c, mins;
end $$;

-- ---------------------------------------------------------------------
-- Account deletion (Apple 5.1.1(v) / Google account-deletion policy).
-- Anonymises public content immediately; an Edge Function then removes
-- the auth.users row, which cascades everything private.
-- ---------------------------------------------------------------------
create or replace function public.request_account_deletion() returns void
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not authenticated'; end if;
  update public.messages set body = '[deleted]', deleted_at = now() where user_id = uid;
  delete from public.prayer_requests where user_id = uid;
  delete from public.notes where user_id = uid;
  delete from public.push_tokens where user_id = uid;
  update public.profiles
     set display_name = 'Deleted user', handle = null, avatar_url = null, city = null,
         church_id = null, share_progress = false, deleted_at = now()
   where id = uid;
end $$;

-- =====================================================================
-- Row Level Security
-- =====================================================================
alter table public.profiles         enable row level security;
alter table public.app_staff        enable row level security;
alter table public.churches         enable row level security;
alter table public.church_members   enable row level security;
alter table public.groups           enable row level security;
alter table public.group_members    enable row level security;
alter table public.seasons          enable row level security;
alter table public.episodes         enable row level security;
alter table public.reading_progress enable row level security;
alter table public.episode_progress enable row level security;
alter table public.reading_days     enable row level security;
alter table public.highlights       enable row level security;
alter table public.notes            enable row level security;
alter table public.saved_questions  enable row level security;
alter table public.channels         enable row level security;
alter table public.messages         enable row level security;
alter table public.reactions        enable row level security;
alter table public.prayer_requests  enable row level security;
alter table public.prayer_events    enable row level security;
alter table public.blocks           enable row level security;
alter table public.reports          enable row level security;
alter table public.quiz_sets        enable row level security;
alter table public.quiz_questions   enable row level security;
alter table public.daily_challenges enable row level security;
alter table public.game_scores      enable row level security;
alter table public.live_sessions    enable row level security;
alter table public.live_players     enable row level security;
alter table public.sermons          enable row level security;
alter table public.donations        enable row level security;
alter table public.funding_goals    enable row level security;
alter table public.entitlements     enable row level security;
alter table public.push_tokens      enable row level security;

-- profiles: any signed-in user can read basic public profile fields;
-- you can only change your own, and never your own church_id (use join flow).
create policy profiles_read on public.profiles for select to authenticated
  using (deleted_at is null or id = auth.uid());
create policy profiles_update_own on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- staff: nobody reads or writes from the client (service_role only).
-- (RLS on with zero policies = deny all.)

-- churches
create policy churches_read on public.churches for select to authenticated using (true);
-- The join code is a secret: hide the column from everyone (staff read it via church_join_code()).
revoke select on public.churches from authenticated;
grant  select (id, name, slug, city, country_code, plan, plan_until, created_by, created_at)
  on public.churches to authenticated;
create or replace function public.church_join_code(p_church uuid) returns text
language sql stable security definer set search_path = public as $$
  select join_code from public.churches where id = p_church and public.is_church_staff(p_church)
$$;
create policy churches_update on public.churches for update to authenticated
  using (public.is_church_staff(id)) with check (public.is_church_staff(id));

create policy church_members_read on public.church_members for select to authenticated
  using (user_id = auth.uid() or public.church_role_of(church_id) is not null);
create policy church_members_leave on public.church_members for delete to authenticated
  using (user_id = auth.uid() or public.is_church_staff(church_id));
create policy church_members_manage on public.church_members for update to authenticated
  using (public.is_church_staff(church_id)) with check (public.is_church_staff(church_id));
-- No INSERT policy: people enter through join_church() / create_church().

-- groups
create policy groups_read on public.groups for select to authenticated
  using (public.is_group_member(id) or kind = 'public');
create policy groups_update on public.groups for update to authenticated
  using (public.is_group_leader(id)) with check (public.is_group_leader(id));
create policy groups_delete on public.groups for delete to authenticated
  using (created_by = auth.uid());
create policy group_members_read on public.group_members for select to authenticated
  using (public.is_group_member(group_id));
create policy group_members_leave on public.group_members for delete to authenticated
  using (user_id = auth.uid() or public.is_group_leader(group_id));

-- seasons / episodes: readers see only published; staff editors see all.
create policy seasons_read on public.seasons for select to anon, authenticated
  using (state = 'published' or public.is_staff(array['admin', 'editor']));
create policy seasons_write on public.seasons for all to authenticated
  using (public.is_staff(array['admin', 'editor'])) with check (public.is_staff(array['admin', 'editor']));
create policy episodes_read on public.episodes for select to anon, authenticated
  using (state = 'published' or public.is_staff(array['admin', 'editor']));
create policy episodes_write on public.episodes for all to authenticated
  using (public.is_staff(array['admin', 'editor'])) with check (public.is_staff(array['admin', 'editor']));

-- personal data: strictly own rows
create policy rp_own on public.reading_progress for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy ep_own on public.episode_progress for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy rd_own on public.reading_days for select to authenticated
  using (user_id = auth.uid());        -- writes go through log_reading()
create policy hl_own on public.highlights for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy sq_own on public.saved_questions for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy notes_read on public.notes for select to authenticated
  using (user_id = auth.uid() or (group_id is not null and public.is_group_member(group_id)));
create policy notes_write on public.notes for insert to authenticated
  with check (user_id = auth.uid() and (group_id is null or public.is_group_member(group_id)));
create policy notes_update on public.notes for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid() and (group_id is null or public.is_group_member(group_id)));
create policy notes_delete on public.notes for delete to authenticated
  using (user_id = auth.uid());

-- community
create policy channels_read on public.channels for select to authenticated
  using (public.can_read_channel(id));

create policy messages_read on public.messages for select to authenticated
  using (
    public.can_read_channel(channel_id)
    and (hidden = false or user_id = auth.uid() or public.is_staff(array['admin', 'moderator']))
    and not exists (
      select 1 from public.blocks b
      where b.blocker_id = auth.uid() and b.blocked_id = messages.user_id
    )
  );
create policy messages_insert on public.messages for insert to authenticated
  with check (
    user_id = auth.uid()
    and public.can_read_channel(channel_id)
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.deleted_at is null)
  );
create policy messages_edit_own on public.messages for update to authenticated
  using (user_id = auth.uid() and deleted_at is null)
  with check (user_id = auth.uid());
create policy messages_mod on public.messages for update to authenticated
  using (public.is_staff(array['admin', 'moderator']))
  with check (public.is_staff(array['admin', 'moderator']));

create policy reactions_read on public.reactions for select to authenticated
  using (exists (select 1 from public.messages m where m.id = message_id));   -- inherits messages RLS
create policy reactions_write on public.reactions for insert to authenticated
  with check (user_id = auth.uid()
              and exists (select 1 from public.messages m where m.id = message_id));
create policy reactions_delete on public.reactions for delete to authenticated
  using (user_id = auth.uid());

create policy prayer_read on public.prayer_requests for select to authenticated
  using (user_id = auth.uid());     -- everyone else reads via prayer_feed
create policy prayer_write on public.prayer_requests for insert to authenticated
  with check (user_id = auth.uid() and public.is_group_member(group_id));
create policy prayer_update on public.prayer_requests for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy prayer_delete on public.prayer_requests for delete to authenticated
  using (user_id = auth.uid() or public.is_group_leader(group_id));
create policy pe_read on public.prayer_events for select to authenticated
  using (user_id = auth.uid());      -- counts come from prayer_feed
create policy pe_write on public.prayer_events for insert to authenticated
  with check (user_id = auth.uid() and public.is_prayer_visible(request_id));

-- safety
create policy blocks_own on public.blocks for all to authenticated
  using (blocker_id = auth.uid()) with check (blocker_id = auth.uid());
create policy reports_create on public.reports for insert to authenticated
  with check (reporter_id = auth.uid());
create policy reports_read_mod on public.reports for select to authenticated
  using (reporter_id = auth.uid() or public.is_staff(array['admin', 'moderator']));
create policy reports_mod_update on public.reports for update to authenticated
  using (public.is_staff(array['admin', 'moderator']))
  with check (public.is_staff(array['admin', 'moderator']));

-- quizzes & games
create policy qs_read on public.quiz_sets for select to authenticated
  using (public.can_read_quiz(id));
create policy qs_write on public.quiz_sets for all to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy qq_read on public.quiz_questions for select to authenticated
  using (public.can_read_quiz(set_id));
create policy qq_write on public.quiz_questions for all to authenticated
  using (exists (select 1 from public.quiz_sets s where s.id = set_id and s.owner_id = auth.uid()))
  with check (exists (select 1 from public.quiz_sets s where s.id = set_id and s.owner_id = auth.uid()));
create policy dc_read on public.daily_challenges for select to anon, authenticated
  using (day <= current_date);
create policy gs_read on public.game_scores for select to authenticated using (true);  -- leaderboards
-- NOTE: client-reported scores are fine for friendly leaderboards. Anything with
-- prizes or public rankings must be scored by an Edge Function that holds the answers.
create policy gs_insert on public.game_scores for insert to authenticated
  with check (user_id = auth.uid() and day between current_date - 1 and current_date + 1);
create policy ls_read on public.live_sessions for select to authenticated
  using (host_id = auth.uid() or public.is_live_player(id));
create policy ls_host on public.live_sessions for all to authenticated
  using (host_id = auth.uid()) with check (host_id = auth.uid());
create policy lp_read on public.live_players for select to authenticated
  using (user_id = auth.uid() or public.is_live_host(session_id));
-- Players join and score via Edge Function (server-verified answers).

-- pastor workspace
create policy sermons_staff on public.sermons for all to authenticated
  using (public.is_church_staff(church_id)) with check (public.is_church_staff(church_id));
create policy sermons_members on public.sermons for select to authenticated
  using (state = 'published' and public.church_role_of(church_id) is not null);

-- funding: clients can read active goals; everything else is service_role.
create policy goals_read on public.funding_goals for select to anon, authenticated using (active);
-- donations, entitlements: RLS on, no client policy for donations (deny-all).
create policy ent_read_own on public.entitlements for select to authenticated using (user_id = auth.uid());

create policy push_own on public.push_tokens for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Public views are readable by everyone (they contain no personal data).
grant select on public.funding_public, public.supporters_wall to anon, authenticated;

-- Realtime: only the tables that need live push.
-- (Supabase creates the publication; guard so local resets don't fail.)
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.messages, public.reactions,
      public.prayer_requests, public.live_sessions, public.live_players;
  end if;
end $$;
