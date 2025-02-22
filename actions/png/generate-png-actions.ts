/**
 * @description
 * This file contains server actions for generating A4-sized PNG images from article summaries.
 * It uses the canvas library to render a clean layout with headline, subheadline, and bullet points.
 *
 * Key features:
 * - Generates an A4-sized PNG (2480x3508px) with specified layout.
 * - Validates user authentication and summary ownership.
 * - Returns base64-encoded image for client-side download.
 *
 * @dependencies
 * - @clerk/nextjs/server: For user authentication.
 * - canvas: For rendering the PNG image.
 * - @/db/db: For database queries.
 * - @/db/schema: For summariesTable and SelectSummary type.
 * - @/types: For ActionState type.
 * - @/lib/utils: For text wrapping utility (wrapText).
 *
 * @notes
 * - Layout: Headline (top 10%), Subheadline (next 5%), Bullets (remaining 85%).
 * - Uses Inter font per design spec, assumed available in canvas context.
 * - Handles text overflow by wrapping bullet points within bounds.
 * - Retries rendering once on failure (e.g., canvas errors).
 */

"use server"

import { auth } from "@clerk/nextjs/server"
import { createCanvas, loadImage } from "canvas"
import { db } from "@/db/db"
import { summariesTable, SelectSummary } from "@/db/schema"
import { ActionState } from "@/types"
import { wrapText } from "@/lib/utils"
import { eq } from "drizzle-orm"

/**
 * @description Generates an A4-sized PNG image from a summary with headline, subheadline, and bullet points.
 * @param summaryId - The UUID of the summary to generate the PNG from.
 * @param headline - The headline text for the PNG.
 * @param subheadline - The subheadline text for the PNG.
 * @returns A Promise resolving to an ActionState with the base64-encoded PNG or an error message.
 */
export async function generatePngAction(
  summaryId: string,
  headline: string,
  subheadline: string
): Promise<ActionState<string>> {
  // Ensure user is authenticated
  const { userId } = await auth()
  if (!userId) {
    return {
      isSuccess: false,
      message: "User must be authenticated to generate a PNG."
    }
  }

  // Validate inputs
  if (!summaryId || !headline || !subheadline) {
    return {
      isSuccess: false,
      message: "Missing required parameters: summaryId, headline, or subheadline."
    }
  }

  try {
    // Fetch the summary from the database to verify ownership and get summaryText
    const summary = await db.query.summariesTable.findFirst({
      where: eq(summariesTable.id, summaryId)
    })
    if (!summary) {
      return {
        isSuccess: false,
        message: "Summary not found."
      }
    }
    if (summary.userId !== userId) {
      return {
        isSuccess: false,
        message: "Unauthorized: You can only generate PNGs for your own summaries."
      }
    }

    // A4 dimensions in pixels at 300 DPI (8.3 x 11.7 inches)
    const width = 2480 // 8.3 * 300
    const height = 3508 // 11.7 * 300

    // Create canvas with A4 dimensions
    let canvas: ReturnType<typeof createCanvas>
    let ctx: ReturnType<typeof canvas.getContext>
    try {
      canvas = createCanvas(width, height)
      ctx = canvas.getContext("2d")
    } catch (firstError) {
      console.warn("First PNG generation attempt failed:", firstError)
      // Retry once
      try {
        canvas = createCanvas(width, height)
        ctx = canvas.getContext("2d")
      } catch (secondError) {
        console.error("Second PNG generation attempt failed:", secondError)
        return {
          isSuccess: false,
          message: "Failed to initialize canvas for PNG generation after retry."
        }
      }
    }

    // Set background color (white per design spec)
    ctx.fillStyle = "#FFFFFF"
    ctx.fillRect(0, 0, width, height)

    // Set font styles per design spec (Inter font, sizes in px adjusted for 300 DPI)
    const headlineFontSize = 72 // 24px * 3 for 300 DPI
    const subheadlineFontSize = 54 // 18px * 3
    const bulletFontSize = 42 // 14px * 3

    // Layout positions
    const margin = 60 // 20px * 3 for 300 DPI
    const headlineY = height * 0.05 // Center of top 10%
    const subheadlineY = height * 0.125 // Center of next 5%
    const bulletStartY = height * 0.175 // Start of remaining 85%
    const maxTextWidth = width - 2 * margin

    // Draw headline
    ctx.fillStyle = "#000000" // Black per design spec
    ctx.font = `${headlineFontSize}px Inter`
    ctx.textAlign = "center"
    ctx.fillText(headline, width / 2, headlineY)

    // Draw subheadline
    ctx.font = `${subheadlineFontSize}px Inter`
    ctx.fillText(subheadline, width / 2, subheadlineY)

    // Parse bullet points from summaryText
    const bulletPoints = summary.summaryText
      .split("\n")
      .filter(line => line.trim().startsWith("- "))
      .map(line => line.trim().substring(2)) // Remove "- " prefix

    // Draw bullet points
    ctx.font = `${bulletFontSize}px Inter`
    ctx.textAlign = "left"
    let currentY = bulletStartY
    const lineHeight = bulletFontSize * 1.2 // 20% extra spacing

    for (const point of bulletPoints) {
      // Draw bullet symbol
      ctx.fillText("•", margin, currentY)

      // Wrap text if it exceeds max width
      const wrappedLines = wrapText(ctx, point, maxTextWidth - margin, margin + 30) // 30px indent for bullet
      for (const line of wrappedLines) {
        ctx.fillText(line.text, line.x, currentY)
        currentY += lineHeight
      }

      // Add extra spacing between bullet points
      currentY += lineHeight * 0.5
    }

    // Check for text overflow
    if (currentY > height - margin) {
      console.warn("Text overflow detected; truncating content.")
      // Truncate by not rendering beyond height (handled implicitly by canvas bounds)
    }

    // Generate base64-encoded PNG
    const base64Image = canvas.toDataURL("image/png")

    return {
      isSuccess: true,
      message: "PNG generated successfully.",
      data: base64Image
    }
  } catch (error) {
    console.error("Error in generatePngAction:", error)
    return {
      isSuccess: false,
      message: "An unexpected error occurred while generating the PNG."
    }
  }
}