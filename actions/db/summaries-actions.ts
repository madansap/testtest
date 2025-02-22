/**
 * @description
 * This file contains server actions for managing article summaries in the database.
 * It provides CRUD operations for the summaries table using Drizzle ORM.
 *
 * Key features:
 * - Creates new summary records with user data.
 * - Updates existing summary records by ID.
 *
 * @dependencies
 * - drizzle-orm: For database operations (insert, update).
 * - @/db/db: For database connection.
 * - @/db/schema: For summariesTable and related types.
 * - @/types: For ActionState type.
 *
 * @notes
 * - Sorted in CRUD order: Create, Update (Read and Delete not needed yet).
 * - Returns undefined data for actions not returning data, per project rules.
 * - Handles database errors with meaningful messages.
 * - Used by refineSummaryAction to persist refined summaries.
 */

"use server"

import { db } from "@/db/db"
import { InsertSummary, SelectSummary, summariesTable } from "@/db/schema"
import { ActionState } from "@/types"
import { eq } from "drizzle-orm"

/**
 * @description Creates a new summary record in the database.
 * @param data - The summary data to insert.
 * @returns A Promise resolving to an ActionState with the created summary or an error message.
 */
export async function createSummaryAction(
  data: InsertSummary
): Promise<ActionState<SelectSummary>> {
  try {
    // Insert the summary into the database and return the created record
    const [newSummary] = await db
      .insert(summariesTable)
      .values(data)
      .returning()

    return {
      isSuccess: true,
      message: "Summary created successfully",
      data: newSummary
    }
  } catch (error) {
    console.error("Error creating summary:", error)
    return {
      isSuccess: false,
      message: "Failed to create summary in database."
    }
  }
}

/**
 * @description Updates an existing summary record in the database by ID.
 * @param id - The UUID of the summary to update.
 * @param data - Partial summary data to update (e.g., summaryText).
 * @returns A Promise resolving to an ActionState with the updated summary or an error message.
 */
export async function updateSummaryAction(
  id: string,
  data: Partial<InsertSummary>
): Promise<ActionState<SelectSummary>> {
  try {
    // Update the summary and return the updated record
    const [updatedSummary] = await db
      .update(summariesTable)
      .set({ ...data, updatedAt: new Date() }) // Ensure updatedAt is refreshed
      .where(eq(summariesTable.id, id))
      .returning()

    if (!updatedSummary) {
      return {
        isSuccess: false,
        message: "Summary not found for update."
      }
    }

    return {
      isSuccess: true,
      message: "Summary updated successfully",
      data: updatedSummary
    }
  } catch (error) {
    console.error("Error updating summary:", error)
    return {
      isSuccess: false,
      message: "Failed to update summary in database."
    }
  }
}