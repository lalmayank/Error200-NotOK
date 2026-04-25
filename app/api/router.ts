import { authRouter } from "./auth-router";
import { presetRouter } from "./routers/preset";
import { readingRouter } from "./routers/reading";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  preset: presetRouter,
  reading: readingRouter,
});

export type AppRouter = typeof appRouter;
