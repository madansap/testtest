/**
 * @description
 * This file initializes the database connection and schema for the app using Drizzle ORM.
 * It sets up the PostgreSQL client and defines the schema for all tables.
 *
 * Key features:
 * - Establishes connection to Supabase Postgres database.
 * - Combines all table schemas into a single schema object.
 *
 * @dependencies
 * - dotenv: Loads environment variables from .env.local.
 * - drizzle-orm/postgres-js: Drizzle ORM client for PostgreSQL.
 * - postgres: PostgreSQL driver.
 * - @/db/schema: Schema definitions for tables.
 *
 * @notes
 * - DATABASE_URL must be set in .env.local for the client to connect.
 * - No migrations are generated as per project rules.
 */

import { profilesTable, summariesTable } from "@/db/schema"
import { config } from "dotenv"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

config({ path: ".env.local" })

// Define the schema object including all tables
const schema = {
  profiles: profilesTable,
  summaries: summariesTable
}

// Initialize the PostgreSQL client with the database URL
const client = postgres(process.env.DATABASE_URL!)

// Export the Drizzle database instance with the schema
export const db = drizzle(client, { schema })
