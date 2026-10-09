-- In Supabase, open SQL Editor, paste this, and click Run.
create table if not exists public.trip_savings (
  id integer primary key check (id = 1),
  you_saved integer not null default 0 check (you_saved between 0 and 1750),
  friend_saved integer not null default 0 check (friend_saved between 0 and 800),
  updated_at timestamptz not null default now()
);

insert into public.trip_savings (id, you_saved, friend_saved)
values (1, 0, 0)
on conflict (id) do nothing;

-- Do not add public read/write policies. The Vercel API uses the secret service-role key.
