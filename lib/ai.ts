/**
 * @description
 * This file contains utility functions for interacting with the xAI API.
 * It provides methods for generating article summaries.
 *
 * Key features:
 * - Integrates with xAI API to generate bullet-point summaries.
 * - Configurable prompt for consistent summary output.
 *
 * @dependencies
 * - axios: For making HTTP requests to the xAI API.
 *
 * @notes
 * - Requires XAI_API_KEY in .env.local.
 * - Default summary is 3-5 bullet points in neutral tone, per requirements.
 * - Throws errors for API failures to be handled by callers.
 */

import axios from "axios"

// xAI API endpoint and configuration
const XAI_API_URL = "https://api.x.ai/v1/summarize" // Hypothetical endpoint
const XAI_API_KEY = process.env.XAI_API_KEY

// Default prompt to ensure 3-5 bullet points in a neutral tone
const SUMMARY_PROMPT = `
Summarize the following article text in a concise manner. Provide the summary as 3-5 bullet points in a neutral tone. Focus on the main ideas and key details, avoiding any opinion or embellishment. Return the summary as plain text with each bullet point starting with "- " and separated by newlines.
`

/**
 * @description Generates a summary from article text using the xAI API.
 * @param articleText - The text of the article to summarize.
 * @returns A Promise resolving to the summary text as a string.
 * @throws Error if the API call fails or the response is invalid.
 */
export async function generateSummary(articleText: string): Promise<string> {
  if (!XAI_API_KEY) {
    throw new Error("XAI_API_KEY is not set in environment variables.")
  }

  try {
    const response = await axios.post(
      XAI_API_URL,
      {
        text: articleText,
        prompt: SUMMARY_PROMPT,
        max_length: 200 // Limit to keep summary concise
      },
      {
        headers: {
          Authorization: `Bearer ${XAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 15000 // 15-second timeout for API response
      }
    )

    // Validate and extract summary text
    const summary = response.data.summary
    if (
      !summary ||
      typeof summary !== "string" ||
      summary.trim().length === 0
    ) {
      throw new Error("Invalid summary response from xAI API.")
    }

    return summary.trim()
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        `xAI API request failed: ${error.response?.status || "Unknown error"} - ${
          error.response?.data?.message || error.message
        }`
      )
    }
    // Type assertion to treat error as any
    throw new Error(
      `Unexpected error generating summary: ${(error as any).message}`
    )
  }
}
