FROM node:20 AS base
RUN npm install -g pnpm@latest
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

WORKDIR /app
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY pnpm-lock.yaml ./

FROM base AS pruner
RUN pnpm add -g turbo
COPY . .
RUN rm -rf out
RUN turbo prune @repo/indexer --docker

FROM base AS installer
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install

FROM base AS builder
COPY --from=installer /app .
COPY --from=pruner /app/out/full .
RUN pnpm add -g turbo
RUN turbo build --filter=@repo/indexer

FROM node:20 AS runner

WORKDIR /app
COPY --from=builder /app/ ./

WORKDIR /app/apps/indexer

EXPOSE 42069
CMD ["npx", "ponder", "start"]
