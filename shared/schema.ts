import { pgTable, text, serial, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  address: text("address").notNull(),
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),
  hours: text("hours"),
  notes: text("notes"),
});

export const resourceTypes = [
  "shelter",
  "food",
  "water",
  "wifi",
  "weather",
  "restroom",
  "health",
] as const;

export const insertResourceSchema = createInsertSchema(resources).extend({
  type: z.enum(resourceTypes),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export type InsertResource = z.infer<typeof insertResourceSchema>;
export type Resource = typeof resources.$inferSelect;
export type ResourceType = typeof resourceTypes[number];

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
