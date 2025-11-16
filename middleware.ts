import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow public access to upload page
        if (req.nextUrl.pathname === "/upload") {
          return true
        }
        // Protect other routes
        if (req.nextUrl.pathname.startsWith("/my-uploads") || 
            req.nextUrl.pathname.startsWith("/library") ||
            req.nextUrl.pathname.startsWith("/playlist")) {
          return !!token
        }
        return true
      },
    },
  }
)

export const config = {
  matcher: ["/my-uploads/:path*", "/library/:path*", "/playlist/:path*"],
}

