# Phase 1: Foundation, design system, authentication

**Status:** complete · **Date:** 2026-11-25

## Scope delivered

### Monorepo and tooling
- pnpm workspace: `apps/web`, `apps/api`, `packages/shared`.
- Strict TypeScript (`noUncheckedIndexedAccess`), ESLint flat config, Prettier.
- Docker images for API and web, Compose stack (Postgres, Redis, Mailpit, API, web), GitHub Actions CI (lint → typecheck → migrate → test → build → docker build).

### API (NestJS 12, ESM)
- Zod-validated environment; the process refuses to start on bad config.
- Global exception filter → consistent error envelope; response envelope interceptor.
- Pino structured logging with request IDs and redaction of cookies and auth headers.
- Swagger at `/api/v1/docs`, generated from the shared Zod schemas.
- Health: `/health/live`, `/health/ready` (checks the database).
- Auth module: register, verify email, resend verification, login, refresh (rotation + reuse detection), logout, logout everywhere, forgot/reset password, `me`.
- RBAC: User ↔ Role ↔ Permission tables; global `AuthGuard` + `PermissionsGuard`; idempotent seed.
- Admin-only `GET /users` as the first permission-gated endpoint.

### Web (Next.js 16)
- Design tokens (light/dark) per the brand palette, Geist + JetBrains Mono, accessible focus states, reduced-motion support.
- UI primitives: Button, Input, PasswordInput, Field, Alert, Card, Badge, Logo, ThemeToggle.
- Landing page with all ten specified sections, including an interactive lesson preview and a working sample quiz question.
- Auth pages: login, register, forgot/reset password, verify email. Shared Zod validation; API field errors mapped back onto inputs.
- `proxy.ts`: refreshes the session server-side when the access cookie has expired, protects `/dashboard`, `/admin`, `/settings`, and redirects signed-in users away from the guest pages.
- App shell with sidebar; dashboard (welcome state); admin users table gated by `users:read` (403 page otherwise).

## Key decisions

| Decision | Why |
| -------- | --- |
| NestJS over Elysia | Mature DI, guards, OpenAPI, and the testing story suit a large modular codebase. |
| Zod in a shared package, not class-validator | One schema validates the client form, the API request, and generates OpenAPI. |
| Cookies + same-origin rewrite | Tokens are never readable by JS (XSS can't exfiltrate them); there's no CORS in the browser path. |
| User reloaded from the DB on every request | Revocation, disabling and role changes take effect immediately. Phase 2 can add a short Redis cache if needed. |
| Refresh grace window (20s) | Parallel requests or tabs refreshing together must not trip reuse detection and log the user out. |
| Login blocked until email verified | Simpler invariants for later features (notifications, certificates). |
| TypeScript 5.9 pinned | TS 7 (native) lacks the JS API that tooling (SWC/Vitest/Next type-check) still relies on. |
| Prisma 7.10 (not 8 RC) | Latest stable. |

## Verification

- `pnpm lint`, `pnpm typecheck`, `pnpm build`: all pass.
- Tests: 5 shared-schema unit tests, 5 session-rotation unit tests, 8 API e2e tests against a real Postgres (registration, enumeration resistance, credential errors, refresh reuse revoking the family, password reset revoking sessions, RBAC, CSRF origin check, validation errors with request id).
- Manual end-to-end via the Next rewrite: login → dashboard; expired access cookie → transparent refresh; bogus refresh → redirect + cookie cleared; student → `/admin` returns 403.
- Visual check of landing (light and dark) and login at 1440px.

## Known gaps / follow-ups

- Rate limiting is in-memory per instance; switch the throttler to Redis storage in Phase 2.
- No frontend unit tests yet (`apps/web` has the Vitest script ready); add Playwright E2E in Phase 10.
- Docker images copy the full workspace; slim them with `pnpm deploy` in Phase 10.
- Account settings (change password and email, list and revoke sessions) are not built yet; the API primitives exist.
- Docker builds were not run locally (no Docker on the dev machine); CI builds them.

## Next: Phase 2, database schema and backend architecture

1. Curriculum and learning schema: LearningPath, Course, Module, Lesson, LessonContent (versioned, block-structured), CodeExample, Diagram, Category, Tag.
2. Assessment schema: Exercise, ExerciseTestCase, Quiz, Question, QuestionOption, Exam, ExamQuestion, ExamAttempt, ExamAnswer, Submission.
3. Learner schema: UserProgress, LessonBookmark, UserNote, Achievement, UserAchievement, LearningActivity, Project.
4. Content lifecycle (`DRAFT → REVIEW → PUBLISHED → ARCHIVED`) and audit log.
5. Redis module (cache + throttler storage), pagination/sorting/filtering conventions, read APIs for the curriculum.
