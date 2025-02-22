/**
 * @description
 * This file defines the server-side dynamic summary page for the Article Summary Generator.
 * It fetches a summary by ID, verifies user ownership, and renders the editing/refinement/PNG preview UI.
 *
 * Key features:
 * - Fetches summary data from the database with authentication checks.
 * - Integrates SummaryEditor and PngPreview components for editing and output.
 * - Provides refinement options (shorter, longer, rewrite) and PNG generation.
 *
 * @dependencies
 * - @clerk/nextjs/server: For user authentication.
 * - next/navigation: For redirects on unauthorized access or not found.
 * - react: For Suspense handling of async data fetching.
 * - @/db/db: For database connection.
 * - @/db/schema: For summariesTable and SelectSummary type.
 * - @/actions/ai/refine-summary-actions: For summary refinement options.
 * - @/actions/png/generate-png-actions: For PNG generation.
 * - @/app/summary/[id]/_components/summary-client: Client component for UI logic.
 *
 * @notes
 * - Marked as "use server" per project rules for server components.
 * - Uses Suspense for async data fetching with a fallback loading state.
 * - Redirects to login if unauthenticated or to homepage if summary not found/unauthorized.
 * - Passes server actions to client component to avoid direct server action calls in client code.
 * - Assumes Steps 9 (SummaryEditor) and 10 (PngPreview) are complete.
 */

"use server"

import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { db } from "@/db/db"
import { summariesTable, SelectSummary } from "@/db/schema"
import { eq } from "drizzle-orm"
import { refineSummaryAction } from "@/actions/ai/refine-summary-actions"
import { generatePngAction } from "@/actions/png/generate-png-actions"
import SummaryClient from "./_components/summary-client"

/**
 * @description Props for the SummaryPage component.
 * @property params - Dynamic route parameters including the summary ID.
 */
interface SummaryPageProps {
  params: Promise<{ id: string }>
}

/**
 * @description Server component for the dynamic summary page.
 * Fetches summary data and renders the client-side UI.
 * @param props - The component props including route parameters.
 * @returns The summary page UI or redirects if unauthorized/not found.
 */
export default async function SummaryPage({ params }: SummaryPageProps) {
  const { userId } = await auth()
  if (!userId) {
    redirect("/login") // Redirect to login if not authenticated
  }

  const { id } = await params

  return (
    <Suspense fallback={<SummaryLoading />}>
      <SummaryFetcher id={id} userId={userId} />
    </Suspense>
  )
}

/**
 * @description Fetches summary data and renders the client component.
 * Separated for Suspense boundary clarity.
 * @param id - The UUID of the summary to fetch.
 * @param userId - The authenticated user's ID.
 * @returns The client component with summary data or redirects if invalid.
 */
async function SummaryFetcher({ id, userId }: { id: string; userId: string }) {
  // Fetch the summary from the database
  const summary = await db.query.summariesTable.findFirst({
    where: eq(summariesTable.id, id)
  })

  // Handle cases where summary is not found or user is unauthorized
  if (!summary) {
    redirect("/") // Redirect to homepage if summary not found
  }
  if (summary.userId !== userId) {
    redirect("/") // Redirect if user doesn’t own the summary
  }

  return (
    <SummaryClient
      summary={summary}
      refineSummaryAction={refineSummaryAction}
      generatePngAction={generatePngAction}
    />
  )
}

/**
 * @description Loading fallback component for Suspense.
 * @returns A simple loading UI.
 */
function SummaryLoading() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="bg-muted flex h-64 items-center justify-center rounded-md">
        <p className="text-muted-foreground">Loading summary...</p>
      </div>
    </div>
  )
}
