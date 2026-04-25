# Cadence — Backend Design Document

## 1. Data Architecture

### SQLite Schema (Drizzle ORM)

```typescript
// db/schema.ts

import { sqliteTable, integer, text, real } from "drizzle-orm/sqlite-core";

// User presets for reading configurations
export const presets = sqliteTable("presets", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  font: text("font").notNull().default("Inter"),
  letterSpacing: real("letter_spacing").notNull().default(0),
  wordSpacing: real("word_spacing").notNull().default(0.25),
  lineHeight: real("line_height").notNull().default(1.6),
  columnWidth: integer("column_width").notNull().default(65),
  backgroundTint: text("background_tint").notNull().default("cream"),
  wpm: integer("wpm").notNull().default(200),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Reading sessions for analytics
export const readingSessions = sqliteTable("reading_sessions", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull(),
  textHash: text("text_hash").notNull(),
  wordsRead: integer("words_read").notNull().default(0),
  durationSeconds: integer("duration_seconds").notNull().default(0),
  averageWpm: integer("average_wpm").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});
```

## 2. API Design (tRPC Routers)

### Router: `preset`

| Procedure | Type | Input | Output | Auth |
|-----------|------|-------|--------|------|
| `preset.list` | Query | `{}` | `Preset[]` | Required |
| `preset.create` | Mutation | `{ name, font, letterSpacing, wordSpacing, lineHeight, columnWidth, backgroundTint, wpm }` | `Preset` | Required |
| `preset.update` | Mutation | `{ id, ...fields }` | `Preset` | Required |
| `preset.delete` | Mutation | `{ id }` | `{ success: boolean }` | Required |

### Router: `reading`

| Procedure | Type | Input | Output | Auth |
|-----------|------|-------|--------|------|
| `reading.logSession` | Mutation | `{ textHash, wordsRead, durationSeconds, averageWpm }` | `Session` | Required |
| `reading.getStats` | Query | `{}` | `{ totalSessions, totalWordsRead, averageWpm, totalDurationSeconds }` | Required |
| `reading.getHistory` | Query | `{ limit?: number, offset?: number }` | `Session[]` | Required |

## 3. Zod Contracts

```typescript
// contracts/preset.ts
export const presetSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1).max(50),
  font: z.enum(["Inter", "OpenDyslexic", "Lexie Readable", "Georgia", "System"]),
  letterSpacing: z.number().min(-0.05).max(0.3),
  wordSpacing: z.number().min(0).max(1),
  lineHeight: z.number().min(1).max(3),
  columnWidth: z.number().min(40).max(90),
  backgroundTint: z.enum(["cream", "pale-blue", "yellow", "soft-mint", "white"]),
  wpm: z.number().min(60).max(600),
});

// contracts/reading.ts
export const logSessionSchema = z.object({
  textHash: z.string().length(64),
  wordsRead: z.number().min(0),
  durationSeconds: z.number().min(0),
  averageWpm: z.number().min(0),
});
```

## 4. Auth Strategy

- OAuth 2.0 via Kimi Portal (auto-wired by init script)
- JWT sessions managed by backend-building auth feature
- `publicQuery` for anonymous access to demo features
- `authedQuery` / `authedMutation` for preset/session operations
- Unauthenticated users fall back to localStorage for presets

## 5. Implementation Order

1. Define schema in `db/schema.ts`
2. Run `npm run db:push` to sync
3. Create `api/routers/preset.ts` with CRUD operations
4. Create `api/routers/reading.ts` with analytics operations
5. Register routers in `api/router.ts`
6. Wire tRPC client calls in frontend components
7. Add `localStorage` fallback layer for unauthenticated users

## 6. File Structure

```
/mnt/agents/output/app/
├── api/
│   ├── routers/
│   │   ├── preset.ts
│   │   └── reading.ts
│   ├── router.ts
│   └── ...
├── db/
│   ├── schema.ts
│   └── ...
├── contracts/
│   ├── preset.ts
│   └── reading.ts
└── src/
    ├── pages/
    │   └── LucidaApp.tsx
    ├── components/
    │   ├── CapturePane.tsx
    │   ├── ReadingPane.tsx
    │   ├── TokenizedText.tsx
    │   ├── ControlPanel.tsx
    │   ├── HighlightAutomaton.tsx
    │   ├── ReadingRuler.tsx
    │   ├── ImmersionMode.tsx
    │   └── AnalyticsFooter.tsx
    ├── hooks/
    │   ├── useTokenization.ts
    │   ├── useCSSScheduler.ts
    │   ├── useHighlighter.ts
    │   ├── usePresets.ts
    │   └── useReadingAnalytics.ts
    └── providers/
        └── trpc.tsx
```
