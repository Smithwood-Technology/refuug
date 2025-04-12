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
  city: z.string().min(1).max(100),
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

// Predefined cities with their coordinates
export const cities = [
  {
    name: "Miami",
    state: "FL",
    latitude: 25.7617,
    longitude: -80.1918,
    zoomLevel: 12
  },
  {
    name: "Jacksonville",
    state: "FL",
    latitude: 30.3322,
    longitude: -81.6557,
    zoomLevel: 12
  },
  {
    name: "Atlanta",
    state: "GA",
    latitude: 33.7490,
    longitude: -84.3880,
    zoomLevel: 12
  },
  {
    name: "Columbus",
    state: "GA",
    latitude: 32.4610,
    longitude: -84.9877,
    zoomLevel: 12
  },
  {
    name: "Birmingham",
    state: "AL",
    latitude: 33.5186,
    longitude: -86.8104,
    zoomLevel: 12
  },
  {
    name: "Huntsville",
    state: "AL",
    latitude: 34.7304,
    longitude: -86.5861,
    zoomLevel: 12
  },
  {
    name: "Jackson",
    state: "MS",
    latitude: 32.2988,
    longitude: -90.1848,
    zoomLevel: 12
  },
  {
    name: "Gulfport",
    state: "MS",
    latitude: 30.3674,
    longitude: -89.0928,
    zoomLevel: 12
  },
  {
    name: "Nashville",
    state: "TN",
    latitude: 36.1627,
    longitude: -86.7816,
    zoomLevel: 12
  },
  {
    name: "Memphis",
    state: "TN",
    latitude: 35.1495,
    longitude: -90.0490,
    zoomLevel: 12
  },
  {
    name: "Charlotte",
    state: "NC",
    latitude: 35.2271,
    longitude: -80.8431,
    zoomLevel: 12
  },
  {
    name: "Raleigh",
    state: "NC",
    latitude: 35.7796,
    longitude: -78.6382,
    zoomLevel: 12
  },
  {
    name: "Charleston",
    state: "SC",
    latitude: 32.7876,
    longitude: -79.9403,
    zoomLevel: 12
  },
  {
    name: "Columbia",
    state: "SC",
    latitude: 34.0007,
    longitude: -81.0348,
    zoomLevel: 12
  }
];

export type City = typeof cities[number];
