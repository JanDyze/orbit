-- Let yourself into Orbit. Run in the SQL editor after the migration, with your own email (the
-- one you sign in to Kept with). Running it twice is harmless.
insert into orbit.allowed_users (user_id)
select id from auth.users where email = 'YOUR-EMAIL@example.com'
on conflict (user_id) do nothing
returning user_id;

-- Who's allowed now:
-- select au.user_id, u.email, au.created_at
-- from orbit.allowed_users au join auth.users u on u.id = au.user_id;

-- To remove someone:
-- delete from orbit.allowed_users where user_id = (select id from auth.users where email = '...');
