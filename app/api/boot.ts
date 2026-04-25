import { Hono } from "hono";
import { handle } from "hono/vercel";
import { bodyLimit } from "hono/body-limit";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";
import { createOAuthCallbackHandler } from "./kimi/auth";
import { Paths } from "@contracts/constants";
import dotenv from "dotenv";
dotenv.config(); // This is what actually loads the variables into process.env

// 1. Define the Hono instance
const app = new Hono().basePath("/api");

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));

// 2. Routes
app.get(Paths.oauthCallback, createOAuthCallbackHandler());

app.use("/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext: (opts: any) => createContext({
      req: c.req.raw,
      resHeaders: c.res.headers,
      ...opts
    }),
  });
});

app.all("/*", (c) => c.json({ error: "Not Found" }, 404));

/**
 * 3. DUAL ENVIRONMENT EXPORT
 * * Vercel Serverless needs a function export (handle(app)).
 * Vite Dev Server needs the Hono app instance to access .fetch().
 */
const handler = handle(app);

// This line fixes the "app.fetch is not a function" error in local dev
// It attaches the Hono fetch method to the Vercel handler function
Object.assign(handler, { fetch: (req: Request, env: any, ctx: any) => app.fetch(req, env, ctx) });

export default handler;

// 4. Local production Node.js server (Ignored by Vercel)
if (env.isProduction && typeof process !== 'undefined' && process.env.VERCEL !== '1') {
  const { serve } = await import("@hono/node-server");
  try {
    const { serveStaticFiles } = await import("./lib/vite");
    serveStaticFiles(app as any);
  } catch (e) { }

  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port });
}
