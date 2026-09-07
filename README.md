# 🏥 HealHub — Hospital Management & Healthcare Booking Platform

> **Healhub** is a modern, all-in-one healthcare platform that connects **patients**, **doctors**, **hospitals/clinics**, and **administrators** — think of it as the "Uber for healthcare."

This repository is the **Next.js 16 monorepo** rebuild of Healhub (previously a MERN app in `hospital-managment-website`), powered by **Turborepo + npm workspaces**. The backend lives in `apps/api` as Next.js API routes (Mongoose/MongoDB); **web**, **admin**, and **hospital** are the three consuming apps — all sharing the `@healhub/ui` package (theming, splash/landing/404 screens, brand assets).

---

## 🚀 Tech Stack (Final Decided)

### Frontend — all apps (web / admin / hospital)
- **Next.js 16** (App Router — RSC / API routes)
- **TypeScript** — type safety end-to-end
- **Tailwind CSS v4** — utility-first styling (shared theme tokens in `@healhub/ui/theme.css`)
- **Framer Motion** — animations
- **Lucide Icons** — icons
- **React Hook Form** + **Zod** — forms & validation
- **TanStack Query** — server-state
- **Zustand** — client state
- **Axios** — HTTP client

### Backend (`apps/api`)
- **Node.js** (LTS) — runtime
- **Next.js API routes** — primary REST API (auth, CRUD, billing)
- **next-auth** — authentication
- **Mongoose** — ODM
- **Zod** — validation
- **Cloudinary** — image storage
- **Razorpay** — payments

### Database
- **MongoDB** — primary NoSQL database
- **Firebase Firestore** *(optional)* — real-time / serverless sync & auth

### Monorepo
- **Turborepo** + **npm workspaces** — task orchestration (`dev`, `build`, `lint`, `typecheck`)

---

## 🗂️ Monorepo Structure

```
healhub/
├── apps/
│   ├── web/            # Patient-facing website (Next.js 16, port 3000)
│   ├── admin/          # Admin CMS panel (Next.js 16, port 3001)
│   ├── hospital/       # Hospital/Clinic panel (Next.js 16, port 3002)
│   └── api/            # Backend API (Next.js 16, MongoDB, port 4000)
├── packages/
│   ├── ui/             # Shared UI — theme, splash, landing, not-found, compass, brand, images
│   ├── types/          # Shared TypeScript types
│   └── config/         # Shared eslint / tsconfig presets
├── package.json        # Workspace root (npm workspaces)
├── turbo.json          # Turborepo config
└── PROJECT_ARCHITECTURE.md   # Full architecture guide & decision log
```

> 📖 **See [`PROJECT_ARCHITECTURE.md`](./PROJECT_ARCHITECTURE.md)** for the complete stack comparison, structure decisions, deployment options, and backend framework analysis.

---

## 🎯 The Platforms

| Website | Users | Port | Purpose |
|---------|-------|------|---------|
| **web** | Patients | 3000 | Discover doctors/hospitals, book appointments, pay, view prescriptions |
| **admin** | Platform admins | 3001 | User management, content moderation, analytics, billing |
| **hospital** | Hospitals/Clinics | 3002 | Manage doctors, rooms/beds, patients, revenue |
| **api** | (backend) | 4000 | REST API — auth, CRUD, billing, MongoDB |

---

## 🧱 Architecture: Hybrid Backend

```
web / admin / hospital  →  Next.js API routes (apps/api)  (auth, CRUD, billing, DB)
```

- The whole REST/CRUD layer lives in `apps/api` (Next.js routes + Mongoose).
- A **FastAPI/ML service** can be added later — never expose it to the public; only the API app talks to it.

---

## 🔐 Roles & Authentication

Four roles with role-based access control (RBAC):

| Role | Token / Access |
|------|----------------|
| Patient | Web app access |
| Doctor | Doctor panel |
| Hospital | Hospital panel |
| Admin | Admin CMS |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+ (LTS recommended)
- npm 11+ (this repo uses **npm workspaces**, not pnpm)
- MongoDB (local or Mongo Atlas)
- Razorpay account *(for payments)*
- Cloudinary account *(for images)*

### 1. Install & setup Monorepo

```bash
# (from repo root)
npm install
```

### 2. Environment variables

The backend app needs its own `.env.local`:

```env
# apps/api/.env.local
MONGODB_URI=mongodb://localhost:27017/healhub
JWT_SECRET=your_secret
CLOUDINARY_URL=your_url
```

And a public URL for the web app:

```env
# apps/web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### 3. Run the dev servers

```bash
# Run all apps in parallel
npm run dev

# Run a single app
npm run dev:web        # port 3000
npm run dev:admin      # port 3001
npm run dev:hospital   # port 3002
npm run dev:api        # port 4000

# Quality checks
npm run lint
npm run typecheck
npm run build
```

---

## 🗓️ Roadmap

- [x] Define architecture & tech stack (monorepo, Next.js 16, Tailwind v4, MongoDB)
- [x] Scaffold monorepo with Turborepo + npm workspaces
- [x] Shared `@healhub/ui` package — theme (light/dark), splash, landing, 404, brand assets
- [ ] Build **web** (patient: discover, book, pay, prescriptions)
- [ ] Build **admin** CMS (users, content, analytics)
- [ ] Build **hospital** panel (doctors, rooms/beds, revenue)
- [ ] Razorpay payments
- [ ] Cloudinary image uploads
- [ ] 4-role RBAC auth
- [ ] Firebase real-time sync *(optional)*
- [ ] **FastAPI + AI/ML** (doctor recommendation, symptom analysis)

---

## 📚 Docs

- `PROJECT_ARCHITECTURE.md` — full architecture, stack comparison & decision log
- `CLAUDE.md` / `AGENTS.md` — agent/editor notes

---

## 📄 License

MIT — see `LICENSE`.
