# OpenAI Setup

Giftwise uses OpenAI only on the server side through `app/api/recommend/route.ts`.

The browser sends finder inputs to:

```text
POST /api/recommend
```

The API route:

1. Loads candidate products and offers from Supabase
2. Keeps only offers that are purchasable in the visitor's marketplace
3. Sends those candidates to OpenAI without a hard budget filter
4. Requires structured JSON output
5. Returns selected product/offer IDs and personalized recommendation reasons

## Local Environment

Add these values to `.env.local`:

```text
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4o-mini
```

Restart the dev server after editing `.env.local`:

```powershell
npm run dev
```

## Vercel Environment

In Vercel:

1. Open the `giftwise` project
2. Go to `Settings`
3. Go to `Environment Variables`
4. Add:
   - `OPENAI_API_KEY`
   - `OPENAI_MODEL`
5. Redeploy production

Do not commit `.env.local` or the OpenAI API key to GitHub.
