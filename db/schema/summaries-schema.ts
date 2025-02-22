/**
 * @description
 * This file defines the database schema for the summaries table using Drizzle ORM.
 * It is responsible for structuring the storage of article data and generated summaries.
 *
 * Key features:
 * - Stores user-specific article summaries with original and summarized text.
 * - Uses UUID for unique identification of each summary record.
 *
 * @dependencies
 * - drizzle-orm/pg-core: Provides PostgreSQL schema definition utilities.
 *
 * @notes
 * - No relationships or indexes are defined as this is a simple table for personal use.
 * - Timestamps are automatically set and updated per project backend rules.
 */

import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"

// Define the summaries table schema
export const summariesTable = pgTable("summaries", {
  // Unique identifier for each summary record, generated automatically
  id: uuid("id").defaultRandom().primaryKey(),

  // Clerk user ID, required as per project rules
  userId: text("user_id").notNull(),

  // URL of the article, must be provided
  url: text("url").notNull(),

  // Original text fetched from the article
  originalText: text("original_text").notNull(),

  // AI-generated or manually edited summary text
  summaryText: text("summary_text").notNull(),

  // Creation timestamp, set to current time by default
  createdAt: timestamp("created_at").defaultNow().notNull(),

  // Update timestamp, set to current time on creation and updated on changes
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

/**
 * @description Type for inserting a new summary into the summaries table.
 * Matches the structure of summariesTable with all fields required.
 */
export type InsertSummary = typeof summariesTable.$inferInsert

/**
 * @description Type for selecting a summary from the summaries table.
 * Includes all fields as they are stored in the database.
 */
export type SelectSummary = typeof summariesTable.$inferSelect
