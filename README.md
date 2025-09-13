# Mutual Fund Portfolio Tracker - Backend (Assignment)

This repository is a ready-to-run backend skeleton for the Mutual Fund Portfolio Tracker assignment.

## Features included
- User signup / login (JWT)
- Add portfolio item (captures purchase NAV)
- Portfolio valuation endpoint (current market value, P/L)
- Fund NAV storage (latest + history models)
- Daily cron job scaffold for NAV updates (node-cron)
- Utilities for calling external MF API (mfapi.in)
- Basic security: bcrypt, JWT, rate-limiter & helmet installed

## Quick start

1. Copy `.env.example` → `.env` and update values (Mongo URI, JWT secret).
2. Install dependencies:
```bash
npm install
```
3. Run in dev:
```bash
npm run dev
```
4. API endpoints (examples)
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/portfolio/add` (auth required)
- `GET /api/portfolio/value` (auth required)

## Notes
- The mfapi helpers call `https://api.mfapi.in` as configured in `.env`. If you are offline or that service is unavailable, the endpoints will throw errors — the code contains basic retry/backoff.
- The cron job will run when the server starts (uses CRON_SCHEDULE and timezone Asia/Kolkata).

