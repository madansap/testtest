/**
 * @description
 * This file defines TypeScript types related to article summaries for the Article Summary Generator.
 * It provides type safety for data structures used in fetching and processing articles.
 *
 * Key features:
 * - Defines the structure of article data fetched from URLs.
 *
 * @dependencies
 * - None directly; used by server actions and components.
 *
 * @notes
 * - Types are kept minimal and focused on the summary workflow.
 * - Follows project rule to prefer interfaces over type aliases.
 */

/**
 * @description Interface for article data fetched from a URL.
 * @property url - The original URL of the article.
 * @property text - The extracted text content of the article.
 */
export interface ArticleData {
  url: string
  text: string
}
