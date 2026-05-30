create table if not exists public.products (
  id text primary key,
  name text not null,
  brand text,
  category text,
  status text not null default 'draft',
  image_url text not null,
  reason text not null,
  tags jsonb not null default '{}'::jsonb,
  signals jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.merchant_offers (
  id text primary key,
  product_id text not null references public.products(id) on delete cascade,
  merchant text not null,
  marketplace text not null,
  external_product_id text,
  price numeric,
  currency text,
  availability text not null default 'unknown',
  affiliate_url text not null,
  commission_rate numeric,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.recommendation_events (
  id uuid primary key,
  session_id text,
  created_at timestamptz not null default now(),
  marketplace text not null,
  inputs jsonb not null,
  recommended_products jsonb not null
);

create table if not exists public.click_events (
  id uuid primary key,
  session_id text,
  created_at timestamptz not null default now(),
  product_id text not null,
  offer_id text not null,
  merchant text,
  marketplace text not null,
  placement text not null
);

create index if not exists merchant_offers_product_id_idx on public.merchant_offers(product_id);
create index if not exists merchant_offers_marketplace_idx on public.merchant_offers(marketplace);
create index if not exists merchant_offers_availability_idx on public.merchant_offers(availability);
create index if not exists recommendation_events_created_at_idx on public.recommendation_events(created_at desc);
create index if not exists recommendation_events_marketplace_idx on public.recommendation_events(marketplace);
create index if not exists click_events_created_at_idx on public.click_events(created_at desc);
create index if not exists click_events_product_id_idx on public.click_events(product_id);
create index if not exists click_events_offer_id_idx on public.click_events(offer_id);
create index if not exists click_events_marketplace_idx on public.click_events(marketplace);

alter table public.products enable row level security;
alter table public.merchant_offers enable row level security;
alter table public.recommendation_events enable row level security;
alter table public.click_events enable row level security;

drop policy if exists "Public can read active products" on public.products;
create policy "Public can read active products"
  on public.products for select
  to anon
  using (status in ('active', 'featured'));

drop policy if exists "Public can read available offers" on public.merchant_offers;
create policy "Public can read available offers"
  on public.merchant_offers for select
  to anon
  using (availability = 'in_stock');

drop policy if exists "Anyone can insert recommendation events" on public.recommendation_events;
create policy "Anyone can insert recommendation events"
  on public.recommendation_events for insert
  to anon
  with check (true);

drop policy if exists "Anyone can insert click events" on public.click_events;
create policy "Anyone can insert click events"
  on public.click_events for insert
  to anon
  with check (true);
