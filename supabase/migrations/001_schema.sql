-- Chef Chakim's Yummys — simplified schema

create type public.order_status as enum ('pending', 'confirmed', 'cancelled');

create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  tagline text default '',
  image_url text default '',
  category text not null,
  sort int default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table public.menu_options (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.menu_items(id) on delete cascade,
  label text not null,
  price numeric(10,2) not null default 0,
  unit text default '',
  note text default '',
  sort int default 0
);

create table public.site_content (
  key text primary key,
  value text not null default '',
  label text default '',
  section text default ''
);

create table public.availability_dates (
  id uuid primary key default gen_random_uuid(),
  day date unique not null,
  is_open boolean default true,
  capacity int default 5,
  note text default ''
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  phone text not null,
  mode text not null check (mode in ('delivery', 'pickup')),
  location text default '',
  event_date date not null,
  event_time text default '',
  items jsonb not null default '[]',
  total numeric(10,2) not null default 0,
  notes text default '',
  status public.order_status default 'pending',
  whatsapp_phone text default '',
  created_at timestamptz default now()
);

create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

-- Indexes
create index bookings_event_date_idx on public.bookings(event_date);
create index menu_items_category_idx on public.menu_items(category);
create index menu_options_item_id_idx on public.menu_options(item_id);

-- RLS
alter table public.menu_items enable row level security;
alter table public.menu_options enable row level security;
alter table public.site_content enable row level security;
alter table public.availability_dates enable row level security;
alter table public.bookings enable row level security;
alter table public.admin_users enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users where user_id = auth.uid()
  );
$$;

-- Public read for storefront
create policy "Public read menu items" on public.menu_items for select using (is_active = true);
create policy "Public read menu options" on public.menu_options for select using (true);
create policy "Public read site content" on public.site_content for select using (true);
create policy "Public read availability" on public.availability_dates for select using (true);

-- Anyone can place an order (validated client-side + DB constraints)
create policy "Anyone can insert bookings" on public.bookings for insert with check (true);

-- Admin full access
create policy "Admin read all menu items" on public.menu_items for select using (public.is_admin());
create policy "Admin manage menu items" on public.menu_items for all using (public.is_admin());
create policy "Admin manage menu options" on public.menu_options for all using (public.is_admin());
create policy "Admin manage site content" on public.site_content for all using (public.is_admin());
create policy "Admin manage availability" on public.availability_dates for all using (public.is_admin());
create policy "Admin read bookings" on public.bookings for select using (public.is_admin());
create policy "Admin update bookings" on public.bookings for update using (public.is_admin());
create policy "Admin manage admin users" on public.admin_users for all using (public.is_admin()) with check (public.is_admin());
create policy "Initial admin setup insert" on public.admin_users for insert with check (not exists (select 1 from public.admin_users));


-- Seed content
insert into public.site_content (key, value, label, section) values
  ('hero_title', 'Deliciously Yours Online', 'Hero title', 'hero'),
  ('hero_subtitle', 'Fresh chapati, mandazi, samosas, yoghurt & celebration cakes — made with love in Nairobi.', 'Hero subtitle', 'hero'),
  ('hero_cta', 'Browse the menu', 'Hero CTA', 'hero'),
  ('story_title', 'Our Story', 'Story title', 'story'),
  ('story_body', 'Chef Chakim started in a small kitchen with one goal: bring the warmth of home-cooked Kenyan food to every celebration. From Sunday chapati bundles to full buffet catering, every order is prepared fresh.', 'Story body', 'story'),
  ('footer_phone', '254793547818', 'Footer phone', 'footer'),
  ('footer_hours', 'Mon–Sat 8am–6pm · Sundays closed', 'Footer hours', 'footer');

-- Seed menu
insert into public.menu_items (slug, name, tagline, category, sort) values
  ('plain-chapati', 'Plain Chapati', 'Soft, flaky, made fresh daily', 'chapati', 1),
  ('special-chapati', 'Special Chapati', 'With extra layers of love', 'chapati', 2),
  ('mandazi', 'Mandazi', 'Sweet, golden fried dough', 'mandazi', 3),
  ('beef-samosas', 'Beef Samosas', 'Crispy pastry, spiced mince', 'samosas', 4),
  ('veggie-samosas', 'Veggie Samosas', 'Seasonal vegetables, lightly spiced', 'samosas', 5),
  ('plain-yoghurt', 'Plain Yoghurt', 'Thick, creamy, natural', 'yoghurts', 6),
  ('fruit-yoghurt', 'Fruit Yoghurt', 'With fresh seasonal fruit', 'yoghurts', 7),
  ('celebration-cake', 'Celebration Cake', 'Custom flavours for any occasion', 'cakes', 8),
  ('buffet-catering', 'Buffet Catering', 'Full event packages — chapati, sides & more', 'catering', 9);

insert into public.menu_options (item_id, label, price, unit, sort)
select id, '1 dozen', 300, 'dozen', 1 from public.menu_items where slug = 'plain-chapati'
union all select id, '2 dozen', 550, 'dozen', 2 from public.menu_items where slug = 'plain-chapati'
union all select id, '1 dozen', 350, 'dozen', 1 from public.menu_items where slug = 'special-chapati'
union all select id, '6 pieces', 150, 'pack', 1 from public.menu_items where slug = 'mandazi'
union all select id, '12 pieces', 280, 'pack', 2 from public.menu_items where slug = 'mandazi'
union all select id, '6 pieces', 200, 'pack', 1 from public.menu_items where slug = 'beef-samosas'
union all select id, '6 pieces', 180, 'pack', 1 from public.menu_items where slug = 'veggie-samosas'
union all select id, '500ml', 120, 'jar', 1 from public.menu_items where slug = 'plain-yoghurt'
union all select id, '500ml', 150, 'jar', 1 from public.menu_items where slug = 'fruit-yoghurt'
union all select id, 'Small (serves 10)', 3500, 'cake', 1 from public.menu_items where slug = 'celebration-cake'
union all select id, 'Medium (serves 25)', 7500, 'cake', 2 from public.menu_items where slug = 'celebration-cake'
union all select id, 'Per person (min 20)', 800, 'person', 1 from public.menu_items where slug = 'buffet-catering';

-- Seed 60 days availability (Sundays closed)
insert into public.availability_dates (day, is_open, capacity, note)
select
  d::date,
  extract(dow from d) <> 0,
  case when extract(dow from d) = 6 then 8 else 5 end,
  case when extract(dow from d) = 0 then 'Closed on Sundays' else '' end
from generate_series(current_date, current_date + interval '59 days', interval '1 day') as d;
