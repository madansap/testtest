/**
 * @description
 * This file defines a client-side rich text editor component for the Article Summary Generator.
 * It allows users to manually edit article summaries with basic formatting options using React Quill.
 *
 * Key features:
 * - Provides a WYSIWYG editor with bold, italics, and bullet point formatting.
 * - Supports real-time updates to the summary text via a callback.
 * - Maintains bullet-point structure for compatibility with PNG output.
 *
 * @dependencies
 * - react: For state management and component lifecycle.
 * - react-quill: For the rich text editor functionality.
 * - @/lib/utils: For class name merging with cn utility.
 *
 * @notes
 * - Marked as "use client" per project rules for client-side components.
 * - Uses a minimal Quill toolbar with only required formatting options to keep UI simple.
 * - Preserves bullet points using Quill’s list module to match PNG output requirements.
 * - Assumes parent component (Step 11) will handle saving edits via server actions.
 * - Styles are applied via Tailwind CSS classes for consistency with the app’s design system.
 */

"use client"

import { useState } from "react"
import ReactQuill from "react-quill"
import { cn } from "@/lib/utils"
import "react-quill/dist/quill.snow.css" // Import Quill default styles

/**
 * @description Props for the SummaryEditor component.
 * @property initialSummary - The initial summary text to display in the editor.
 * @property onChange - Callback function to handle changes to the summary text.
 * @property className - Optional additional CSS classes for styling.
 */
interface SummaryEditorProps {
  initialSummary: string
  onChange: (value: string) => void
  className?: string
}

/**
 * @description A client-side rich text editor for editing article summaries.
 * @param props - The component props.
 * @returns A ReactQuill editor instance with basic formatting options.
 */
export default function SummaryEditor({
  initialSummary,
  onChange,
  className
}: SummaryEditorProps) {
  const [value, setValue] = useState(initialSummary)

  // Quill modules configuration: Define the toolbar options
  const modules = {
    toolbar: [
      ["bold", "italic"], // Bold and italics buttons
      [{ list: "bullet" }] // Bullet list button
    ]
  }

  // Quill formats: Restrict to only allowed formatting options
  const formats = ["bold", "italic", "list"]

  /**
   * @description Handles changes in the editor and updates state/callback.
   * @param content - The new content from the editor as HTML.
   */
  const handleChange = (content: string) => {
    setValue(content) // Update local state
    onChange(content) // Notify parent component of the change
  }

  return (
    <div className={cn("summary-editor", className)}>
      <ReactQuill
        value={value}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        placeholder="Edit your summary here..."
        className="border-input rounded-md border bg-white"
      />
    </div>
  )
}
