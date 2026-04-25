import { z } from "zod";
import { createRouter, authedQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { readingSessions } from "@db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { logSessionSchema, getHistorySchema } from "@contracts/reading";

export const readingRouter = createRouter({
  logSession: authedQuery
    .input(logSessionSchema)
    .mutation(async ({ ctx, input }: { ctx: { user: { unionId: string } }; input: z.infer<typeof logSessionSchema> }) => {
      const db = getDb();
      const result = await db.insert(readingSessions).values({
        userId: ctx.user.unionId,
        textHash: input.textHash,
        wordsRead: input.wordsRead,
        durationSeconds: input.durationSeconds,
        averageWpm: input.averageWpm,
      });
      const insertId = Number(result[0].insertId);
      return db
        .select()
        .from(readingSessions)
        .where(eq(readingSessions.id, insertId))
        .then((rows: typeof readingSessions.$inferSelect[]) => rows[0]);
    }),

  getStats: authedQuery.query(async ({ ctx }: { ctx: { user: { unionId: string } } }) => {
    const db = getDb();
    const rows = await db
      .select({
        totalSessions: sql<number>`count(*)`,
        totalWordsRead: sql<number>`COALESCE(SUM(wordsRead), 0)`,
        averageWpm: sql<number>`COALESCE(AVG(averageWpm), 0)`,
        totalDurationSeconds: sql<number>`COALESCE(SUM(durationSeconds), 0)`,
      })
      .from(readingSessions)
      .where(eq(readingSessions.userId, ctx.user.unionId));

    return rows[0];
  }),

  getHistory: authedQuery
    .input(getHistorySchema)
    .query(async ({ ctx, input }: { ctx: { user: { unionId: string } }; input: z.infer<typeof getHistorySchema> }) => {
      const db = getDb();
      return db
        .select()
        .from(readingSessions)
        .where(eq(readingSessions.userId, ctx.user.unionId))
        .orderBy(desc(readingSessions.createdAt))
        .limit(input.limit)
        .offset(input.offset);
    }),
});
