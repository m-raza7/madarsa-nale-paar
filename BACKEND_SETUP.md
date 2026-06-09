# Phase 2 — Backend Setup Guide

This app uses **Supabase** (Postgres + Auth + Storage) as the backend.
The frontend talks to it via `@supabase/supabase-js` and TanStack Start server functions.

---

## 1. Create your Supabase project

1. Go to https://supabase.com → New Project
2. Copy these from **Settings → API**:
   - Project URL → `SUPABASE_URL` / `VITE_SUPABASE_URL`
   - `anon` / `publishable` key → `SUPABASE_PUBLISHABLE_KEY` / `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `service_role` key (secret) → `SUPABASE_SERVICE_ROLE_KEY`
3. Copy the DB connection string from **Settings → Database** → `SUPABASE_DB_URL`

---

## 2. Configure environment

Copy `.env.example` → `.env` and fill in YOUR values:

```bash
cp .env.example .env
```

Never commit `.env` — only `.env.example` should be in git.

---

## 3. Run the database migrations

The full schema lives in `supabase/migrations/`. Apply with the Supabase CLI:

```bash
npx supabase link --project-ref <your-project-id>
npx supabase db push
```

### Tables created
| Table        | Purpose                          |
|--------------|----------------------------------|
| `profiles`   | User profile linked to auth.users |
| `user_roles` | RBAC: admin / teacher / student   |
| `students`   | Enrolled student records          |
| `teachers`   | Faculty records                   |
| `courses`    | Course catalog                    |
| `admissions` | Admission applications            |
| `results`    | Exam results per student          |
| `events`     | Calendar / announcements          |
| `notices`    | Notice board                      |
| `gallery`    | Photo gallery                     |
| `donations`  | Donation records                  |
| `contacts`   | Contact-form messages             |

All user tables have **Row Level Security** enabled. Roles are stored in
`user_roles` (never on `profiles`) and checked via the
`public.has_role(uid, role)` security-definer function.

---

## 4. Enable authentication

In Supabase dashboard → **Authentication → Providers**:
- ✅ Email (enable; turn OFF "Confirm email" for local dev if desired)
- ✅ Google (paste your Google OAuth client id + secret)

Add `http://localhost:8080` and your production URL to the
**Redirect URLs** allowlist.

---

## 5. Run the app

```bash
bun install
bun run dev
```

Open http://localhost:8080.

---

## 6. Seed an admin user

After signing up the first time:

```sql
-- in Supabase SQL editor
update public.user_roles
set role = 'admin'
where user_id = (select id from auth.users where email = 'you@example.com');
```

---

## Backend architecture

- **Browser client** → `src/integrations/supabase/client.ts` (RLS-scoped)
- **Server-auth middleware** → `src/integrations/supabase/auth-middleware.ts`
  (use inside `createServerFn` for user-scoped server logic)
- **Admin client** → `src/integrations/supabase/client.server.ts`
  (service role — bypasses RLS, server-only)
- **Server functions** → `src/lib/**/*.functions.ts`
- **Public HTTP routes / webhooks** → `src/routes/api/public/*`
