# PS-06 Project Lucida (Vite + React + Hono/tRPC)

This is a dual-pane adaptive reading environment:
- Paste text into the Source pane and **Rehydrate** into a token-indexed corpus.
- Adjust typographic CSS custom properties (font, spacing, line height, column width, background tint) with live reflow.
- Use manual or timer-based progressive word highlighting.
- Save/load named presets via `localStorage`, and share settings via URL hash.

## Prerequisites

- Node.js 20+

## Install

```bash
npm ci
```

## Run (development)

```bash
npm run dev
```

Vite runs on `http://localhost:3000/`.
The dev server also mounts the API (Hono + tRPC) via `@hono/vite-dev-server`.

If you're running commands from the workspace root (`D:\Horizon`), you can also do:

```bash
npm --prefix 04_final/app run dev
```

Note: `--prefix` is relative to your current directory. If you're already in `04_final/app`, do **not** pass `--prefix 04_final/app` (it will look for `04_final/app/04_final/app`).

Note: Backend environment variables are **not required** in dev unless you’re testing auth/DB.

## Run (production)

1) Create an env file:

```bash
cp .env.example .env
```

2) Fill values in `.env` (see `.env.example`). In production mode, missing backend env vars will throw at startup.

3) Build and start:

```bash
npm run build
npm run start
```

## Useful scripts

- `npm run check` — TypeScript build
- `npm run lint` — ESLint
- `npm run format` — Prettier
- `npm run test` — Vitest (configured to pass when there are no tests yet)

## Code map

- `src/pages/LucidaApp.tsx` — main Lucida UI composition + CSS var scheduling + URL persistence
- `src/components/*` — capture pane, reading pane, controls, presets, ruler
- `src/hooks/*` — tokenization, rAF CSS scheduler, highlight automaton, analytics, local presets
- `api/*` — Hono server + tRPC routers (used in dev and bundled for production)
