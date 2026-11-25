# Build context: repository root.  docker build -f apps/api/Dockerfile .
FROM node:24-alpine AS base
RUN corepack enable
WORKDIR /app

FROM base AS build
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/shared/package.json packages/shared/
RUN pnpm install --frozen-lockfile --filter @academy/api...
COPY tsconfig.base.json ./
COPY packages/shared packages/shared
COPY apps/api apps/api
# prisma.config.ts reads DATABASE_URL; generation doesn't connect, so a placeholder is fine.
ENV DATABASE_URL=postgresql://build:build@localhost:5432/build
RUN pnpm --filter @academy/shared build && pnpm --filter @academy/api build

FROM base AS runtime
ENV NODE_ENV=production
COPY --from=build --chown=node:node /app /app
USER node
WORKDIR /app/apps/api
EXPOSE 4000
HEALTHCHECK --interval=15s --timeout=3s --start-period=20s CMD wget -qO- http://127.0.0.1:4000/api/v1/health/live || exit 1
# Apply pending migrations, then start. For multi-replica deploys run migrations as a separate release step.
CMD ["sh", "-c", "npx prisma migrate deploy && node --enable-source-maps dist/main.js"]
