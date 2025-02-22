/**
 * @description
 * This file contains middleware for protecting routes, checking user authentication, and redirecting as needed in the Article Summary Generator.
 * It uses Clerk for authentication and restricts access to specific routes based on user IDs.
 *
 * Key features:
 * - Protects /summary/* routes with Clerk authentication.
 * - Restricts access to a hardcoded list of allowed user IDs (for personal use by creator and sisters).
 * - Redirects unauthenticated or unauthorized users appropriately.
 *
 * @dependencies
 * - @clerk/nextjs/server: For Clerk middleware and authentication helpers.
 * - next/server: For NextResponse to control request flow.
 *
 * @notes
 * - Hardcoded ALLOWED_USER_IDS must be updated by the user with real Clerk user IDs after signup.
 * - Retains existing /todo(.*) matcher from starter for compatibility, though unused in this app.
 * - Uses async/await for Clerk’s auth helper per project auth rules.
 * - Config matcher excludes static files and Next.js internals per best practices.
 */

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

// Define protected routes
const isProtectedRoute = createRouteMatcher(["/todo(.*)", "/summary(.*)"])

// Hardcoded list of allowed Clerk user IDs (to be replaced by user after signup)
const ALLOWED_USER_IDS = [
  "user_1234567890", // Placeholder for creator’s Clerk user ID
  "user_0987654321", // Placeholder for sister 1’s Clerk user ID
  "user_5678901234"  // Placeholder for sister 2’s Clerk user ID
]

export default clerkMiddleware(async (auth, req) => {
  const { userId, redirectToSignIn } = await auth()

  // If the route is protected and user is not signed in, redirect to sign-in
  if (!userId && isProtectedRoute(req)) {
    return redirectToSignIn({ returnBackUrl: req.url })
  }

  // If user is signed in and accessing a protected route, check authorization
  if (userId && isProtectedRoute(req)) {
    // Check if the user’s ID is in the allowed list
    if (!ALLOWED_USER_IDS.includes(userId)) {
      // Redirect unauthorized users to homepage
      return NextResponse.redirect(new URL("/", req.url))
    }
    // Allow authorized users to proceed
    return NextResponse.next()
  }

  // Allow all other routes (e.g., public routes like /login, /signup)
  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"]
}