import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

const isPublicRoute = createRouteMatcher(["/", "/login(.*)", "/register(.*)", "/api/courses(.*)", "/api/users/profile"])

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth()

  // 1. If user is logged in and tries to access AUTH pages (login/register), push to dashboard
  const isAuthRoute = createRouteMatcher(["/login(.*)", "/register(.*)"])
  if (userId && isAuthRoute(req)) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl))
  }

  // 2. If user is NOT logged in and tries to access any non-public route
  if (!userId && !isPublicRoute(req)) {
    return NextResponse.redirect(new URL("/login", req.nextUrl))
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
}
