# Supabase Setup

Giftwise currently uses Supabase for analytics events:

- `recommendation_events`
- `click_events`

The product catalog still lives in `lib/data.ts`. The next migration can move `products` and `merchant_offers` into Supabase.

## 1. Create a Supabase Project

1. Go to https://supabase.com
2. Create a new project
3. Save the project password somewhere safe
4. Wait for the project to finish provisioning

## 2. Create Tables and Policies

1. Open the Supabase project dashboard
2. Go to `SQL Editor`
3. Open `supabase/schema.sql` from this repo
4. Paste the full SQL into Supabase
5. Run it

This creates:

- `products`
- `merchant_offers`
- `recommendation_events`
- `click_events`

It also enables Row Level Security and allows anonymous users to insert recommendation and click events.

## 3. Get API Settings

In Supabase:

1. Go to `Project Settings`
2. Go to `API`
3. Copy:
   - Project URL
   - anon public key

Do not use the service role key in the frontend.

## 4. Add Local Environment Variables

Create `.env.local` in the project root:

```text
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

Then restart the dev server:

```powershell
npm run dev
```

## 5. Add Vercel Environment Variables

In Vercel:

1. Open the Giftwise project
2. Go to `Settings`
3. Go to `Environment Variables`
4. Add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Redeploy the project

## 6. Test

After deployment:

1. Open the site
2. Run the Gift Finder
3. Click an Amazon button
4. In Supabase, open `Table Editor`
5. Check:
   - `recommendation_events`
   - `click_events`

If rows appear, Supabase analytics is connected.
