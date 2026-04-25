import { z } from "zod";
import { createRouter, authedQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { presets } from "@db/schema";
import { eq, and, desc } from "drizzle-orm";
import { presetSchema, presetUpdateSchema, presetDeleteSchema } from "@contracts/preset";

export const presetRouter = createRouter({
  list: authedQuery.query(async ({ ctx }: { ctx: { user: { unionId: string } } }) => {
    const db = getDb();
    return db
      .select()
      .from(presets)
      .where(eq(presets.userId, ctx.user.unionId))
      .orderBy(desc(presets.updatedAt));
  }),

  create: authedQuery
    .input(presetSchema)
    .mutation(async ({ ctx, input }: { ctx: { user: { unionId: string } }; input: z.infer<typeof presetSchema> }) => {
      const db = getDb();
      const result = await db.insert(presets).values({
        userId: ctx.user.unionId,
        name: input.name,
        font: input.font,
        letterSpacing: input.letterSpacing,
        wordSpacing: input.wordSpacing,
        lineHeight: input.lineHeight,
        columnWidth: input.columnWidth,
        backgroundTint: input.backgroundTint,
        wpm: input.wpm,
      });
      const insertId = Number(result[0].insertId);
      return db.select().from(presets).where(eq(presets.id, insertId)).then((rows: typeof presets.$inferSelect[]) => rows[0]);
    }),

  update: authedQuery
    .input(presetUpdateSchema)
    .mutation(async ({ ctx, input }: { ctx: { user: { unionId: string } }; input: z.infer<typeof presetUpdateSchema> }) => {
      const db = getDb();
      const { id, ...fields } = input;
      await db
        .update(presets)
        .set({
          ...fields,
          updatedAt: new Date(),
        })
        .where(and(eq(presets.id, id), eq(presets.userId, ctx.user.unionId)));
      return db.select().from(presets).where(eq(presets.id, id)).then((rows: typeof presets.$inferSelect[]) => rows[0]);
    }),

  delete: authedQuery
    .input(presetDeleteSchema)
    .mutation(async ({ ctx, input }: { ctx: { user: { unionId: string } }; input: z.infer<typeof presetDeleteSchema> }) => {
      const db = getDb();
      await db
        .delete(presets)
        .where(and(eq(presets.id, input.id), eq(presets.userId, ctx.user.unionId)));
      return { success: true };
    }),
});
