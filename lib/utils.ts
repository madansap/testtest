/**
 * @description
 * This file contains utility functions for the app.
 * It provides helper methods for class name merging and text layout in canvas rendering.
 *
 * Key features:
 * - Merges Tailwind CSS classes with clsx and twMerge.
 * - Wraps text for canvas rendering to fit within a specified width.
 *
 * @dependencies
 * - clsx: For class name merging.
 * - tailwind-merge: For Tailwind-specific class merging.
 * - canvas: Context type inferred for text wrapping.
 *
 * @notes
 * - `cn` is a pre-existing utility for Tailwind class handling.
 * - `wrapText` is designed for PNG generation to handle bullet point layout.
 */

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * @description Merges multiple class values into a single string, optimized for Tailwind CSS.
 * @param inputs - Array of class values to merge.
 * @returns A single string of merged class names.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * @description Wraps text into multiple lines to fit within a maximum width for canvas rendering.
 * @param ctx - The 2D canvas rendering context.
 * @param text - The text to wrap.
 * @param maxWidth - The maximum width in pixels for the text.
 * @param x - The x-coordinate where text rendering starts.
 * @returns An array of objects with wrapped text lines and their x-coordinates.
 */
export function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  x: number
): { text: string; x: number }[] {
  const words = text.split(" ")
  const lines: { text: string; x: number }[] = []
  let currentLine = words[0]

  // Iterate through words to build lines
  for (let i = 1; i < words.length; i++) {
    const testLine = `${currentLine} ${words[i]}`
    const metrics = ctx.measureText(testLine)
    const testWidth = metrics.width

    if (testWidth <= maxWidth) {
      currentLine = testLine
    } else {
      lines.push({ text: currentLine, x })
      currentLine = words[i]
    }
  }

  // Add the last line
  lines.push({ text: currentLine, x })

  return lines
}
