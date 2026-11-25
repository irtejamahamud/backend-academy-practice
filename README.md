# Backend Academy

A structured, interactive learning platform for backend engineering, from programming fundamentals to distributed systems and system design.

> **Status:** Phase 1 of 10 complete (foundation, design system, authentication). See [docs/phases/phase-01.md](docs/phases/phase-01.md).

## Stack

| Layer    | Technology |
| -------- | ---------- |
| Web      | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Lucide |
| API      | NestJS 12 (native ESM), Zod validation, OpenAPI/Swagger, Pino |
| Data     | PostgreSQL 16, Prisma 7 (driver adapter `@prisma/adapter-pg`) |
| Shared   | `@academy/shared`: Zod schemas, API envelopes, roles and permissions, used by both apps |
| Infra    | Docker, Docker Compose, GitHub Actions |

## Repository layout

```
apps/
  api/            NestJS REST API
    prisma/       schema, migrations, seed
    src/
      common/     errors, http (request id, envelope, CSRF origin check), validation, auth decorators
      config/     Zod-validated environment
      modules/    auth, users, mail, health
    test/         e2e tests (real database)
  web/            Next.js app
    src/
      app/        routes: (marketing), (auth), (app)
      components/ ui (design system), marketing, auth, app
      lib/        api clients, auth session, curriculum outline
      proxy.ts    session refresh + route protection
packages/
  shared/         contracts shared by web and api
docs/             phase reports and architecture notes
```

## Getting started

Requirements: Node 24 (or ≥ 22.12), pnpm 11, and PostgreSQL 16.

```bash
pnpm install

# 1. A database. Either Docker…
docker compose up -d postgres mailpit       # Postgres on :5433, Mailpit UI on :8025
# …or Prisma's local dev server, with no Docker:
#   cd apps/api && npx prisma dev --name academy --detach

# 2. Configure
cp apps/api/.env.example apps/api/.env      # set DATABASE_URL and JWT_ACCESS_SECRET
cp apps/web/.env.example apps/web/.env.local

# 3. Migrate and seed (roles, permissions, first admin from SEED_ADMIN_*)
pnpm db:migrate
pnpm db:seed

# 4. Run web (:3000) and API (:4000)
pnpm dev
```

- App: http://localhost:3000
- API docs (Swagger): http://localhost:4000/api/v1/docs
- Email: with `SMTP_URL` unset, verification and reset links are printed to the API log. With Mailpit, open http://localhost:8025.

Full stack in containers: `docker compose up --build`.

## Scripts

| Command | What it does |
| ------- | ------------ |
| `pnpm dev` | Shared package watch, API (tsc + node --watch), Next dev server |
| `pnpm lint` / `pnpm typecheck` | ESLint and TypeScript across the workspace |
| `pnpm test` | Unit tests plus API e2e tests (e2e needs `DATABASE_URL`) |
| `pnpm build` | Production builds of all packages |
| `pnpm db:migrate` / `pnpm db:seed` | Prisma migrations and idempotent seed |

## Conventions

- **Responses:** success `{ data }`; error `{ error: { code, message, requestId, details? } }`. Codes are in `packages/shared/src/api.ts`.
- **Validation:** one Zod schema per input in `@academy/shared`, used by the form on the client and by `ZodValidationPipe` on the server.
- **Layers:** controllers handle HTTP only; services hold business logic; repositories own Prisma queries.
- **Authorization:** every route requires authentication unless marked `@Public()`. `@RequirePermissions()` is checked server-side, and roles map to permissions in `packages/shared/src/roles.ts`.
- **Request tracing:** `x-request-id` is accepted or generated, logged on every line, and returned in error bodies.

## Security model (authentication)

- Argon2id password hashing (OWASP parameters), with transparent rehash on login.
- 15-minute JWT access token and 30-day opaque refresh token, both in `HttpOnly`, `SameSite=Lax` cookies (`Secure` in production).
- Refresh tokens rotate on every use and are stored only as SHA-256 hashes. Replaying a rotated token after a 20-second grace window revokes the whole session family.
- The browser only talks to the web origin; Next rewrites `/api/*` to the API, so cookies are first-party.
- CSRF defence in depth: `SameSite=Lax`, plus an `Origin`/`Sec-Fetch-Site` check on state-changing requests.
- No account enumeration: register, forgot-password and resend-verification respond identically, and login burns equal hashing time for unknown emails.
- Password reset revokes all sessions. Email verification and reset tokens are single-use and hashed at rest.
- Per-IP rate limits, with a stricter limit on credential and email endpoints. Helmet security headers on the API and security headers on the web app.
