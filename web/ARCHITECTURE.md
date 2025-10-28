## web/ architecture and developer instructions

This document explains the structure, conventions, and common developer workflows for the `web/` Next.js frontend in this repository.

## High level

- Framework: Next.js (App Router). The project uses Next 15 and React 19.
- Styling: Tailwind CSS + PostCSS. Design tokens and CSS custom properties are used for consistent spacing and sizing.
- API contract: `openapi.json` in the `web/` root is the source of truth for the typed client that lives under `src/api/` (generated via the repository script).
- Development tooling: pnpm (workspace), Storybook for UI components, MSW for mocking, eslint + prettier for linting/formatting.

## Key files

- `package.json` — scripts (dev, build, storybook), dependencies and devDependencies for the web app.
- `next.config.ts` — Next.js configuration. Exposes `NEXT_PUBLIC_API_BASE_URL` to the app and logs it in development.
- `src/` — application source code (see layout below).
- `public/` — static assets.

## Directory layout (important folders)

- `src/app/` — Next.js App Router pages and server/client components. Entry points for routes live here.
- `src/api/` — Generated TypeScript API client.
- `src/components/` — Reusable UI primitives and design-system components (common/figma/icons etc.).
- `src/domains/` — Domain-driven features (e.g., `bus-stop/`, `route-search/`). Each domain contains UI + business logic for that area.
- `src/lib/` — Utilities and thin wrappers around the generated API client (error handling, base URL, helpers).
- `src/mocks/` — MSW handlers and mocked fixtures used during development and testing.
- `src/hooks/` — React hooks used across the app.
- `src/types/` — Domain types that bridge API shapes with UI needs.

## Environment variables

- `NEXT_PUBLIC_API_BASE_URL` — base URL of the API the frontend calls (exposed to browser).
- Add env vars to `.env.local` for local development. `next.config.ts` reads `NEXT_PUBLIC_API_BASE_URL` and logs it during dev.

Example `.env.local`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8002
```

## Mocks (MSW)

- `src/mocks/` contains MSW handlers used during local development and testing. The app can run with MSW enabled to avoid needing the backend.
- Keep mock shapes aligned with `openapi.json` so the mocked responses match the generated types.

## Testing & linting

- Linting: `pnpm lint` runs `eslint` and `prettier` checks. Use `pnpm lint:fix` to auto-fix where possible.
- Unit/Integration tests (if present) use the workspace test runner. Storybook is used for visual component testing.

## Common gotchas & notes

- Ensure `NEXT_PUBLIC_API_BASE_URL` points to the running API (e.g., `http://localhost:8002`) during local dev.
