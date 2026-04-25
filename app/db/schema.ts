import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  int,
  float,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const presets = mysqlTable("presets", {
  id: serial("id").primaryKey(),
  userId: varchar("userId", { length: 255 }).notNull(),
  name: varchar("name", { length: 50 }).notNull(),
  font: varchar("font", { length: 50 }).notNull().default("Inter"),
  letterSpacing: float("letterSpacing").notNull().default(0),
  wordSpacing: float("wordSpacing").notNull().default(0.25),
  lineHeight: float("lineHeight").notNull().default(1.6),
  columnWidth: int("columnWidth").notNull().default(65),
  backgroundTint: varchar("backgroundTint", { length: 30 }).notNull().default("cream"),
  wpm: int("wpm").notNull().default(200),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Preset = typeof presets.$inferSelect;
export type InsertPreset = typeof presets.$inferInsert;

export const readingSessions = mysqlTable("reading_sessions", {
  id: serial("id").primaryKey(),
  userId: varchar("userId", { length: 255 }).notNull(),
  textHash: varchar("textHash", { length: 64 }).notNull(),
  wordsRead: int("wordsRead").notNull().default(0),
  durationSeconds: int("durationSeconds").notNull().default(0),
  averageWpm: int("averageWpm").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ReadingSession = typeof readingSessions.$inferSelect;
export type InsertReadingSession = typeof readingSessions.$inferInsert;
