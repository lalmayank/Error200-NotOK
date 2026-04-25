import { z } from "zod";

export const logSessionSchema = z.object({
  textHash: z.string().length(64),
  wordsRead: z.number().min(0),
  durationSeconds: z.number().min(0),
  averageWpm: z.number().min(0),
});

export const getHistorySchema = z.object({
  limit: z.number().min(1).max(100).optional().default(20),
  offset: z.number().min(0).optional().default(0),
});

export type LogSessionInput = z.infer<typeof logSessionSchema>;
