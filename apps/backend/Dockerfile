FROM node:20 AS base
RUN npm install -g pnpm@latest
# RUN apk add --no-cache libc6-compat openssl python3
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

WORKDIR /app
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY pnpm-lock.yaml ./

FROM base AS pruner
RUN pnpm add -g turbo
COPY . .
RUN turbo prune @repo/backend --docker

FROM base AS installer
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile --prefer-offline

FROM base AS builder
COPY --from=installer /app .
COPY --from=pruner /app/out/full .
RUN pnpm add -g turbo
RUN if [ -f "packages/db/prisma/schema.prisma" ]; then \
      cd packages/db && pnpm prisma generate; \
    fi
RUN turbo build --filter=@repo/backend

FROM node:20 AS runner
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs
WORKDIR /app
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder --chown=nestjs:nodejs /app/apps/backend/package.json ./apps/backend/
COPY --from=builder --chown=nestjs:nodejs /app/packages ./packages
USER nestjs
EXPOSE 3000

WORKDIR /app/apps/backend
CMD ["node", "dist/main.js"]
