# WinnieSwap Agent Guidelines

## Project Overview

WinnieSwap is a DeFi protocol on Berachain, based on Uniswapv3's contracts, built as a Turborepo monorepo with three main applications and several shared packages.

## Architecture

### Applications
- **`apps/web`** - React frontend using Vite, Redux Toolkit, React Router.
- **`apps/indexer`** - Ponder-based blockchain indexer for event processing
- **`apps/backend`** - NestJS REST API server

### Shared Packages
- **`packages/db`** - Prisma database schema and client
- **`packages/ui`** - Shared React component library
- **`packages/ponder-schema`** - Ponder schema definitions
- **`packages/typescript-config`** - Shared TypeScript configurations
- **`packages/eslint-config`** - Shared ESLint configurations

## Build/Lint/Test Commands

### Root Level (Turborepo)

- `turbo build` - Build all packages and apps
- `turbo lint` - Lint all packages
- `turbo check-types` - TypeScript type checking
- `turbo dev` - Start all apps in development

### Backend (NestJS)

- `pnpm test` - Run all Jest tests
- `pnpm test -- <pattern>` - Run single test file (e.g., `pnpm test -- token.spec.ts`)
- `pnpm test:watch` - Run tests in watch mode
- `pnpm test:cov` - Run tests with coverage
- `pnpm test:debug` - Debug tests
- `pnpm test:e2e` - Run end-to-end tests
- `pnpm lint` - ESLint with auto-fix

### Database (Prisma)

- `pnpm db:generate` - Generate Prisma client
- `pnpm db:push` - Push schema to database
- `pnpm db:migrate` - Run migrations
- `pnpm db:studio` - Open Prisma Studio
- `pnpm db:seed` - Seed database

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
- [Official Ponder documentation](https://context7.com/websites/ponder_sh/llms.txt): Learn what is ponder and how to use to index events from Berachain and Dex's contracts.
- [indexer implementation](./documentation/indexer/): Generated documentation of the indexer. This documentation is generated and maybe not up to date, but it's a good entrypoint to learn how work our indexer.
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

## Code Style Guidelines

### Imports

- Group external libraries first, then internal imports
- Use single quotes for all imports
- Sort imports alphabetically within groups

### Formatting

- **Prettier**: singleQuote: true, trailingComma: "all"
- **Line length**: No strict limit, use discretion
- **Indentation**: 2 spaces (Prettier default)

### TypeScript

- **Strict mode**: Enabled with strictNullChecks
- **Naming**: PascalCase for classes/interfaces, camelCase for variables/functions
- **Types**: Prefer explicit types over inference for public APIs
- **Optional properties**: Use `?:` for optional properties
- **Generics**: Use descriptive names like `TData`, `TError`

### Error Handling

- Use try-catch blocks with proper logging
- Backend: Use NestJS Logger for structured logging
- Frontend: Use console.error for development, proper error boundaries for production
- Always throw/reject errors rather than returning null/undefined

### Architecture Patterns

- **Backend**: NestJS with dependency injection, modules, services, controllers
- **Frontend**: React with hooks, Redux Toolkit for state management
- **Database**: Prisma ORM with PostgreSQL
- **Blockchain**: Viem for Ethereum interactions

### File Organization

- Group related functionality in feature modules
- Use index.ts files for clean imports
- Separate types, utils, and business logic appropriately

### Security

- Never commit secrets or API keys
- Use environment variables for configuration
- Validate all user inputs
- Follow principle of least privilege

### Testing

- Write unit tests for utilities and services
- Integration tests for API endpoints
- E2E tests for critical user flows
- Mock external dependencies appropriately
