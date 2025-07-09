import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const { nextUrl } = request
  
  // Skip middleware for static files and API routes
  if (
    nextUrl.pathname.startsWith("/_next") ||
    nextUrl.pathname.startsWith("/api") ||
    nextUrl.pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  // Get token using JWT approach (works in Edge Runtime)
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  })
  
  const isLoggedIn = !!token
  const userRole = token?.role as string

  // Public routes
  if (nextUrl.pathname === "/login" || nextUrl.pathname === "/") {
    if (isLoggedIn) {
      // Redirect authenticated users to their dashboard
      const redirectTo = userRole === "ADMIN" ? "/admin" : "/client"
      return NextResponse.redirect(new URL(redirectTo, nextUrl))
    }
    return NextResponse.next()
  }

  // Protected routes
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl))
  }

  // Role-based access control
  if (nextUrl.pathname.startsWith("/admin") && userRole !== "ADMIN") {
    return NextResponse.redirect(new URL("/client", nextUrl))
  }

  if (nextUrl.pathname.startsWith("/client") && userRole !== "CLIENT") {
    return NextResponse.redirect(new URL("/admin", nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}