/**
 * @description
 * This file defines a client-side component for the summary page in the Article Summary Generator.
 * It handles summary editing, refinement options, and PNG preview/download functionality.
 *
 * Key features:
 * - Integrates SummaryEditor for manual edits with basic formatting.
 * - Provides buttons for AI refinement (shorter, longer, rewrite).
 * - Generates and previews PNG output with download capability.
 * - Updates summary in real-time and saves via server action.
 *
 * @dependencies
 * - react: For state management and component lifecycle.
 * - @/components/ui/button: Shadcn Button for refinement and PNG actions.
 * - @/app/summary/[id]/_components/summary-editor: For editing the summary.
 * - @/app/summary/[id]/_components/png-preview: For PNG display and download.
 * - @/lib/hooks/use-toast: For user feedback notifications.
 * - @/actions/ai/refine-summary-actions: Server action for refinement.
 * - @/actions/png/generate-png-actions: Server action for PNG generation.
 * - @/actions/db/summaries-actions: Server action for saving edits.
 * - @/db/schema: For SelectSummary type.
 *
 * @notes
 * - Marked as "use client" per project rules for client-side components.
 * - Uses Tailwind CSS for responsive, consistent styling.
 * - Maintains bullet-point format for PNG compatibility.
 * - Handles loading states and errors with toast feedback.
 * - Headline and subheadline are hardcoded for simplicity; could be made editable in future.
 */

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import SummaryEditor from "./summary-editor"
import PngPreview from "./png-preview"
import { useToast } from "@/lib/hooks/use-toast"
import { refineSummaryAction } from "@/actions/ai/refine-summary-actions"
import { generatePngAction } from "@/actions/png/generate-png-actions"
import { updateSummaryAction } from "@/actions/db/summaries-actions"
import { SelectSummary } from "@/db/schema"

/**
 * @description Props for the SummaryClient component.
 * @property summary - The initial summary data fetched from the database.
 * @property refineSummaryAction - Server action for refining the summary.
 * @property generatePngAction - Server action for generating the PNG.
 */
interface SummaryClientProps {
  summary: SelectSummary
  refineSummaryAction: typeof refineSummaryAction
  generatePngAction: typeof generatePngAction
}

/**
 * @description Client-side component for the summary page UI.
 * @param props - The component props including summary data and server actions.
 * @returns The interactive summary editing and PNG preview interface.
 */
export default function SummaryClient({
  summary,
  refineSummaryAction,
  generatePngAction
}: SummaryClientProps) {
  const { toast } = useToast()
  const [summaryText, setSummaryText] = useState(summary.summaryText)
  const [pngData, setPngData] = useState<string | null>(null)
  const [isRefining, setIsRefining] = useState(false)
  const [isGeneratingPng, setIsGeneratingPng] = useState(false)

  // Hardcoded headline and subheadline for PNG generation
  const headline = "Article Summary"
  const subheadline = `Generated from: ${summary.url}`

  /**
   * @description Saves the edited summary to the database.
   */
  const saveSummary = async () => {
    const result = await updateSummaryAction(summary.id, { summaryText })
    if (result.isSuccess) {
      toast({
        title: "Success",
        description: "Summary saved successfully.",
        variant: "default"
      })
    } else {
      toast({
        title: "Error",
        description: result.message || "Failed to save summary.",
        variant: "destructive"
      })
    }
  }

  /**
   * @description Refines the summary based on the selected option.
   * @param option - The refinement option ("shorter", "longer", "rewrite").
   */
  const handleRefine = async (option: "shorter" | "longer" | "rewrite") => {
    setIsRefining(true)
    try {
      const result = await refineSummaryAction(
        summary.id,
        summary.originalText,
        summaryText,
        option
      )
      if (result.isSuccess && result.data) {
        setSummaryText(result.data.summaryText)
        toast({
          title: "Success",
          description: `Summary ${option} refined successfully.`,
          variant: "default"
        })
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to refine summary.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error refining summary:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while refining the summary.",
        variant: "destructive"
      })
    } finally {
      setIsRefining(false)
    }
  }

  /**
   * @description Generates the PNG from the current summary text.
   */
  const handleGeneratePng = async () => {
    setIsGeneratingPng(true)
    try {
      const result = await generatePngAction(summary.id, headline, subheadline)
      if (result.isSuccess && result.data) {
        setPngData(result.data)
        toast({
          title: "Success",
          description: "PNG generated successfully.",
          variant: "default"
        })
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to generate PNG.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error generating PNG:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while generating the PNG.",
        variant: "destructive"
      })
    } finally {
      setIsGeneratingPng(false)
    }
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-8 text-center text-4xl font-bold">Edit Summary</h1>

      {/* Summary Editor */}
      <div className="mb-8">
        <SummaryEditor
          initialSummary={summaryText}
          onChange={setSummaryText}
          className="mb-4"
        />
        <Button onClick={saveSummary} className="w-full">
          Save Changes
        </Button>
      </div>

      {/* Refinement Options */}
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <Button
          onClick={() => handleRefine("shorter")}
          disabled={isRefining}
          variant="outline"
        >
          {isRefining ? "Refining..." : "Make Shorter"}
        </Button>
        <Button
          onClick={() => handleRefine("longer")}
          disabled={isRefining}
          variant="outline"
        >
          {isRefining ? "Refining..." : "Make Longer"}
        </Button>
        <Button
          onClick={() => handleRefine("rewrite")}
          disabled={isRefining}
          variant="outline"
        >
          {isRefining ? "Refining..." : "Rewrite"}
        </Button>
      </div>

      {/* PNG Generation and Preview */}
      <div>
        <Button
          onClick={handleGeneratePng}
          disabled={isGeneratingPng}
          className="mb-4 w-full"
        >
          {isGeneratingPng ? "Generating..." : "Generate PNG"}
        </Button>
        <PngPreview pngData={pngData} />
      </div>
    </div>
  )
}
