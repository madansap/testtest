/**
 * @description
 * This file contains server actions for fetching and parsing article text from URLs.
 * It leverages axios for HTTP requests and cheerio for HTML parsing.
 *
 * Key features:
 * - Fetches article content from a user-provided URL.
 * - Parses HTML to extract meaningful text, focusing on common article elements.
 *
 * @dependencies
 * - axios: For making HTTP requests to fetch webpage content.
 * - cheerio: For parsing HTML and extracting article text.
 * - @/types: For ActionState and ArticleData types.
 *
 * @notes
 * - Handles diverse website structures by targeting common article tags (p, article, etc.).
 * - Includes fallback messages for inaccessible or non-article pages.
 * - No database interaction here; text is returned for further processing.
 */

"use server"

import axios from "axios"
import * as cheerio from "cheerio"
import { ActionState } from "@/types"
import { ArticleData } from "@/types/summary-types"

// User-agent to mimic a browser request and reduce blocking by websites
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"

/**
 * @description Fetches and parses article text from a given URL.
 * @param url - The URL of the article to fetch.
 * @returns A Promise resolving to an ActionState with ArticleData or an error message.
 */
export async function fetchArticleAction(url: string): Promise<ActionState<ArticleData>> {
  // Validate URL format
  try {
    new URL(url)
  } catch {
    return {
      isSuccess: false,
      message: "Please enter a valid URL (e.g., https://example.com)"
    }
  }

  try {
    // Fetch webpage content with axios
    const response = await axios.get(url, {
      headers: { "User-Agent": USER_AGENT },
      timeout: 10000 // 10-second timeout to avoid hanging
    })

    // Check if response is successful
    if (response.status !== 200) {
      return {
        isSuccess: false,
        message: `Failed to fetch article: HTTP Status ${response.status}`
      }
    }

    // Load HTML into cheerio for parsing
    const $ = cheerio.load(response.data)

    // Remove unwanted elements (scripts, styles, ads, etc.)
    $("script, style, iframe, noscript, nav, footer, header").remove()

    // Target common article content containers
    const articleContent =
      $("article").length > 0
        ? $("article")
        : $("main").length > 0
        ? $("main")
        : $("body")

    // Extract text from paragraphs and other likely content tags
    const textElements = articleContent
      .find("p, h1, h2, h3, h4, h5, h6")
      .toArray()
    let articleText = textElements
      .map(element => $(element).text().trim())
      .filter(text => text.length > 0)
      .join("\n")

    // Edge case: Check if enough text was extracted
    if (articleText.length < 50) {
      return {
        isSuccess: false,
        message:
          "Could not find substantial article content. This might not be an article page or is behind a paywall."
      }
    }

    // Clean up excessive whitespace
    articleText = articleText.replace(/\n{2,}/g, "\n").trim()

    return {
      isSuccess: true,
      message: "Article fetched successfully",
      data: { url, text: articleText }
    }
  } catch (error) {
    // Handle axios-specific errors
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Server responded with a status other than 2xx
        if (error.response.status === 403 || error.response.status === 401) {
          return {
            isSuccess: false,
            message: "Article unavailable: Access denied (possibly behind a paywall)."
          }
        }
        if (error.response.status === 404) {
          return {
            isSuccess: false,
            message: "Article not found (404)."
          }
        }
        return {
          isSuccess: false,
          message: `Failed to fetch article: HTTP Status ${error.response.status}`
        }
      } else if (error.request) {
        // Request made but no response received (e.g., network error)
        return {
          isSuccess: false,
          message: "Network error: Could not reach the server."
        }
      }
    }

    // Log unexpected errors for debugging
    console.error("Error fetching article:", error)
    return {
      isSuccess: false,
      message: "An unexpected error occurred while fetching the article."
    }
  }
}