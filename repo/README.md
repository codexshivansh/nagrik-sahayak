# Nagrik Sahayak — Digital Citizen Assistant

Decode SIH 2026 · PS3 · Bharat Pragati track · **Team OG** (Shivansh Gupta, Shivang Upadhyay, Navya Jauhri, Shivam Singh)

Multilingual (English/Hindi/Marathi/Tamil), voice-first web assistant that matches citizens to real government schemes they're eligible for, checks scheme links/URLs for fraud, and locates nearby banks/post offices/government offices.

## Repo layout

- `public/` — the frontend. Single-file `index.html`, deployed to **Vercel** as a static site.
- `server/` — the backend. Minimal Express API deployed to **Render**, serves scheme data from **Supabase** Postgres.
- `supabase/schema.sql` — run this once in the Supabase SQL Editor to create the `schemes` table and seed it with all 19 schemes.

## How it fits together

```
Browser (public/index.html)
   │  fetch /api/schemes
   ▼
Render (server/server.js, Express)
   │  SQL query
   ▼
Supabase (Postgres, "schemes" table)
```

The frontend also ships with the same 19 schemes hardcoded as an **offline fallback** — if the backend is unreachable it still works, just without live data. This was a deliberate reliability choice for demo day.

Eligibility matching and keyword search stay entirely client-side (no LLM call, no network dependency) — only the raw scheme data is fetched from the backend.

## Local development

**Frontend:** open `public/index.html` directly in a browser, or serve the folder with any static server.

**Backend:**
```
cd server
cp .env.example .env   # fill in your Supabase connection string
npm install
npm start
```

## Deployment

- **Frontend (Vercel):** import this repo, set root directory to `public` (or use the included `vercel.json`).
- **Backend (Render):** new Web Service, root directory `server`, build command `npm install`, start command `npm start`. Set the `DATABASE_URL` environment variable to your Supabase connection string (Project Settings → Database → Connection string → URI).
- **Database (Supabase):** create a new project, then run `supabase/schema.sql` in the SQL Editor.

Every push to `main` auto-deploys both the frontend (Vercel) and backend (Render) once they're connected to this repo.
