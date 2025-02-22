/**
 * @description
 * This file serves as the central export point for all TypeScript types in the app.
 * It aggregates type definitions to simplify imports across the codebase.
 *
 * Key features:
 * - Exports all type definitions for consistent access.
 *
 * @dependencies
 * - server-action-types.ts: General server action types.
 * - summary-types.ts: Types related to article summaries.
 *
 * @notes
 * - Follows project rule to export types via `types/index.ts`.
 */

export * from "./server-action-types"
export * from "./summary-types"
