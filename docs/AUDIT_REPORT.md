# HealHub Project Audit Report

**Date:** 2026-10-27  
**Branch:** `dev`  
**Commit:** `d9c1ae1e64b4d2021a5ca29a02f302ee18678746`  
**Type:** Monorepo (Turborepo + npm workspaces)

## 1) Overview
- **Name:** healhub (v0.4.0 root)
- **Stack:** Next.js 16.3.4 (App Router, Route Handlers), React, TypeScript/JS, Tailwind CSS
- **Backend:** Next.js API app in `apps/api` (Node runtime) with Mongoose 8.21, MongoDB Atlas
- **Apps:** `apps/web` (patient, :3000), `apps/admin` (:3001), `apps/hospital` (:3002), `apps/api` (:4000)
- **Packages:** `packages/ui`, `packages/types`, `packages/config`
- **Deployment:** Render blueprint in `render.yaml` (API service, free tier), health check at `/api/health`
- **Build tooling:** Turborepo 2.3.0, webpack mode (`--webpack`) for all apps, Next/Turbo caching disabled in recent changes

## 2) Structure
```
apps/
  admin/      # Admin panel (Next.js)
  api/        # Backend API (Next.js Route Handlers)
  hospital/   # Hospital/Clinic/Doctor portal (Next.js)
  web/        # Patient web app (Next.js)
packages/
  config/     # Shared config (eslint)
  types/      # Shared TypeScript types
  ui/         # Shared UI components, theme (Lagoon/Lagoon Midnight), fonts
```

## 3) Dependencies (high-level)
- **API:** mongoose ^8.21.0, bcrypt, jsonwebtoken, cloudinary, validator, next-auth, zod (where used)
- **Frontend:** axios, react-hot-toast, framer-motion, lucide-react, next-themes/@healhub/ui theme, socket.io-client
- **Payments/Billing:** Removed (Razorpay removed in recent commits)
- **Auth:** JWT-based auth for users/hospitals/doctors; admin auth via env vars (`ADMIN_EMAIL`/`ADMIN_PW`)

## 4) Environment & Security
### Environment Variables
- **Frontend apps:** Use `NEXT_PUBLIC_API_URL` for API endpoint. `.env.example` files now contain only `NEXT_PUBLIC_API_URL` (demo creds removed).
- **API:** Uses `MONGODB_URI`, `JWT_SECRET`, `CLOUDINARY_*`, `ADMIN_EMAIL`, `ADMIN_PW`, `CORS_ORIGIN`, `AUTH_SECRET`, etc.
- **Secrets:** API keys/tokens are in `apps/api/.env` (local). Never commit real secrets.
- **CORS:** Configured via `apps/api/lib/http.ts` with allowed origins.
- **Health check:** `/api/health` does a DB ping (`db.admin().command({ping:1})`) with 2s timeout, always returns 200 with `db` status.

### Security Notes
- **Demo credentials:** UI elements removed from logins and demo pages. `/demo-cred` routes deleted. `/demo` page remains (project info only).
- **Floating demo button & navbar demo link:** Removed from web app.
- **Service workers:** Skip caching `/api/` (and non-GET requests).
- **MongoDB hardening:** Connection options in `apps/api/lib/db.ts` (pool settings, `bufferCommands: false`, `family: 4`), read-retry logic in `apps/api/lib/readRetry.ts`.
- **Atlas pause:** Free clusters pause after 30 days idle; must be resumed manually in Atlas UI.

## 5) Database Models (apps/api/lib/models)
Key models (inferred): `userModel`, `doctorModel`, `hospitalModel`, `appointmentModel`, etc. Relationships: doctors linked to hospitals via `hospitalId`. Appointments reference users/doctors/hospitals.

## 6) API Routes (apps/api/app/api)
Route handlers cover auth, appointments, doctors, hospitals, users, availability, admin actions, etc. Health check at `/api/health`. Demo routes removed.

## 7) Build & Tests
- **Typecheck:** All 4 apps pass (`npm run typecheck`)
- **Lint:** All 4 apps pass (`npm run lint`)
- **Build:** All 4 apps pass (`npm run build`)
- **Availability tests:** 21/21 passed (`apps/api/scripts/test-availability.ts`)
- **Read-retry tests:** 9/9 passed (`apps/api/scripts/test-read-retry.ts`)

## 8) Recent Changes (dev branch)
- Removed demo UI from web navbar and floating button; dropped `/demo-cred` routes (kept `/demo` page)
- Pushed MongoDB health check ping and corrected Atlas pause guidance
- Added demo credentials route support earlier, then reverted per requirements
- Removed Razorpay/billing UI and API modules
- Added MongoDB connection hardening and read-retry mechanism
- Implemented appointment rescheduling functionality
- Cleaned up caches (~5.8 GB reclaimed)

## 9) Recommendations
- **Secrets:** Rotate any exposed credentials (API keys in `apps/api/.env` should be treated as compromised if shared).
- **Migrations:** Run migrations for schema changes if needed (no migration script visible).
- **Monitoring:** Consider uptime monitoring for Render free tier (spin-down after 15 min idle).
- **Dependencies:** Audit dependencies for vulnerabilities regularly (`npm audit`).
- **CORS:** Restrict `CORS_ORIGIN` to production domains only.
- **Rate limiting:** Ensure rate limiting is enabled for auth endpoints.
- **Backups:** Configure MongoDB Atlas backups for production data.
- **Cleanup:** Remove `.next` and `.turbo` directories if committing large artifacts (already gitignored appropriately).

## 10) Files of Interest
- `render.yaml` - Deployment config
- `turbo.json` - Monorepo task config
- `scripts/clean.mjs` - Build/cache cleanup
- `scripts/clean-mongodb-atlas.js` - **DANGEROUS** DB cleanup (gitignored)
- `docs/demo-seed-data.md` - Demo data reference
- `docs/connection-hardening.md`, `docs/mongodb-connection-disconnects.md` - DB docs
- `apps/api/lib/db.ts`, `apps/api/lib/readRetry.ts` - DB resilience

## 11) Dependency Update Audit (2026-10-27)

**Status:** Not updated now. For reference only.

### Summary
No, not all dependencies are up to date. Most are on recent patch/minor versions, but several packages have major version bumps available. Updating major versions is not recommended at this time due to potential breaking changes in this monorepo.

### Detailed Breakdown

| Package | Current | Wanted | Latest | Risk | Notes |
|---|---|---|---|---|---|
| @types/node | 20.19.43 | 20.19.43 | 26.6.5 | High (Major) | Node 20 types are correct; v26 would require Node version change. |
| @types/react / @types/react-dom | 19.2.18 / 19.2.7 | 19.3.0 | 19.3.0 | Low | Aligns with React 19.3. Safe minor bump. |
| axios | 1.20.0 | 1.21.0 | 1.21.0 | Low | Safe minor bump. |
| dotenv | 17.4.2 | 17.4.2 | 18.0.9 | Medium-High (Major) | v18 has changes; check API env loading. |
| eslint | 9.39.5 | 9.39.5 | 10.13.0 | High (Major) | ESLint v10 may break eslint-config-next/flat config. |
| eslint-config-next | 16.3.4 | 16.3.4 | 16.4.3 | Low | Should match Next version if updated. |
| framer-motion | 11.18.2 | 11.18.2 | 14.6.0 | High (Major) | Large jump; could break animations. |
| lenis | 1.3.26 | 1.3.27 | 1.3.27 | Low | Safe patch. |
| lucide-react | 0.468.0 | 0.468.0 | 1.62.0 | High (Major) | Icon API mostly stable but easy to miss. |
| mongoose | 8.24.4 | 8.24.7 | 9.11.4 | High (Major) | v9 has breaking changes to queries/options/types. |
| next | 16.3.4 | 16.3.4 | 16.4.3 | Low-Medium | Minor bump; test build/dev/typecheck. |
| next-auth | 5.0.0-beta.32 | 5.0.0-beta.32 | 4.24.15 | N/A | Using Auth.js v5 beta (correct for setup). Ignore "latest" here. |
| react / react-dom | 19.2.8 | 19.2.8 | 19.3.1 | Low | Safe patch/minor update possible. |
| react-hook-form | 7.87.0 | 7.91.0 | 7.91.0 | Low | Safe minor bump. |
| tsx | 4.23.13 | 4.23.15 | 4.23.15 | Low | Safe patch. |
| turbo | 2.10.12 | 2.11.10 | 2.11.10 | Low | Safe minor bump. |
| typescript | 5.9.3 | 5.9.3 | 7.0.2 | Very High (Major) | TS 7 is new; Next 16.3.4 validated against TS 5.x. |
| zod | 3.25.76 | 3.25.76 | 4.6.7 | High (Major) | v4 has breaking schema/API changes. |

### Recommended Update Plan
**Do now (low risk):** `axios`, `@types/react`, `@types/react-dom`, `react-hook-form`, `lenis`, `tsx`, `turbo`  
**Test later (low-medium):** `next`, `eslint-config-next`, `react`, `react-dom`  
**Hold off:** `mongoose@9`, `typescript@7`, `eslint@10`, `zod@4`, `framer-motion@14`, `lucide-react@1.x`, `dotenv@18`, `@types/node@26`, `next-auth`

**Decision:** Dependencies will not be updated at this time.
