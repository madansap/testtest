/**
 * @description
 * This file defines a client-side component for previewing and downloading PNG summaries in the Article Summary Generator.
 * It displays a base64-encoded PNG image and provides a button to download it as a file.
 *
 * Key features:
 * - Renders a PNG preview with proper aspect ratio scaling.
 * - Allows users to download the PNG with a custom filename.
 * - Integrates with the generatePngAction output for seamless workflow.
 *
 * @dependencies
 * - react: For component lifecycle and event handling.
 * - @/components/ui/button: Shadcn Button component for download action.
 * - @/lib/utils: For class name merging with cn utility.
 * - lucide-react: For Download icon in the button.
 *
 * @notes
 * - Marked as "use client" per project rules for client-side components.
 * - Uses Tailwind CSS for responsive styling consistent with the app’s design system.
 * - Downloads the file as "summary.png" by default; could be enhanced with dynamic naming in future steps.
 * - Assumes parent component (Step 11) provides the base64 PNG data from generatePngAction.
 * - Handles edge cases like missing PNG data with a fallback message.
 */

"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Download } from "lucide-react"

/**
 * @description Props for the PngPreview component.
 * @property pngData - The base64-encoded PNG string to display and download.
 * @property className - Optional additional CSS classes for styling.
 */
interface PngPreviewProps {
  pngData: string | null
  className?: string
}

/**
 * @description A client-side component to preview and download a PNG summary.
 * @param props - The component props.
 * @returns A preview image and download button, or a fallback message if no PNG data is provided.
 */
export default function PngPreview({ pngData, className }: PngPreviewProps) {
  /**
   * @description Handles the download of the PNG file.
   * Creates a temporary link element to trigger the browser’s download functionality.
   */
  const handleDownload = () => {
    if (!pngData) return // Early return if no PNG data is available

    // Create a temporary anchor element for downloading
    const link = document.createElement("a")
    link.href = pngData
    link.download = "summary.png" // Default filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link) // Clean up
  }

  // If no PNG data is provided, show a fallback message
  if (!pngData) {
    return (
      <div
        className={cn(
          "bg-muted flex h-64 items-center justify-center rounded-md border border-dashed",
          className
        )}
      >
        <p className="text-muted-foreground">No PNG available to preview.</p>
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* PNG Preview */}
      <div className="overflow-auto rounded-md border">
        <img
          src={pngData}
          alt="Summary PNG Preview"
          className="max-h-[500px] max-w-full object-contain" // Maintain aspect ratio, limit height for UI
        />
      </div>

      {/* Download Button */}
      <Button onClick={handleDownload} className="w-full">
        <Download className="mr-2 size-4" />
        Download PNG
      </Button>
    </div>
  )
}
