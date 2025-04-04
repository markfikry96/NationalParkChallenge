import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Park types for icons
export const ParkIconType = {
  MOUNTAIN: "mountain",
  CANYON: "canyon", 
  DESERT: "desert",
  LAKE: "lake",
  FOREST: "forest",
  COASTAL: "coastal",
  VOLCANIC: "volcanic",
  CAVE: "cave",
} as const;

export type ParkIconType = typeof ParkIconType[keyof typeof ParkIconType];

// Define the park table schema
export const parks = pgTable("parks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  iconType: text("icon_type").notNull().$type<ParkIconType>(),
  imageUrl: text("image_url"),
  rating: integer("rating").notNull().default(1500),
  rank: integer("rank"),
  trending: boolean("trending").default(false),
  lastChange: integer("last_change").default(0)
});

// Define the matchup table schema
export const matchups = pgTable("matchups", {
  id: serial("id").primaryKey(),
  park1Id: integer("park1_id").notNull(),
  park2Id: integer("park2_id").notNull(),
  winnerId: integer("winner_id"),
  park1OldRating: integer("park1_old_rating"),
  park2OldRating: integer("park2_old_rating"), 
  park1NewRating: integer("park1_new_rating"),
  park2NewRating: integer("park2_new_rating"),
  createdAt: timestamp("created_at").defaultNow()
});

// Define Zod schemas for data validation
export const insertParkSchema = createInsertSchema(parks).omit({ id: true, rank: true });
export const insertMatchupSchema = createInsertSchema(matchups).omit({ id: true, createdAt: true });
export const updateParkSchema = createInsertSchema(parks).omit({ id: true });
export const voteSchema = z.object({
  winnerId: z.number(),
  matchupId: z.number()
});

// Define types
export type Park = typeof parks.$inferSelect;
export type InsertPark = z.infer<typeof insertParkSchema>;
export type Matchup = typeof matchups.$inferSelect;
export type InsertMatchup = z.infer<typeof insertMatchupSchema>;
export type ParkWithRank = Park & { rankChange: number | null };
export type Vote = z.infer<typeof voteSchema>;

// Current matchup type for the frontend
export type CurrentMatchup = {
  id: number;
  park1: Park;
  park2: Park;
};

// Latest vote result type for the frontend
export type LatestVoteResult = {
  id: number;
  winner: Park;
  loser: Park;
  winnerOldRating: number;
  winnerNewRating: number;
  loserOldRating: number;
  loserNewRating: number;
  createdAt: Date;
};

// Users table - required by template
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
