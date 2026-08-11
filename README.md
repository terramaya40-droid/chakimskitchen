# Chef Chakim's Yummys — Simple

A clean, lightweight food ordering site for Chef Chakim's Yummys. Browse the menu, add items to cart, pick a date, and checkout via WhatsApp. Admin dashboard for orders, menu, and availability.

**Simpler than the original:** no SSR, no AI chat, no Cloudflare Workers — just Vite + React + Supabase.

## Quick start

### 1. Create a Supabase project

Go to [supabase.com](https://supabase.com) and create a new project.

### 2. Run the database migration

In the Supabase SQL Editor, paste and run the contents of:

```
supabase/migrations/001_schema.sql
```

This creates all tables, RLS policies, and seed data (menu, content, 60 days of availability).

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Find these in Supabase → Project Settings → API.

### 4. Install and run

```bash
npm install
npm run dev
```

Open http://localhost:5173

### 5. Set up admin access

1. Go to `/admin` and sign up with email/password (Supabase Auth)
2. In Supabase SQL Editor, add yourself as admin:

```sql
insert into public.admin_users (user_id)
values ('your-user-uuid-from-auth-users');
```

Find your UUID in Supabase → Authentication → Users.

## What's included

| Feature | Description |
|---------|-------------|
| **Menu** | Category filters, option picker, add to cart |
| **Cart** | LocalStorage persistence, qty controls |
| **Checkout** | Date picker with capacity checks, WhatsApp order |
| **Admin** | View/update orders, toggle menu items, open/close dates |

## Deploy

Build for any static host (Vercel, Netlify, Cloudflare Pages):

```bash
npm run build
```

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables on your host.

## Project structure

```
src/
├── components/   Header, Hero, Menu, Cart, Footer
├── hooks/        useShop (data fetching + booking)
├── lib/          supabase client, cart, types, whatsapp
├── pages/        Home, Admin
└── main.tsx
```

## Reusing the existing Supabase project

If you already have the original Lovable project's Supabase instance (`wuymrgpzdbclrcqqiqez`), you can point `.env` at it. The schema is compatible — this app uses a subset of the same tables (without chat/AI tables).
