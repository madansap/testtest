/**
 * @description
 * This file defines a reusable URL input form component for the Article Summary Generator.
 * It allows users to input a URL, validates it, and submits it to fetch article content.
 *
 * Key features:
 * - Validates URL format using Zod schema.
 * - Submits URL to fetchArticleAction server action.
 * - Provides feedback via toast notifications.
 *
 * @dependencies
 * - react-hook-form: For form state management and submission handling.
 * - zod: For schema-based form validation.
 * - @hookform/resolvers/zod: Integrates Zod with React Hook Form.
 * - @/components/ui/button: Shadcn Button component for submit action.
 * - @/components/ui/form: Shadcn Form components for structure.
 * - @/components/ui/input: Shadcn Input component for URL field.
 * - @/lib/hooks/use-toast: Custom hook for toast notifications.
 * - @/actions/ai/fetch-article-actions: Server action to fetch article text.
 *
 * @notes
 * - Client-side component marked with "use client" per project rules.
 * - Handles loading state during submission to prevent multiple submissions.
 * - Assumes fetchArticleAction returns ArticleData or an error message.
 * - Does not handle redirect here; redirection logic will be in Step 8 (homepage).
 */

"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/lib/hooks/use-toast"
import { fetchArticleAction } from "@/actions/ai/fetch-article-actions"
import { useState } from "react"

/**
 * @description Schema for validating the URL input.
 * Ensures the input is a non-empty string and a valid URL.
 */
const urlSchema = z.object({
  url: z
    .string()
    .min(1, "URL is required")
    .url("Please enter a valid URL (e.g., https://example.com)")
})

/**
 * @description Props for the UrlInput component.
 */
interface UrlInputProps {
  onSubmitSuccess?: (data: { url: string; text: string }) => void // Callback for successful submission
}

/**
 * @description A reusable URL input form component.
 * @param props - The component props.
 * @returns A form for entering and submitting a URL.
 */
export default function UrlInput({ onSubmitSuccess }: UrlInputProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize form with React Hook Form and Zod validation
  const form = useForm<z.infer<typeof urlSchema>>({
    resolver: zodResolver(urlSchema),
    defaultValues: {
      url: ""
    }
  })

  /**
   * @description Handles form submission by calling fetchArticleAction.
   * @param values - The form values containing the URL.
   */
  const onSubmit = async (values: z.infer<typeof urlSchema>) => {
    setIsSubmitting(true)
    try {
      const result = await fetchArticleAction(values.url)

      if (result.isSuccess && result.data) {
        toast({
          title: "Success",
          description: "Article fetched successfully.",
          variant: "default"
        })
        if (onSubmitSuccess) {
          onSubmitSuccess(result.data) // Pass data to parent component (e.g., for redirect)
        }
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to fetch article.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error submitting URL:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Article URL</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://example.com/article"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Fetching..." : "Fetch Article"}
        </Button>
      </form>
    </Form>
  )
}
