-- People get nicknames (what you actually call them: "Mai" for Maria Santos, several allowed),
-- and lose the relationship field. Relationships already saved are deleted with the column.
--
-- Run after 20261002000000_orbit_init.sql, as a whole, in the SQL editor. It's one transaction and
-- changes only `orbit`.

begin;

alter table orbit.people
  drop column relationship,
  add column nicknames text[] not null default '{}',
  add constraint people_nicknames_limit check (cardinality(nicknames) <= 10);

-- The calendar's row type changes shape (relationship out, nicknames in), so it and the two
-- functions returning it are recreated. Same calculation as before.
drop function orbit.pending_birthdays(date, integer, uuid);
drop function orbit.birthday_calendar(date, uuid);
drop type orbit.birthday_row;

create type orbit.birthday_row as (
  person_id uuid,
  name text,
  nicknames text[],
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

create function orbit.birthday_calendar(p_today date, p_user_id uuid default auth.uid())
returns setof orbit.birthday_row
language sql stable
set search_path = ''
as $$
  select
    p.id,
    p.name,
    p.nicknames,
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

grant usage on type orbit.birthday_row to anon, authenticated, service_role;
grant execute on function orbit.birthday_calendar(date, uuid), orbit.pending_birthdays(date, integer, uuid)
  to anon, authenticated, service_role;

-- Tell the Data API about the changed column and functions right away.
notify pgrst, 'reload schema';

commit;
