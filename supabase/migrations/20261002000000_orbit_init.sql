-- Orbit v1: birthdays, the birthday checklist and gift ideas.
--
-- Orbit shares a Supabase project with the other personal apps (Kept lives in `public`). Everything
-- here is created inside the `orbit` schema; outside it, this only reads auth.users (foreign keys)
-- and calls auth.uid(). It changes nothing in `public` or any other schema.
--
-- Before running: back up (there's no point-in-time restore on the free plan), e.g.
--   supabase db dump --db-url "<session pooler URL>" -f backup-YYYY-MM-DD.sql
-- Run it once, as a whole, in the SQL editor. It's one transaction: it applies fully or not at all.
-- After running: add `orbit` to Project Settings → Data API → Exposed schemas, then seed yourself
-- into orbit.allowed_users (supabase/seed-allowed-user.sql).
-- To undo completely: drop schema orbit cascade;

begin;

create schema orbit;

grant usage on schema orbit to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------------------------
-- Who may use Orbit. Being signed in isn't enough: the auth pool is shared with Kept's users.
-- Rows are added by hand in the SQL editor; no policy lets anyone add themselves.
-- ---------------------------------------------------------------------------------------------

create table orbit.allowed_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table orbit.allowed_users enable row level security;

-- Each person can see whether they themselves are allowed (the app's "no access" check).
create policy allowed_users_read_self on orbit.allowed_users
  for select to authenticated
  using (user_id = (select auth.uid()));

-- Whether the caller is in allowed_users. SECURITY DEFINER so the policies below can ask without
-- the question itself going through allowed_users' RLS.
create function orbit.is_allowed()
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (select 1 from orbit.allowed_users where user_id = (select auth.uid()))
$$;

-- ---------------------------------------------------------------------------------------------
-- People and their birthdays. The year is often unknown. Feb 29 is a valid birthday (it shows on
-- Feb 28 in other years); Apr 31 isn't.
-- ---------------------------------------------------------------------------------------------

create table orbit.people (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  birth_month integer not null,
  birth_day integer not null,
  birth_year integer,
  relationship text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Target of the (person_id, user_id) keys below, so a log row or gift idea can only point at a
  -- person with the same owner.
  constraint people_id_user_unique unique (id, user_id),
  constraint people_name_not_blank check (btrim(name) <> ''),
  constraint people_birth_month_range check (birth_month between 1 and 12),
  constraint people_birth_day_valid check (
    birth_day between 1 and case when birth_month = 2 then 29 when birth_month in (4, 6, 9, 11) then 30 else 31 end
  ),
  constraint people_birth_year_range check (birth_year between 1900 and 2100),
  constraint people_feb29_leap_year check (
    not (birth_month = 2 and birth_day = 29)
    or birth_year is null
    or (birth_year % 4 = 0 and (birth_year % 100 <> 0 or birth_year % 400 = 0))
  )
);

create index people_user_birthday_idx on orbit.people (user_id, birth_month, birth_day);

-- One row per person per birthday year: what was done for it. `year` is the year of the birthday
-- itself, so greeting a Dec 30 birthday on Jan 2 still counts for the year before.
create table orbit.birthday_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  person_id uuid not null,
  year integer not null,
  greeted boolean not null default false,
  prayed boolean not null default false,
  gifted boolean not null default false,
  celebrated boolean not null default false,
  gift_note text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint birthday_log_person_fk foreign key (person_id, user_id)
    references orbit.people (id, user_id) on delete cascade,
  constraint birthday_log_person_year_unique unique (person_id, year),
  constraint birthday_log_year_range check (year between 1900 and 2100)
);

create table orbit.gift_ideas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  person_id uuid not null,
  idea text not null,
  given boolean not null default false,
  created_at timestamptz not null default now(),
  constraint gift_ideas_person_fk foreign key (person_id, user_id)
    references orbit.people (id, user_id) on delete cascade,
  constraint gift_ideas_idea_not_blank check (btrim(idea) <> '')
);

create index gift_ideas_person_idx on orbit.gift_ideas (person_id);

-- ---------------------------------------------------------------------------------------------
-- RLS: a row is yours to see or change only if you're in allowed_users AND you own it.
-- ---------------------------------------------------------------------------------------------

alter table orbit.people enable row level security;
alter table orbit.birthday_log enable row level security;
alter table orbit.gift_ideas enable row level security;

create policy people_allowed_owner on orbit.people
  for all to authenticated
  using ((select orbit.is_allowed()) and user_id = (select auth.uid()))
  with check ((select orbit.is_allowed()) and user_id = (select auth.uid()));

create policy birthday_log_allowed_owner on orbit.birthday_log
  for all to authenticated
  using ((select orbit.is_allowed()) and user_id = (select auth.uid()))
  with check ((select orbit.is_allowed()) and user_id = (select auth.uid()));

create policy gift_ideas_allowed_owner on orbit.gift_ideas
  for all to authenticated
  using ((select orbit.is_allowed()) and user_id = (select auth.uid()))
  with check ((select orbit.is_allowed()) and user_id = (select auth.uid()));

-- updated_at follows every change, whoever makes it (app, SQL editor, a future cron job).
create function orbit.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end
$$;

create trigger people_set_updated_at before update on orbit.people
  for each row execute function orbit.set_updated_at();
create trigger birthday_log_set_updated_at before update on orbit.birthday_log
  for each row execute function orbit.set_updated_at();

-- ---------------------------------------------------------------------------------------------
-- The one place "when is their birthday" is worked out. The app (lib/birthdays/calendar.ts) and,
-- later, the MCP tools and a pg_cron reminder job all call birthday_calendar() or
-- pending_birthdays(). "Today" is passed in rather than read from current_date (UTC on Supabase),
-- so it follows the phone's time zone.
-- ---------------------------------------------------------------------------------------------

-- A birthday's date in a given year. Feb 29 falls on Feb 28 when the year isn't a leap year.
create function orbit.birthday_in_year(p_month integer, p_day integer, p_year integer)
returns date
language sql immutable parallel safe
set search_path = ''
as $$
  select case
    when p_month = 2 and p_day = 29
      and not (p_year % 4 = 0 and (p_year % 100 <> 0 or p_year % 400 = 0))
    then make_date(p_year, 2, 28)
    else make_date(p_year, p_month, p_day)
  end
$$;

-- The next birthday on or after p_today (today itself counts).
create function orbit.next_birthday(p_month integer, p_day integer, p_today date)
returns date
language sql immutable parallel safe
set search_path = ''
as $$
  select case
    when orbit.birthday_in_year(p_month, p_day, extract(year from p_today)::integer) >= p_today
    then orbit.birthday_in_year(p_month, p_day, extract(year from p_today)::integer)
    else orbit.birthday_in_year(p_month, p_day, extract(year from p_today)::integer + 1)
  end
$$;

-- The most recent birthday on or before p_today (today itself counts).
create function orbit.last_birthday(p_month integer, p_day integer, p_today date)
returns date
language sql immutable parallel safe
set search_path = ''
as $$
  select case
    when orbit.birthday_in_year(p_month, p_day, extract(year from p_today)::integer) <= p_today
    then orbit.birthday_in_year(p_month, p_day, extract(year from p_today)::integer)
    else orbit.birthday_in_year(p_month, p_day, extract(year from p_today)::integer - 1)
  end
$$;

-- One row per person, as of p_today:
--   next_birthday, days_until, turning: the coming birthday (0 days = today) and the age they reach
--     then (null when the birth year is unknown).
--   last_birthday, days_since: the one just gone (also today, when it's today).
--   occasion_date, occasion_year, occasion_age: whichever of the two is nearer. It's the birthday the
--     checklist logs against.
create type orbit.birthday_row as (
  person_id uuid,
  name text,
  relationship text,
  birth_month integer,
  birth_day integer,
  birth_year integer,
  next_birthday date,
  days_until integer,
  turning integer,
  last_birthday date,
  days_since integer,
  occasion_date date,
  occasion_year integer,
  occasion_age integer
);

-- SECURITY INVOKER (the default), so RLS applies to the caller: signed in, you only ever get your
-- own people, and nothing at all unless you're in allowed_users. p_user_id defaults to the caller;
-- a cron job (running as postgres, without auth.uid()) passes it explicitly.
create function orbit.birthday_calendar(p_today date, p_user_id uuid default auth.uid())
returns setof orbit.birthday_row
language sql stable
set search_path = ''
as $$
  select
    p.id,
    p.name,
    p.relationship,
    p.birth_month,
    p.birth_day,
    p.birth_year,
    n.d,
    n.d - p_today,
    extract(year from n.d)::integer - p.birth_year,
    l.d,
    p_today - l.d,
    o.d,
    extract(year from o.d)::integer,
    extract(year from o.d)::integer - p.birth_year
  from orbit.people p
  cross join lateral (select orbit.next_birthday(p.birth_month, p.birth_day, p_today) as d) n
  cross join lateral (select orbit.last_birthday(p.birth_month, p.birth_day, p_today) as d) l
  cross join lateral (select case when n.d - p_today <= p_today - l.d then n.d else l.d end as d) o
  where p.user_id = p_user_id
  order by n.d - p_today, lower(p.name)
$$;

-- Birthdays from the last p_days_back days (today included) with nothing marked yet for that
-- birthday's year: no greeting, prayer, gift or celebration.
create function orbit.pending_birthdays(p_today date, p_days_back integer default 7, p_user_id uuid default auth.uid())
returns setof orbit.birthday_row
language sql stable
set search_path = ''
as $$
  select c.*
  from orbit.birthday_calendar(p_today, p_user_id) c
  where c.days_since between 0 and p_days_back
    and not exists (
      select 1
      from orbit.birthday_log bl
      where bl.person_id = c.person_id
        and bl.year = extract(year from c.last_birthday)::integer
        and (bl.greeted or bl.prayed or bl.gifted or bl.celebrated)
    )
  order by c.days_since, lower(c.name)
$$;

-- ---------------------------------------------------------------------------------------------
-- Grants. RLS decides which rows; these decide which commands reach RLS at all. anon gets them too
-- (as the Data API expects), but no policy is written for anon, so it sees and changes nothing.
-- allowed_users is read-only for everyone but service_role.
-- ---------------------------------------------------------------------------------------------

grant select, insert, update, delete on orbit.people, orbit.birthday_log, orbit.gift_ideas
  to anon, authenticated, service_role;
grant select on orbit.allowed_users to anon, authenticated;
grant select, insert, update, delete on orbit.allowed_users to service_role;
grant usage on type orbit.birthday_row to anon, authenticated, service_role;
grant execute on all functions in schema orbit to anon, authenticated, service_role;

-- Tables and functions added by later migrations get the same table and function grants.
alter default privileges in schema orbit
  grant select, insert, update, delete on tables to anon, authenticated, service_role;
alter default privileges in schema orbit
  grant execute on functions to anon, authenticated, service_role;

commit;
