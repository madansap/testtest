/**
 * @description
 * This file contains server actions for refining article summaries using the xAI API.
 * It provides options to make summaries shorter, longer, or rewritten.
 *
 * Key features:
 * - Refines existing summaries with three options: shorter, longer, rewrite.
 * - Updates the refined summary in the database.
 *
 * @dependencies
 * - @clerk/nextjs/server: For user authentication.
 * - @/lib/ai: For xAI API integration (reused generateSummary with modified prompts).
 * - @/actions/db/summaries-actions: For updating the summaries table.
 * - @/types: For ActionState type.
 * - @/db/schema: For SelectSummary type.
 *
 * @notes
 * - "Shorter" reduces by ~30% (min 1 bullet), "longer" expands by ~30% (max 10 bullets), "rewrite" paraphrases.
 * - Retries API call once on failure to handle transient issues.
 * - Assumes authenticated user matches the summary’s userId for security.
 */

"use server"

import { auth } from "@clerk/nextjs/server"
import { generateSummary } from "@/lib/ai"
import { updateSummaryAction } from "@/actions/db/summaries-actions"
import { ActionState } from "@/types"
import { SelectSummary } from "@/db/schema"

/**
 * @description Refinement options for the summary.
 */
type RefineOption = "shorter" | "longer" | "rewrite"

/**
 * @description Refines an existing summary based on the specified option and updates it in the database.
 * @param summaryId - The UUID of the summary to refine.
 * @param originalText - The original article text (needed for "longer" option).
 * @param currentSummary - The current summary text to refine.
 * @param option - The refinement option ("shorter", "longer", "rewrite").
 * @returns A Promise resolving to an ActionState with the updated summary or an error message.
 */
export async function refineSummaryAction(
  summaryId: string,
  originalText: string,
  currentSummary: string,
  option: RefineOption
): Promise<ActionState<SelectSummary>> {
  // Ensure user is authenticated
  const { userId } = await auth()
  if (!userId) {
    return {
      isSuccess: false,
      message: "User must be authenticated to refine a summary."
    }
  }

  // Validate inputs
  if (!summaryId || !currentSummary || !originalText) {
    return {
      isSuccess: false,
      message: "Missing required parameters: summaryId, originalText, or currentSummary."
    }
  }
  if (!["shorter", "longer", "rewrite"].includes(option)) {
    return {
      isSuccess: false,
      message: "Invalid refinement option. Use 'shorter', 'longer', or 'rewrite'."
    }
  }

  try {
    // Define prompts based on refinement option
    let prompt: string
    switch (option) {
      case "shorter":
        prompt = `
          Take the following summary and make it shorter by approximately 30%, keeping it concise and neutral. Ensure at least 1 bullet point remains. Return as plain text with each bullet point starting with "- " and separated by newlines.
          Current summary:
          ${currentSummary}
        `
        break
      case "longer":
        prompt = `
          Take the following article text and current summary, and expand the summary by approximately 30% in a neutral tone. Limit to a maximum of 10 bullet points. Return as plain text with each bullet point starting with "- " and separated by newlines.
          Article text:
          ${originalText}
          Current summary:
          ${currentSummary}
        `
        break
      case "rewrite":
        prompt = `
          Rewrite the following summary in a neutral tone, keeping the same length and key points. Return as plain text with each bullet point starting with "- " and separated by newlines.
          Current summary:
          ${currentSummary}
        `
        break
    }

    // Generate refined summary with retry logic
    let refinedSummary: string
    try {
      refinedSummary = await generateSummary(prompt)
    } catch (firstError) {
      console.warn("First refinement attempt failed:", firstError)
      // Retry once
      try {
        refinedSummary = await generateSummary(prompt)
      } catch (secondError) {
        console.error("Second refinement attempt failed:", secondError)
        return {
          isSuccess: false,
          message: "Failed to refine summary after retry."
        }
      }
    }

    // Update the summary in the database
    const dbResult = await updateSummaryAction(summaryId, { summaryText: refinedSummary })
    if (!dbResult.isSuccess || !dbResult.data) {
      return {
        isSuccess: false,
        message: "Failed to update refined summary in database."
      }
    }

    // Verify the summary belongs to the authenticated user
    if (dbResult.data.userId !== userId) {
      return {
        isSuccess: false,
        message: "Unauthorized: You can only refine your own summaries."
      }
    }

    return {
      isSuccess: true,
      message: `Summary ${option} refinement completed successfully.`,
      data: dbResult.data
    }
  } catch (error) {
    console.error("Error in refineSummaryAction:", error)
    return {
      isSuccess: false,
      message: "An unexpected error occurred while refining the summary."
    }
  }
}