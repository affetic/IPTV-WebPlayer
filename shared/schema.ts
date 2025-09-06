import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const xtreamSessions = pgTable("xtream_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: text("session_id").notNull(),
  host: text("host").notNull(),
  username: text("username").notNull(),
  password: text("password").notNull(),
  userInfo: jsonb("user_info"),
  serverInfo: jsonb("server_info"),
  createdAt: timestamp("created_at").default(sql`now()`),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true),
});

export const channels = pgTable("channels", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: text("session_id").notNull(),
  streamId: text("stream_id").notNull(),
  name: text("name").notNull(),
  categoryId: text("category_id"),
  categoryName: text("category_name"),
  streamUrl: text("stream_url").notNull(),
  logo: text("logo"),
  epgChannelId: text("epg_channel_id"),
  added: timestamp("added"),
  isNsfw: boolean("is_nsfw").default(false),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertXtreamSessionSchema = createInsertSchema(xtreamSessions).omit({
  id: true,
  createdAt: true,
  isActive: true,
});

export const insertChannelSchema = createInsertSchema(channels).omit({
  id: true,
});

export const xtreamAuthSchema = z.object({
  host: z.string().url("Host deve ser uma URL válida"),
  username: z.string().min(1, "Username é obrigatório"),
  password: z.string().min(1, "Password é obrigatório"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type XtreamSession = typeof xtreamSessions.$inferSelect;
export type InsertXtreamSession = z.infer<typeof insertXtreamSessionSchema>;
export type Channel = typeof channels.$inferSelect;
export type InsertChannel = z.infer<typeof insertChannelSchema>;
export type XtreamAuth = z.infer<typeof xtreamAuthSchema>;
