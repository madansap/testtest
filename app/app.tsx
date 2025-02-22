/**
 * @description
 * This file defines the homepage for the Article Summary Generator.
 * It provides a server-side rendered page where authenticated users can input a URL to fetch and summarize an article.
 *
 * Key features:
 * - Authenticates users via Clerk and restricts access to logged-in users.
 * - Integrates the UrlInput component for URL submission.
 * - Fetches article text, generates a summary, and redirects to the summary editing page.
 *
 * @dependencies
 * - @clerk/nextjs/server: For user authentication.
 * - next/navigation: For server-side redirects.
 * - @/components/utilities/url-input: Client component for URL input.
 * - @/actions/ai/fetch-article-actions: Server action to fetch article text.
 * - @/actions/ai/generate-summary-actions: Server action to generate summary.
 * - @/types/summary-types: For ArticleData type.
 *
 * @notes
 * - Marked as "use server" per project rules for server components.
 * - No Suspense is used since async operations are handled inline with redirects.
 * - Redirects to /login if user is not authenticated, aligning with Clerk auth flow.
 * - Assumes Step 7’s UrlInput component is complete and functional.
 */

"use server"

import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import UrlInput from "@/components/utilities/url-input"
import { fetchArticleAction } from "@/actions/ai/fetch-article-actions"
import { generateSummaryAction } from "@/actions/ai/generate-summary-actions"
import { ArticleData } from "@/types/summary-types"

/**
 * @description The homepage server component.
 * Renders the URL input form and handles submission logic.
 * @returns The JSX for the homepage or redirects if unauthorized.
 */
export default async function HomePage() {
  // Check user authentication
  const { userId } = await auth()
  if (!userId) {
    redirect("/login") // Redirect to login if not authenticated
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-8 text-center text-4xl font-bold">
        Article Summary Generator
      </h1>
      <p className="text-muted-foreground mb-12 text-center">
        Enter an article URL to generate a concise summary.
      </p>

      <UrlInput
        onSubmitSuccess={async (articleData: ArticleData) => {
          "use server"
          // Fetch article text
          const fetchResult = await fetchArticleAction(articleData.url)
          if (!fetchResult.isSuccess || !fetchResult.data) {
            console.error("Failed to fetch article:", fetchResult.message)
            return // No redirect; error is handled client-side via toast
          }

          // Generate summary and store it
          const summaryResult = await generateSummaryAction(fetchResult.data)
          if (!summaryResult.isSuccess || !summaryResult.data) {
            console.error("Failed to generate summary:", summaryResult.message)
            return // No redirect; error is handled client-side via toast
          }

          // Redirect to summary editing page with the generated summary ID
          redirect(`/summary/${summaryResult.data.id}`)
        }}
      />
    </div>
  )
}
