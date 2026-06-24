<div align="center">

# PRDForge

**From idea to investor‑ready PRD in 60 seconds.**

AI‑powered generator that turns a one‑sentence product description into a complete, professional **19‑section Product Requirement Document** — with Mermaid diagrams, user flows, and technical specifications.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![DeepSeek AI](https://img.shields.io/badge/AI-DeepSeek-7C3AED)](https://www.deepseek.com/)

</div>

---

## Overview

PRDForge helps founders, product managers, and developers skip the blank page. Describe what you want to build in plain language, and PRDForge generates a structured, presentation‑ready PRD in seconds. You can refine any section through an AI chat assistant, visualize architecture and flows with auto‑generated diagrams, and export the result as Markdown.

The app ships with authentication, role‑based access, tiered subscription billing (Midtrans), and a full admin panel.

## Features

- **⚡ AI generation** — Produces a complete 19‑section PRD from a short prompt using DeepSeek AI.
- **💬 AI chat revision** — Iterate on any section conversationally until it's right.
- **📊 Auto diagrams** — Mermaid‑based user flows, ERDs, and system architecture rendered inline.
- **📝 Rich editor** — Edit sections with a TipTap‑powered editor and live Markdown rendering.
- **📤 Markdown export** — Download the finished PRD as Markdown (paid tiers).
- **🔐 Authentication** — Email/password (JWT, HTTP‑only cookies) and Google OAuth.
- **💳 Subscription billing** — Tiered plans paid via Midtrans (Snap), with server‑side webhook + status verification.
- **🛡️ Anti‑abuse** — Rate limiting, device fingerprinting, and fraud heuristics.
- **🧑‍💼 Admin panel** — User management, audit logs, usage stats, and API‑key administration.
- **🌐 i18n & theming** — English / Bahasa Indonesia, light/dark mode.

## The 19 PRD Sections

`Executive Summary` · `Problem Statement` · `Product Vision & OKRs` · `Target Users & Personas` · `User Stories` · `User Flow & Journey` · `Feature List (MoSCoW)` · `System Architecture` · `Use Case Diagram` · `Data Model (ERD)` · `Tech Stack Recommendation` · `API Design` · `Non‑Functional Requirements` · `Pricing & Plans` · `Milestones & Roadmap` · `Success Metrics / KPIs` · `Risks & Mitigations` · `Open Questions` · `Appendices`

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router), React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS v4, shadcn / Base UI, Framer Motion |
| Editor & rendering | TipTap, react‑markdown, remark‑gfm, Mermaid |
| Database / ORM | PostgreSQL (Supabase) + Prisma 6 |
| Auth | `jose` (JWT, HS256), bcryptjs, Google OAuth |
| AI | DeepSeek API |
| Payments | Midtrans (Snap) |
| Validation | Zod |

## Project Structure

```
prdforge/
├── prisma/
│   ├── schema.prisma        # Data model
│   └── seed.mjs             # Seed (admin user, etc.)
├── src/
│   ├── app/
│   │   ├── api/             # Route handlers (auth, prd, payment, admin, users)
│   │   ├── (marketing)/     # Landing, pricing
│   │   ├── auth/            # Login / register
│   │   ├── dashboard/       # App: PRDs, chat, billing, settings
│   │   ├── editor/[id]/     # PRD editor
│   │   └── admin/           # Admin panel
│   ├── components/          # UI + feature components
│   ├── lib/
│   │   ├── server/          # Server-only: db, auth, jwt, env, midtrans, deepseek…
│   │   ├── i18n/            # Translations (en / id)
│   │   └── auth/            # Client auth context
│   └── proxy.ts             # Edge middleware (route protection)
└── .env.example             # Environment template
```

## Getting Started

### Prerequisites

- Node.js 20+
- A PostgreSQL database (e.g. [Supabase](https://supabase.com/), or local via `docker compose up`)
- API keys: DeepSeek, Midtrans (sandbox is fine for development), Google OAuth (optional)

### 1. Install

```bash
git clone <your-repo-url>
cd prdforge
npm install
```

> `postinstall` automatically runs `prisma generate`.

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in the values (see [Environment Variables](#environment-variables)).

### 3. Set up the database

```bash
# For local Postgres only:
docker compose up -d

# Apply schema + seed the admin user
npm run db:push      # or: npm run db:migrate
npm run db:seed
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Required | Description |
|----------|:--------:|-------------|
| `DATABASE_URL` | ✅ | Pooled Postgres connection (runtime) |
| `DIRECT_URL` | ✅ | Direct connection (for migrations) |
| `JWT_SECRET` | ✅ | Secret for signing JWTs — `openssl rand -base64 48` |
| `JWT_EXPIRES_IN` | — | Token lifetime in seconds (default `604800`) |
| `ENCRYPTION_KEY` | ✅ | 32‑byte hex key (AES‑256‑GCM) for encrypting the stored DeepSeek key — `openssl rand -hex 32` |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` | ✅ | Seed admin credentials |
| `MIDTRANS_SERVER_KEY` / `MIDTRANS_CLIENT_KEY` | ✅ | Midtrans access keys |
| `MIDTRANS_IS_PRODUCTION` | — | `false` for sandbox, `true` for live |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | — | Google OAuth credentials |
| `GOOGLE_REDIRECT_URI` | — | Defaults to `<APP_URL>/api/auth/google/callback` |
| `NEXT_PUBLIC_APP_URL` | ✅ | Public app URL (e.g. `https://prdforge.com`) |

> ⚠️ The DeepSeek API key is configured by an admin inside the app (Admin → API Keys) and stored **encrypted** with `ENCRYPTION_KEY`.

## NPM Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Push the Prisma schema to the database |
| `npm run db:migrate` | Create & apply a dev migration |
| `npm run db:deploy` | Apply migrations in production |
| `npm run db:seed` | Seed the database |
| `npm run db:studio` | Open Prisma Studio |

## Pricing Tiers

| Plan | Price (IDR/mo) | PRDs | AI Chat | Export |
|------|---------------:|------|---------|:------:|
| Free | 0 | 3 (lifetime) | 3 (lifetime) | ❌ |
| Starter | 75,000 | 5 / month | 100 / month | ✅ |
| Pro | 149,000 | Unlimited | Unlimited | ✅ |
| Pro Bundle | 199,000 | Unlimited | Unlimited | ✅ |

> VA fee policy is **“Merchant Pays”**: customers are charged exactly the plan price with no admin‑fee surcharge.

## API Overview

| Endpoint | Description |
|----------|-------------|
| `POST /api/auth/register` · `login` · `logout` | Email/password auth |
| `GET /api/auth/google` · `…/callback` | Google OAuth flow |
| `GET /api/users/me` | Current user + usage summary |
| `POST /api/prd/generate` | Generate a new PRD |
| `POST /api/prd/[id]/chat` | AI chat revision |
| `PATCH /api/prd/[id]/section` | Update a section |
| `GET /api/prd/[id]/export/markdown` | Export as Markdown |
| `POST /api/payment/create` | Create a Midtrans transaction |
| `POST /api/payment/webhook` | Midtrans payment notification |
| `GET /api/payment/status` | Confirm payment status (source of truth) |
| `GET /api/admin/*` | Users, audit, stats, API keys (admin only) |

## Deployment (Vercel)

1. Import the repository into Vercel.
2. Set **all** required environment variables (above). In particular, set `NEXT_PUBLIC_APP_URL` to your production URL.
3. Deploy. `prisma generate` runs automatically via `postinstall`.
4. Apply database migrations against your production DB:
   ```bash
   npm run db:deploy
   ```
5. In the **Midtrans Dashboard**, set the Payment Notification URL to `<APP_URL>/api/payment/webhook`, and set the VA admin fee to *Charge to: Merchant*.
6. In **Google Cloud Console**, add `<APP_URL>/api/auth/google/callback` as an authorized redirect URI.

### Production checklist

- [ ] `NEXT_PUBLIC_APP_URL` points to the live domain
- [ ] Strong `JWT_SECRET` and real `ENCRYPTION_KEY` set
- [ ] `ADMIN_PASSWORD` changed from the default
- [ ] Midtrans production keys + `MIDTRANS_IS_PRODUCTION="true"` (for live payments)
- [ ] Database migrated and admin seeded

## Security

- Passwords hashed with bcrypt; sessions via signed, HTTP‑only JWT cookies.
- Route protection at the edge (`proxy.ts`) with deeper checks (ban status, roles) in API handlers.
- Midtrans webhooks are signature‑verified, and transaction status is reconfirmed directly with Midtrans before upgrading a plan.
- Secrets are never committed (`.env*` is git‑ignored); the DeepSeek key is stored encrypted at rest.

## License

This project is private and proprietary. All rights reserved.

---

<div align="center">
Built by <strong>Ardian3D</strong> · Powered by <strong>DeepSeek AI</strong>
</div>
