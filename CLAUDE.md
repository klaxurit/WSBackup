# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WinnieSwap is a DeFi protocol on Berachain, based on Uniswapv3's contracts, built as a Turborepo monorepo with three main applications and several shared packages.

## Architecture

### Applications
- **`apps/web`** - React frontend using Vite, Redux Toolkit, React Router
- **`apps/indexer`** - Ponder-based blockchain indexer for event processing
- **`apps/backend`** - NestJS REST API server

### Shared Packages
- **`packages/db`** - Prisma database schema and client
- **`packages/ui`** - Shared React component library
- **`packages/ponder-schema`** - Ponder schema definitions
- **`packages/typescript-config`** - Shared TypeScript configurations
- **`packages/eslint-config`** - Shared ESLint configurations

## Development Commands

### Root Level Commands
```bash
turbo dev                  # Start all apps in development mode
turbo build               # Build all packages and apps
turbo lint                # Lint all packages
turbo check-types         # Run TypeScript type checking
turbo clean               # Clean build artifacts
```

### Database Commands
```bash
pnpm db:generate         # Generate Prisma client
pnpm db:push             # Push schema to database
pnpm db:migrate          # Run database migrations
pnpm db:studio           # Open Prisma Studio
pnpm db:seed             # Seed the database
```

### Individual App Commands
```bash
# Web app (Vite + React)
cd apps/web
pnpm dev                 # Start development server
pnpm build               # Build for production
pnpm lint                # Lint code

# Indexer (Ponder)
cd apps/indexer
pnpm dev                 # Start Ponder in development mode
pnpm start               # Start Ponder in production
pnpm codegen             # Generate Ponder types
pnpm typecheck           # Run TypeScript checking

# Backend (NestJS)
cd apps/backend
pnpm dev                 # Start in watch mode
pnpm build               # Build application
pnpm start:prod          # Start in production mode
pnpm test                # Run tests
pnpm test:e2e            # Run e2e tests
```

## Key Technologies

- **Frontend**: React 19, Vite, Redux Toolkit, React Router, Framer Motion
- **Backend**: NestJS, Drizzle ORM
- **Indexer**: Ponder (blockchain indexing), Viem, Drizzle ORM
- **Database**: PostgreSQL with Prisma
- **Blockchain**: Viem for Ethereum interactions
- **UI**: Custom React component library with Sass
- **Package Manager**: pnpm with workspaces
- **Build Tool**: Turborepo for monorepo orchestration

## Documentations

- [NestJs documentation](https://context7.com/websites/nestjs/llms.txt): Learn about the core concepts behind NestJS and how to use it.
- [Ponder documentation](https://context7.com/websites/ponder_sh/llms.txt): Learn what is ponder and how to use to index events from Berachain and Dex's contracts.
- [Prisma documentation](https://context7.com/prisma/docs/llms.txt): Learn about the core concepts behind Prisma ORM and how to use it.
- [Berachain documentation](https://docs.berachain.com/learn/): An introduction to Berachain, the blockchain where our Dex is deployed.
- [Turborepo documentation](https://turborepo.com/llms.txt): Documentation of turborepo, the tech behind this monorepos (used with pnpm).
- [Uniswap V3 ans Sticky vaults](./documentation/contracts/): Documentation of our implementation of UniswapV3 and Arrakis V1 contracts deployed on Berachain this is the hearth of the WinnieSwap DEX.


## Development Workflow

1. Database changes require running `pnpm db:generate` before building
2. The `build` task has dependencies - packages must be built before apps
3. Development mode (`pnpm dev`) starts all applications concurrently
4. Type checking depends on generated code from database and build artifacts

## Important Notes

- Always run database generation before building: `pnpm db:generate`
- Use `pnpm` as the package manager (configured in `package.json`)
- Node.js >=18 required
- The indexer processes blockchain events using Ponder framework
- Frontend uses Web3Modal and Wagmi for wallet connections