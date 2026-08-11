# Cloudflare Pages Deployment Guide (via GitHub)

Follow these steps to deploy **Chef Chakim's Yummys** web app to **Cloudflare Pages** directly from your GitHub repository.

---

## 1. Push Code to GitHub

Make sure your project repository is committed and pushed to GitHub:

```bash
git add .
git commit -m "Add menu image upload, SEO metadata, and Cloudflare Pages setup"
git push origin main
```

---

## 2. Connect Repository on Cloudflare Pages

1. Log into your [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. In the sidebar, select **Workers & Pages** -> **Create application** -> **Pages**.
3. Select **Connect to Git** and choose your GitHub repository (`yummys-simple` or your repository name).
4. Click **Begin setup**.

---

## 3. Configure Build Settings

Fill in the build configuration:

- **Project name**: `chef-chakim-yummys` (or your preferred subdomain)
- **Production branch**: `main`
- **Framework preset**: `Vite`
- **Build command**: `npm run build`
- **Build output directory**: `dist`

---

## 4. Environment Variables

Under **Environment variables (advanced)**, add your production Supabase keys:

| Variable Name | Value | Description |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | `https://your-project.supabase.co` | Your Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOi...` | Your Supabase Anon Public Key |

Click **Save and Deploy**.

---

## 5. Supabase Storage Migration (Run SQL)

Make sure you run `supabase/migrations/003_storage_and_menu_management.sql` in your **Supabase SQL Editor**:
1. Open Supabase Dashboard -> **SQL Editor**.
2. Run the script in `supabase/migrations/003_storage_and_menu_management.sql`.
3. This creates the public `menu-images` bucket so admins can upload photos from the dashboard.

---

## 6. Custom Domain Setup (Optional)

1. On your Cloudflare Pages project page, click **Custom domains**.
2. Add your custom domain (e.g. `chefchakim.co.ke` or `order.chefchakim.co.ke`).
3. Cloudflare will automatically handle SSL certificates and DNS routing!
