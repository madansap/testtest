/**
 * @description
 * This file serves as the central export point for all database schemas in the app.
 * It aggregates schema definitions to simplify imports across the codebase.
 *
 * Key features:
 * - Exports all schema tables and their associated types.
 *
 * @dependencies
 * - profiles-schema.ts: Existing schema for user profiles.
 * - summaries-schema.ts: New schema for article summaries.
 *
 * @notes
 * - Follows project rule to export schemas via `db/schema/index.ts`.
 */

export * from "./profiles-schema"
export * from "./summaries-schema"
