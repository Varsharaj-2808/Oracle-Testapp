-- ---------------------------------------------------------------------------
-- Sample schema for the environment-variable / secret-management test app.
--
-- Run this in the Supabase Dashboard > SQL Editor, or with the Supabase CLI:
--   supabase db execute --file supabase/schema.sql
--
-- It is safe to run more than once: the seed data is de-duplicated.
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.customers (
  id         uuid        primary key default gen_random_uuid(),
  name       text        not null,
  email      text        not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id          uuid           primary key default gen_random_uuid(),
  name        text           not null,
  description text,
  price       numeric(10, 2) not null check (price >= 0),
  created_at  timestamptz    not null default now()
);

create table if not exists public.orders (
  id          uuid           primary key default gen_random_uuid(),
  customer_id uuid           not null references public.customers (id) on delete cascade,
  product_id  uuid           not null references public.products (id)  on delete cascade,
  quantity    integer        not null check (quantity > 0),
  total       numeric(10, 2) not null check (total >= 0),
  created_at  timestamptz    not null default now()
);

create index if not exists orders_customer_id_idx on public.orders (customer_id);
create index if not exists orders_product_id_idx  on public.orders (product_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- The backend talks to Supabase with the service-role key, which BYPASSES RLS,
-- so the app works regardless of the policies below.
--
-- The policies that follow are optional. They only grant anonymous READ access
-- to the sample rows so you can eyeball the data from the Supabase dashboard or
-- a public anon client. Comment the whole block out to lock the data down.
-- ---------------------------------------------------------------------------

alter table public.customers enable row level security;
alter table public.products  enable row level security;
alter table public.orders    enable row level security;

drop policy if exists "anon read customers" on public.customers;
drop policy if exists "anon read products"  on public.products;
drop policy if exists "anon read orders"    on public.orders;

create policy "anon read customers" on public.customers
  for select to anon using (true);

create policy "anon read products" on public.products
  for select to anon using (true);

create policy "anon read orders" on public.orders
  for select to anon using (true);

-- ---------------------------------------------------------------------------
-- Seed data
-- ---------------------------------------------------------------------------

insert into public.customers (name, email) values
  ('Ada Lovelace',   'ada@example.com'),
  ('Alan Turing',    'alan@example.com'),
  ('Grace Hopper',   'grace@example.com'),
  ('Katherine Johnson', 'katherine@example.com')
on conflict (email) do nothing;

insert into public.products (name, description, price) values
  ('Sticker Pack',        'Weatherproof vinyl stickers',        4.99),
  ('Notebook',            'A5 dotted notebook',                 12.50),
  ('Enamel Mug',          '350ml enamel-coated mug',            9.00),
  ('Tote Bag',            'Heavyweight cotton tote',            18.75)
on conflict do nothing;

insert into public.orders (customer_id, product_id, quantity, total)
select c.id, p.id, 2, (p.price * 2)::numeric(10, 2)
from public.customers c
join public.products p on p.name = 'Notebook'
where c.email = 'ada@example.com'
  and not exists (select 1 from public.orders o where o.customer_id = c.id and o.product_id = p.id);

insert into public.orders (customer_id, product_id, quantity, total)
select c.id, p.id, 1, p.price
from public.customers c
join public.products p on p.name = 'Enamel Mug'
where c.email = 'alan@example.com'
  and not exists (select 1 from public.orders o where o.customer_id = c.id and o.product_id = p.id);

insert into public.orders (customer_id, product_id, quantity, total)
select c.id, p.id, 5, (p.price * 5)::numeric(10, 2)
from public.customers c
join public.products p on p.name = 'Sticker Pack'
where c.email = 'grace@example.com'
  and not exists (select 1 from public.orders o where o.customer_id = c.id and o.product_id = p.id);
