-- MDB schema. Paste into the Supabase SQL editor and run. Safe to re-run.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.settlements (
  id             uuid primary key default gen_random_uuid(),
  brand          text not null,
  brand_key      text not null,            -- lowercase slug, e.g. 'instagram'
  title          text not null,
  payout_label   text,                     -- display string, e.g. '$20-$50'
  payout_min     numeric,
  payout_max     numeric,
  deadline       date,
  badge          text,                     -- e.g. 'No proof', 'Uncapped'
  category       text,
  description    text,
  claims_filed   integer not null default 0,
  claims_total   integer not null default 0,
  logo_url       text,
  unique (brand_key, title)
);

create table if not exists public.profiles (
  id             uuid primary key references auth.users (id) on delete cascade,
  brands         text[] not null default '{}',
  payout_method  text,
  onboarded      boolean not null default false,
  paywall_seen   boolean not null default false  -- true once the user has left the paywall / offer
);

-- For databases created before paywall_seen existed (create table above skips an existing table)
alter table public.profiles add column if not exists paywall_seen boolean not null default false;

create table if not exists public.claims (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null default auth.uid() references auth.users (id) on delete cascade,
  settlement_id  uuid not null references public.settlements (id) on delete cascade,
  status         text not null default 'claimed' check (status in ('claimed', 'notified', 'paid')),
  created_at     timestamptz not null default now(),
  unique (user_id, settlement_id)
);

create table if not exists public.forms (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null default auth.uid() references auth.users (id) on delete cascade,
  settlement_id  uuid not null references public.settlements (id) on delete cascade,
  status         text not null default 'pending' check (status in ('pending', 'paymentSent', 'caseClosed')),
  submitted_at   timestamptz not null default now()
);

create index if not exists claims_user_id_idx on public.claims (user_id);
create index if not exists forms_user_id_idx  on public.forms (user_id);

-- ---------------------------------------------------------------------------
-- Row level security
-- Anonymous sign-ins use the `authenticated` role, so these policies cover them.
-- With no policy for an operation, RLS denies it.
-- ---------------------------------------------------------------------------

alter table public.settlements enable row level security;
alter table public.profiles    enable row level security;
alter table public.claims      enable row level security;
alter table public.forms       enable row level security;

-- settlements: read-only for clients (seed script uses the secret key, which bypasses RLS)
drop policy if exists "settlements_select" on public.settlements;
create policy "settlements_select" on public.settlements
  for select to authenticated using (true);

-- profiles: own row only; select + insert + update (no delete from clients).
-- Update is needed by onboarding (brands, payout method, onboarded) and the dev "Reset onboarding".
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select to authenticated using (id = (select auth.uid()));

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated with check (id = (select auth.uid()));

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- claims: own rows only; select + insert; no update/delete.
-- Inserts must start at the default status so a client can't self-award 'paid'.
drop policy if exists "claims_select_own" on public.claims;
create policy "claims_select_own" on public.claims
  for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists "claims_insert_own" on public.claims;
create policy "claims_insert_own" on public.claims
  for insert to authenticated
  with check (user_id = (select auth.uid()) and status = 'claimed');

-- forms: same pattern
drop policy if exists "forms_select_own" on public.forms;
create policy "forms_select_own" on public.forms
  for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists "forms_insert_own" on public.forms;
create policy "forms_insert_own" on public.forms
  for insert to authenticated
  with check (user_id = (select auth.uid()) and status = 'pending');

-- ---------------------------------------------------------------------------
-- Auto-create a profile for every new user (including anonymous ones)
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill users who signed in before this trigger existed
insert into public.profiles (id)
select id from auth.users
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Realtime on claims and forms (RLS still applies to what each client receives)
-- ---------------------------------------------------------------------------

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'claims'
  ) then
    alter publication supabase_realtime add table public.claims;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'forms'
  ) then
    alter publication supabase_realtime add table public.forms;
  end if;
end;
$$;
