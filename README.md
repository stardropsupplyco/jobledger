# JobLedger

A personal budgeting app built for renovation contractors — track money in, money out, and what every job is actually worth.

## What it does

- **Overview** — total in/out/net, a 6-month trend chart, expense breakdown by category, top jobs by profit, recent activity
- **Jobs** — create a job, see paid-so-far / spent-so-far / profit / budget at a glance, drill into a full ledger per job with a running balance
- **Ledger** — every transaction across all jobs, filterable by type and job
- **Categories** — default categories are created automatically on signup (Materials, Labor/Subs, Permits, etc.) and you can add your own

Every dollar gets logged as **money in** or **money out**, optionally tied to a **job** and a **category**. That's the whole model — simple enough to actually keep up with on a job site.

## Stack

- React 19 + Vite
- Tailwind CSS v4
- Supabase (Postgres + Auth, email/password)
- Recharts for the dashboard charts
- lucide-react for icons

## Setup

1. Copy `.env.example` to `.env` and fill in your Supabase project URL + anon key.
2. `npm install`
3. `npm run dev`

The database schema (jobs, categories, transactions, profiles) and Row Level Security policies are already applied to the connected Supabase project — every user only ever sees their own data. New signups automatically get a starter set of categories.

## Deploying

This is a static Vite build — deploy to Vercel or Netlify same as your other apps. Set the two env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) in your hosting provider's dashboard.

## Project structure

```
src/
  context/AuthContext.jsx     — session + auth actions
  lib/supabase.js             — Supabase client
  lib/hooks.js                — data hooks: useJobs, useTransactions, useCategories
  lib/format.js                — money/date formatting
  components/Shell.jsx        — sidebar nav + layout
  components/Modal.jsx        — reusable modal
  components/TransactionFormModal.jsx — add/edit money in or out
  pages/AuthPage.jsx          — sign in / sign up
  pages/OverviewPage.jsx      — dashboard
  pages/JobsPage.jsx          — job list + create job
  pages/JobDetailPage.jsx     — single job ledger with running balance
  pages/TransactionsPage.jsx  — full ledger, filterable
  pages/CategoriesPage.jsx    — manage income/expense categories
```

## Design

Warm worksite palette instead of generic fintech blue/white — charcoal background, copper accent, sage for money in, brick red for money out. Ledger tables use tabular numerals and ruled rows like a real checkbook register. Job cards show a budget-vs-spent bar so overruns are visible at a glance.
