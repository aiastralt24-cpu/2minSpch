# CARE Speak AI

CARE Speak AI is a Next.js speaking coach that helps users practice structured answers instead of talking at random.

The product is built around three MVP speaking frameworks:

- `CARE` for general thinking prompts
- `PREP` for opinion prompts
- `STAR` for interview prompts

Users sign in, get a prompt, see the right structure, answer it, and receive focused feedback with a stronger rewritten version.

## What the app includes

- landing page with a calmer product pitch
- sign-in and account creation flow
- Supabase Auth support for real email/password accounts
- protected practice flow that starts after sign-in
- step-based practice experience:
  - setup
  - prompt
  - speaking
  - feedback
- typewriter-style prompt reveal with a delayed thinking timer
- framework-specific evaluation output
- progress dashboard tied to the signed-in user
- Supabase-backed progress storage when environment variables are configured

## Product flow

1. User clicks `Start practice`
2. User signs in or creates an account
3. User receives a prompt with the matching answer structure
4. Prompt reveals gradually, then the thinking timer starts
5. User records or types an answer
6. The app evaluates structure and communication quality
7. Progress is saved against that account

## Current auth and progress model

The app now supports two modes:

Production-ready mode:

- Supabase Auth handles email/password accounts
- Supabase stores authenticated practice attempts, scores, transcripts, and dashboard progress
- practice routes attach the user session token when saving progress
- dashboard progress loads from the authenticated API first

Development fallback:

- if Supabase environment variables are missing, the app falls back to local browser storage
- local fallback exists only so the app can be tested without external services
- local fallback should not be used as production auth

Important note:

- the old fake OTP sign-up flow is no longer the main sign-in experience
- real email confirmation/password recovery should be configured inside Supabase Auth settings

## Tech stack

- `Next.js 16`
- `React 19`
- `TypeScript`
- `Vitest`
- `OpenAI SDK`
- `Supabase JS`

## Project structure

```text
app/
  page.tsx                Landing page
  practice/page.tsx       Protected practice route
  sign-in/page.tsx        Auth flow
  dashboard/page.tsx      Progress view
  api/                    Topic, evaluation, session, progress, auth routes

components/
  practice-shell.tsx      Main practice UX
  topic-prompt-card.tsx   Prompt reveal UI
  thinking-timer.tsx      Prompt timer
  framework-*.tsx         Structure + scoring UI

lib/
  client/progress-store.ts        Auth helpers and local development fallback
  evaluation/                     Evaluation logic
  frameworks.ts                   Framework definitions
  topics.ts                       Seeded prompt library
  types.ts                        Shared contracts

supabase/
  schema.sql
  seed.sql

tests/
  evaluation.test.ts
  topic-selection.test.ts
```

## Run locally

```bash
npm install
npm run dev
```

Then open [http://127.0.0.1:3000](http://127.0.0.1:3000).

If port `3000` is busy, Next.js will choose another available port.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run typecheck
npm test
```

## Environment

Optional `.env.local` values:

```bash
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-4.1-mini
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Without extra environment setup:

- topic generation uses curated local prompts
- evaluation falls back to deterministic local scoring when OpenAI is not configured
- auth and progress use the local development fallback

## Supabase persistence

The repository already includes a Supabase-oriented schema in [supabase/schema.sql](/Volumes/Private%20data/2minSpch/supabase/schema.sql) and seed data in [supabase/seed.sql](/Volumes/Private%20data/2minSpch/supabase/seed.sql).

The schema covers:

- `profiles`
- `frameworks`
- `topics`
- `topic_framework_rules`
- `practice_sessions`
- `practice_attempts`
- component scoring
- communication scoring
- progress snapshot support

To use real auth and persistence:

1. Create a Supabase project.
2. Run [supabase/schema.sql](/Volumes/Private%20data/2minSpch/supabase/schema.sql).
3. Run [supabase/seed.sql](/Volumes/Private%20data/2minSpch/supabase/seed.sql).
4. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local`.
5. Configure Supabase Auth email settings for confirmation and password recovery.

## Verification

These checks are passing in the current repo:

```bash
npm run typecheck
npm test
npm run build
```

## Next good improvements

- configure Supabase email confirmation templates
- add password reset from the sign-in screen
- add real speech-to-text input instead of transcript-first fallback
- add richer dashboard trends and repeat-practice recommendations
