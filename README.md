# CARE Speak AI

CARE Speak AI is a greenfield Next.js App Router starter for framework-driven speaking practice. It ships with:

- CARE, PREP, and STAR framework definitions
- seeded topic mapping for general thinking, opinion, and interview prompts
- route handlers for topic generation, evaluation, session tracking, and progress summary
- guest-mode practice with in-memory server persistence
- a Supabase schema and seed script for upgrading to durable auth-backed storage
- an OpenAI-backed evaluator path with a heuristic fallback when no API key is configured

## Run locally

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000).

## Environment

Optional `.env.local` values:

```bash
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-4.1-mini
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Without env configuration:

- topic generation uses curated seeded prompts
- evaluation uses a deterministic scoring fallback
- progress is tracked in memory for the dev server lifetime

## Supabase

SQL files live in [supabase/schema.sql](/Volumes/Private data/2minSpch/supabase/schema.sql) and [supabase/seed.sql](/Volumes/Private data/2minSpch/supabase/seed.sql).

These define the durable data model for:

- `profiles`
- `frameworks`
- `topics`
- `topic_framework_rules`
- `practice_sessions`
- `practice_attempts`
- component-level and communication-level scoring tables
- a `progress_snapshots` materialized view

## Tests

```bash
npm test
```
