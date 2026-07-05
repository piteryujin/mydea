# MYDEA

MYDEA turns a rough business idea into clarification questions, a provisional
feasibility assessment, and a seven-day customer validation plan.

## Local development

```bash
pnpm install
pnpm dev
```

The local Vite app uses the built-in deterministic demo engine, so no API key
is required. Set `VITE_USE_LIVE_API=true` only when serving the Pages Functions
locally.

## Checks

```bash
pnpm check
```

## Supabase

1. Create a free Supabase project.
2. Run `supabase/migrations/0001_ideas.sql` in the SQL editor.
3. Copy `.env.example` to `.env.local` and add the project URL and anon key.
4. Enable email OTP authentication.

Without Supabase configuration, the save flow uses this browser's local
storage and remains fully testable.

## Cloudflare Pages

1. Create a Pages project connected to this repository.
2. Use `pnpm build` as the build command and `dist` as the output directory.
3. Add `GEMINI_API_KEY` as an encrypted secret.
4. Optionally create a free D1 database, run
   `migrations/0001_rate_limit.sql`, and bind it as `RATE_LIMIT`.
5. Add `RATE_LIMIT_SALT` as an encrypted secret.

If the Gemini secret is absent, the deployed functions use the deterministic
demo engine. If the D1 binding is absent, server-side quota enforcement is
disabled while the rest of the app continues to work.

## Privacy

Guest ideas are stored in local storage. When Gemini is enabled, idea text and
answers are sent to Google's API to generate the analysis. Production launch
copy and the privacy policy must disclose the selected provider's current data
handling terms.

## GitHub Pages demo

The repository includes `.github/workflows/deploy-pages.yml`. A push to `main`
tests and publishes a static MVP to:

`https://piteryujin.github.io/mydea/`

The Pages build uses hash routing and the deterministic demo analysis engine,
so the public MVP works without API keys or hosting charges. Guest data remains
in the visitor's browser. Use the Cloudflare and Supabase setup above when the
MVP needs server-side AI, real accounts, and cross-device sync.
