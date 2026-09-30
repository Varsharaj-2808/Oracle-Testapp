# Secret Management Test App

A deliberately minimal full-stack sample for testing **environment-variable and
secret handling** with Supabase and Brevo.

The app is split so that secrets live in exactly one place: the backend process.
The browser bundle contains no credentials at all.

```
React + Vite (frontend)  ->  Express (backend)  ->  Supabase
                                              \->  Brevo
```

## What is deliberately not included

No OCI Vault, no Oracle Cloud deployment, no Docker, no authentication, no CI.
This is a sample app for local verification only.

## Project layout

| Path | Purpose |
| --- | --- |
| `.env.example` | Placeholder variable names only. Safe to commit. |
| `supabase/schema.sql` | `customers` / `products` / `orders` tables plus seed data. |
| `backend/src/config/env.js` | Loads and validates the environment. |
| `backend/src/lib/supabase.js` | Server-side Supabase client (service role). |
| `backend/src/lib/brevo.js` | Brevo transactional email via native `fetch`. |
| `backend/src/routes/` | `health`, `config`, `customers`, `products`, `orders`, `email`. |
| `frontend/` | React UI. Talks to the backend only. |

## Setup

### 1. Install dependencies

```powershell
npm run install:all
```

Or per package: `npm install`, `npm install --prefix backend`, `npm install --prefix frontend`.

### 2. Create your env file

```powershell
Copy-Item .env.example .env
```

`.env` is gitignored. Fill in the values later (see below); the app still starts
with everything missing, and reports what it needs.

### 3. Create the database

Paste `supabase/schema.sql` into **Supabase Dashboard > SQL Editor** and run it.
It is idempotent, so re-running it is safe.

### 4. Run

```powershell
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:4000

---

## Environment variables

| Variable | Required | Secret | Purpose |
| --- | --- | --- | --- |
| `PORT` | no | no | API port, defaults to `4000`. |
| `NODE_ENV` | no | no | `development` or `production`. |
| `CORS_ORIGIN` | no | no | Allowed frontend origin, comma-separated. |
| `SUPABASE_URL` | yes | no | Supabase project URL. |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | **yes** | Server-side DB access. Bypasses RLS. |
| `SUPABASE_ANON_KEY` | no | no | Public key, kept server-side here. |
| `BREVO_API_KEY` | yes | **yes** | Brevo API key (`xkeysib-...`). |
| `BREVO_SENDER_EMAIL` | yes | no | Verified sender address. |
| `BREVO_SENDER_NAME` | no | no | Sender display name. |

## Adding your credentials later

1. **Supabase** - Dashboard > **Project Settings** > **API**
   - **Project URL** -> `SUPABASE_URL`
   - **service_role** key (the `sb_secret_...` / JWT row) -> `SUPABASE_SERVICE_ROLE_KEY`
   - **anon / publishable** key -> `SUPABASE_ANON_KEY`
2. **Brevo** - Dashboard > **SMTP & API** > **API Keys** > **Generate a new API key**
   - Copy the `xkeysib-...` value -> `BREVO_API_KEY`
   - **Senders & Domains** > **Domains** - verify a sending domain or a sender
     address, then copy it -> `BREVO_SENDER_EMAIL`
   - Any display label -> `BREVO_SENDER_NAME`
3. Put them in `.env` at the project root, restart `npm run dev`, then open the
   **Config** tab in the UI and press **Refresh config**. Each row flips from
   `missing` to `set`. No credential value is ever displayed.

If you prefer not to keep a local `.env` at all, set the variables in your shell
or process manager before starting the app. `backend/src/config/env.js` reads
`process.env` first and only falls back to the file, and it honours
`DOTENV_CONFIG_PATH` if you want to point at a different file.

## API

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/api/health` | Liveness probe. |
| `GET` | `/api/config` | Presence booleans per variable. No values. |
| `GET` | `/api/customers` | Lists customers. |
| `POST` | `/api/customers` | `{ name, email }`. |
| `GET` | `/api/products` | Lists products. |
| `GET` | `/api/orders` | Lists orders with customer and product joined. |
| `POST` | `/api/orders` | `{ customerId, productId, quantity }`. |
| `POST` | `/api/email/test` | `{ to, subject, text }` -> Brevo. |

Data and email routes return `503` with a `missing` array when the relevant
credentials are absent, so you can confirm behaviour without any secrets in place.

## Secret-handling rules this sample follows

- No credential is hardcoded, logged, or returned by an endpoint.
- `SUPABASE_SERVICE_ROLE_KEY` and `BREVO_API_KEY` are read only by the backend.
- No secret uses a `VITE_` prefix. `VITE_`-prefixed values are inlined into the
  browser bundle at build time, so the backend warns at startup if it finds one.
- `.env` is gitignored; `.env.example` holds empty placeholders only.
