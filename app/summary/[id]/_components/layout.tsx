/**
 * @description
 * This file defines a server-side layout for the summary/[id] route in the Article Summary Generator.
 * It provides a basic structure for the dynamic summary page.
 *
 * Key features:
 * - Centers content within a full-height container.
 * - Applies Tailwind CSS for consistent styling.
 *
 * @dependencies
 * - react: For ReactNode type in props.
 *
 * @notes
 * - Marked as "use server" per project rules for server components.
 * - Minimal layout to keep focus on the page content.
 * - No async logic, so no Suspense is needed.
 */

"use server"

import { ReactNode } from "react"

/**
 * @description Props for the SummaryLayout component.
 * @property children - The content to render within the layout.
 */
interface SummaryLayoutProps {
  children: ReactNode
}

/**
 * @description Server-side layout for the summary/[id] route.
 * @param props - The component props including children.
 * @returns A basic layout wrapping the summary page content.
 */
export default async function SummaryLayout({ children }: SummaryLayoutProps) {
  return <div className="bg-background min-h-screen">{children}</div>
}
