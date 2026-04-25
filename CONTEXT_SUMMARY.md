# CONTEXT SUMMARY — Horizon / Project Lucida

## TL;DR
- **Canonical runnable app:** `04_final/app` (Vite + React frontend + Hono + tRPC backend).
- **Earlier iterations:** `01/` (React+TS Lucida prototype), `02/project-lucida/` (React JS prototype). `03/` is empty.
- **Backend persistence:** Drizzle ORM + **MySQL** (Planetscale mode). Note: `04_final/backend.md` still describes **SQLite** and is outdated.

---

## 1) Workspace Map (What each top-level folder is)

### `04_final/`
- **Purpose:** “Final” integrated version with backend API, auth, DB schema, and production build.
- **Key paths:**
  - `04_final/app/` — the actual app (frontend + backend).
  - `04_final/backend.md` — design doc, **out of date** (SQLite example; current code is MySQL).

### `01/`
- **Purpose:** Earlier “zero-backend” Lucida single-page app in React + TypeScript + Vite.
- **Notable:** Implements most Lucida reading UX concepts purely client-side.

### `02/`
- **Purpose:** Earlier iteration with `02/project-lucida/` (React + Vite, JS) and local hooks/lexicon experiments.
- **Note:** Contains its own `node_modules/` at `02/node_modules/`.

### `03/`
- Empty folder (placeholder).

---

## 2) Final App — Architecture Overview (`04_final/app`)

### Frontend
- **Stack:** React 19 + Vite, Tailwind (shadcn/ui + Radix), React Router.
- **Entry:** `src/main.tsx` renders the app under router/providers.
- **Theme:** `next-themes` toggles `class="dark"` on the document; Tailwind is configured for class-based dark mode.
- **API Client:** tRPC via `src/providers/trpc.tsx` using `httpBatchLink` and cookie credentials (`credentials: "include"`).

### Backend
- **Runtime:** Hono web framework.
- **tRPC:** exposed at `/api/trpc` via `@trpc/server/adapters/fetch`.
- **Dev mode:** Vite mounts the Hono app via `@hono/vite-dev-server` (see `vite.config.ts`).
- **Prod mode:** `npm run build` bundles `api/boot.ts` into `dist/boot.js`, and `npm start` runs it with `NODE_ENV=production`.
- **Static serving in prod:** `api/lib/vite.ts` uses `@hono/node-server/serve-static` to serve `dist/public` and fallback to `index.html` for SPA routes.

### Database
- **ORM:** Drizzle.
- **Dialect:** MySQL (`mysqlTable` schema in `db/schema.ts`).
- **Connection:** `api/queries/connection.ts` uses `drizzle-orm/mysql2` with `mode: "planetscale"`.
- **Migrations:** `db/migrations/` currently only contains `.gitkeep` (no generated migrations committed yet).

### Auth
- **OAuth provider:** “Kimi” (OAuth server + Open Platform APIs).
- **Login page:** `src/pages/Login.tsx` builds the authorize URL using:
  - `VITE_KIMI_AUTH_URL`
  - `VITE_APP_ID`
  - redirect URI: `${origin}/api/oauth/callback`
- **Callback route:** `GET /api/oauth/callback` handled by `api/kimi/auth.ts`.
- **Session:** backend issues a JWT (via `jose`) and stores it as cookie `kimi_sid` (see `contracts/constants.ts`).
- **Cookie policy:** `api/lib/cookies.ts` uses `SameSite=Lax` on localhost, otherwise `SameSite=None` + `Secure`.
- **Admin bootstrap:** If `OWNER_UNION_ID` matches the logged-in user unionId, that user is promoted to role `admin` on upsert (`api/queries/users.ts`).

---

## 3) Final App — “Project Lucida” Feature Set (PS-06 oriented)

### Reading UX
- **Dual-pane workflow:**
  - **Source/Capture pane** for pasted text.
  - **Reader pane** renders tokenized text with a global word index.
- **Token-indexed corpus:** Each word renders as a span with `data-token-index` for fast lookup and scroll-to-word behavior.
- **Progressive highlight:** `useHighlighter` supports manual next/prev and timer-based progression (WPM-controlled).
- **Immersion mode:** Dims UI chrome and non-active paragraphs for focus.
- **Reading ruler:** A small “gutter marker” tracks the active word’s vertical position (does not overlay text).
- **Analytics footer:** Tracks words/time/WPM live (client-side) and renders a non-overlapping bottom bar.

### Live “Atoms” (CSS Custom Properties)
- Reading settings are applied as CSS variables ("atoms") on the reading pane element:
  - `--reader-font`
  - `--reader-letter-spacing`
  - `--reader-word-spacing`
  - `--reader-line-height`
  - `--reader-paragraph-spacing`
  - `--reader-column-width`
  - `--reader-bg`
- Updates are batched via `requestAnimationFrame` using `src/hooks/useCSSScheduler.ts` to avoid layout thrash.

### Presets & Persistence
- **Local presets:** Saved to `localStorage` (`src/hooks/usePresets.ts`).
- **URL persistence:** Settings are serialized into the URL hash as base64 JSON (`src/hooks/useURLPersistence.ts`).
- **Cloud presets (partial):** When authenticated, the UI sends `preset.create` via tRPC; however, the UI still primarily reads presets from localStorage.

### Accessibility & Input
- Controls are built on shadcn/Radix primitives with explicit labels/aria attributes and keyboard focus rings.
- Arrow keys / Space / Escape / `i` shortcuts exist in the main Lucida page.

---

## 4) Key Files (Final App)

### Frontend
- `src/pages/LucidaApp.tsx`
  - Main composition: layout, mobile behavior, sidebar collapsing, theme toggle, immersion mode.
  - Applies CSS vars using `useCSSScheduler`.
  - Handles tokenization, highlighting, and analytics.
- `src/components/ReadingPane.tsx`
  - Memoized token and paragraph rendering.
  - Scrolls active word into view.
- `src/components/ReadingRuler.tsx`
  - rAF-positioned gutter marker bound to active token element.
- `src/components/ControlPanel.tsx`
  - Typographic controls (including paragraph spacing).
- `src/components/PresetManager.tsx`
  - Local preset CRUD UI.
- `src/components/AnalyticsFooter.tsx`
  - Bottom stats bar (non-fixed).

### Backend
- `api/boot.ts`
  - Hono app wiring: `/api/oauth/callback`, `/api/trpc/*`, production static.
- `api/router.ts`
  - tRPC root router: `ping`, `auth`, `preset`, `reading`.
- `api/middleware.ts`
  - tRPC init + auth/role middleware.
- `api/context.ts`
  - Builds tRPC context, attaches `ctx.user` if session cookie is valid.
- `api/kimi/auth.ts`
  - OAuth callback handler; exchanges code; verifies access token via JWKS; sets session cookie.
- `api/routers/preset.ts`, `api/routers/reading.ts`
  - Authenticated CRUD + analytics persistence.
- `db/schema.ts`
  - Canonical MySQL schema: `users`, `presets`, `reading_sessions`.

### Contracts
- `contracts/preset.ts`, `contracts/reading.ts`
  - Zod schemas shared by client/server.
- `contracts/constants.ts`
  - Session cookie name + key URL paths.

---

## 5) API Surface (Final App)

### HTTP Routes (Hono)
- `GET /api/oauth/callback` — OAuth callback.
- `/api/trpc/*` — tRPC endpoint.
- `ALL /api/*` — JSON 404.

### tRPC Routers
- `ping` (public) → `{ ok: true, ts }`
- `auth.me` (authed) → current user record
- `auth.logout` (authed) → clears cookie via `Set-Cookie` header (NOTE: this is tRPC, not an HTTP GET route)
- `preset.*` (authed)
  - `list`, `create`, `update`, `delete`
- `reading.*` (authed)
  - `logSession`, `getStats`, `getHistory`

---

## 6) Environment Variables & Config

### Frontend (Vite-exposed)
- `VITE_KIMI_AUTH_URL` — OAuth server base URL.
- `VITE_APP_ID` — OAuth app ID.

### Backend
- `APP_ID` — OAuth app ID (server-side).
- `APP_SECRET` — used for JWT signing.
- `DATABASE_URL` — MySQL connection string.
- `KIMI_AUTH_URL` — OAuth server base URL (server-side).
- `KIMI_OPEN_URL` — Kimi Open Platform base URL.
- `OWNER_UNION_ID` — optional; promotes that unionId to admin.

### Notes about missing env in dev
- `api/lib/env.ts` only *throws* on missing required env when `NODE_ENV=production`.
- In dev, missing env values become empty strings; auth/DB features will fail when invoked, but the UI can still run.

---

## 7) How to Run

### Recommended (Final App)
From `04_final/app`:
1. Install: `npm ci`
2. Dev: `npm run dev`
   - Frontend at `http://localhost:3000`
   - API is mounted under `/api/*`
3. Typecheck: `npm run check`
4. Production build: `npm run build`
5. Production start: `npm start`

### Database (optional)
- Requires `DATABASE_URL`.
- Drizzle commands:
  - `npm run db:generate`
  - `npm run db:migrate`
  - `npm run db:push`

### Docker
- `04_final/app/Dockerfile` builds and runs production image.
- The Dockerfile currently sets proxy + custom npm registry values; these may need removal/adjustment for other environments.

---

## 8) Known Mismatches / Gaps / TODOs

1. **Outdated design doc:** `04_final/backend.md` documents SQLite; current implementation is MySQL (`db/schema.ts`).
2. **No committed migrations:** `db/migrations/` is empty except `.gitkeep`.
3. **Logout link mismatch:** UI links to `GET /api/oauth/logout` in `src/pages/LucidaApp.tsx`, but no such Hono route exists. Current logout implementation is `auth.logout` (tRPC mutation).
4. **Cloud preset schema mismatch:**
   - Frontend settings include `paragraphSpacing`.
   - DB + contracts + tRPC preset schema do **not** include `paragraphSpacing`.
   - Result: cloud-created presets cannot fully represent the current reader settings.
5. **AWS SDK deps appear unused:** `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` are in dependencies but aren’t referenced in the code currently.

---

## 9) Suggested Next Steps (If continuing development)
- Decide whether presets are **local-only** vs **cloud-synced**:
  - If cloud-synced: add `paragraphSpacing` to `db/schema.ts` + `contracts/preset.ts` + preset router + UI mutation payload.
  - If local-only: remove/disable cloud preset mutation to avoid partial sync.
- Fix logout UX:
  - Either implement `GET /api/oauth/logout` in Hono, or change the UI to call `trpc.auth.logout`.
- Generate and commit Drizzle migrations for a reproducible DB setup.
- If auth is required for production deployments, ensure `.env` is complete and document required values in `04_final/app/README.md`.
