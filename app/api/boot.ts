import { Hono } from "hono";
import { handle } from "hono/vercel";
import { bodyLimit } from "hono/body-limit";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";
import { createOAuthCallbackHandler } from "./kimi/auth";
import { Paths } from "@contracts/constants";

// Define the Hono instance
const app = new Hono().basePath("/api");

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));

// Routes
app.get(Paths.oauthCallback, createOAuthCallbackHandler());

app.use("/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    // Cast to any to bypass the strict FetchCreateContextFnOptions check
    createContext: (opts: any) => createContext({
      req: c.req.raw,
      resHeaders: c.res.headers,
      ...opts
    }),
  });
});

app.all("/*", (c) => c.json({ error: "Not Found" }, 404));

// Export for Vercel with a type cast to prevent the "App" mismatch
export default handle(app as any);

// Local development server (Ignored by Vercel)
if (env.isProduction && typeof process !== 'undefined' && process.env.VERCEL !== '1') {
  const { serve } = await import("@hono/node-server");
  try {
    const { serveStaticFiles } = await import("./lib/vite");
    serveStaticFiles(app as any);
  } catch (e) {
    console.error("Static file server failed to load");
  }

  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port });
}