# Perch

Perch is a read-only Gmail companion: it scans the receipts you already have and keeps a live shelf of every
subscription, free trial, renewal date and event. Things that are over get archived; things you forgot you bought
get found.

- **Live:** https://perch-live.vercel.app
- Web app (Next.js 16 · App Router) + a showcase/install page in the same deploy.
- Read-only Gmail scope only (`gmail.readonly`). Nothing is sent anywhere; your shelf lives on your disk.
- Demo mode so you can see every surface before connecting anything.

## Run locally

```bash
npm install
cp .env.example .env.local
# (optional) add GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET
npm run dev
```

Open http://localhost:3000.

## Connect Gmail

1. Create a Google Cloud project → enable the **Gmail API**.
2. Create an **OAuth client ID (Web application)**.
3. Authorized redirect URI: `http://localhost:3000/api/auth/google/callback`
4. Paste the client ID + secret into `.env.local` and restart.

## How it works

- `POST`-free: every `GET /api/perch/state?scan=1` runs targeted read-only Gmail searches for receipts, renewals,
  subscriptions, trials and tickets, parses money / cadence / dates, and merges them into your shelf.
- `sweep()` (in `src/lib/store.ts`) moves past trials/events to "ended", and drops "ended" items older than the
  configured cleanup window — so the shelf never grows forever.
- `buildSnapshot()` (in `src/lib/snapshot.ts`) computes the dashboard: monthly spend, urgency chips, idle plans.
- Sessions are signed cookies; per-user state lives in `.perch-data/` (gitignored).

## Project layout

```
src/app/                routes: / (showcase), /app (dashboard), /install, /api/*
src/components/site/    landing + shared nav
src/components/app/     dashboard widgets
src/lib/                types, merchants, parse, demo, store, session, google, gmail, snapshot
public/                 manifest + icon
```

## License

MIT.
