import { z } from "zod";

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

export const presetUpdateSchema = presetSchema.partial().extend({
  id: z.number(),
});

export const presetDeleteSchema = z.object({
  id: z.number(),
});

export type PresetConfig = z.infer<typeof presetSchema>;
