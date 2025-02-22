/**
 * @description
 * This file contains server actions for generating article summaries using an AI API.
 * It integrates with the xAI API to produce concise bullet-point summaries.
 *
 * Key features:
 * - Generates summaries from fetched article text.
 * - Stores the summary in the database with user authentication.
 *
 * @dependencies
 * - @clerk/nextjs/server: For user authentication.
 * - @/lib/ai: For xAI API integration.
 * - @/actions/db/summaries-actions: For database operations.
 * - @/types: For ActionState type.
 * - @/types/summary-types: For ArticleData type.
 * - @/db/schema: For InsertSummary type.
 *
 * @notes
 * - Assumes XAI_API_KEY is set in .env.local.
 * - Default summary is 3-5 bullet points in a neutral tone, per requirements.
 * - Retries API call once on failure to handle transient issues.
 */

"use server"

import { auth } from "@clerk/nextjs/server"
import { generateSummary } from "@/lib/ai"
import { createSummaryAction } from "@/actions/db/summaries-actions"
import { ActionState } from "@/types"
import { ArticleData } from "@/types/summary-types"
import { InsertSummary } from "@/db/schema"

/**
 * @description Generates a summary for an article and stores it in the database.
 * @param article - The article data containing URL and text to summarize.
 * @returns A Promise resolving to an ActionState with the stored summary or an error message.
 */
export async function generateSummaryAction(
  article: ArticleData
): Promise<ActionState<InsertSummary>> {
  // Ensure user is authenticated
  const { userId } = await auth()
  if (!userId) {
    return {
      isSuccess: false,
      message: "User must be authenticated to generate a summary."
    }
  }

  // Validate article input
  if (!article.text || article.text.trim().length === 0) {
    return {
      isSuccess: false,
      message: "Article text is empty. Cannot generate summary."
    }
  }

  try {
    // Generate summary using xAI API with retry logic
    let summaryText: string
    try {
      summaryText = await generateSummary(article.text)
    } catch (firstError) {
      console.warn("First summary generation attempt failed:", firstError)
      // Retry once
      try {
        summaryText = await generateSummary(article.text)
      } catch (secondError) {
        console.error("Second summary generation attempt failed:", secondError)
        return {
          isSuccess: false,
          message: "Failed to generate summary after retry."
        }
      }
    }

    // Prepare summary data for database insertion
    const summaryData: InsertSummary = {
      userId,
      url: article.url,
      originalText: article.text,
      summaryText,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Store summary in the database
    const dbResult = await createSummaryAction(summaryData)
    if (!dbResult.isSuccess || !dbResult.data) {
      return {
        isSuccess: false,
        message: "Failed to store generated summary in database."
      }
    }

    return {
      isSuccess: true,
      message: "Summary generated and stored successfully.",
      data: dbResult.data
    }
  } catch (error) {
    console.error("Error in generateSummaryAction:", error)
    return {
      isSuccess: false,
      message: "An unexpected error occurred while generating the summary."
    }
  }
}