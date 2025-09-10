import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the request is for the dashboard
  if (pathname.startsWith('/dashboard')) {
    // Get the session token from cookies
    const sessionToken = request.cookies.get('payload-token')?.value

    // If no session token, redirect to login
    if (!sessionToken) {
      console.log('🚫 No session token found, redirecting to login')
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Note: We can't check subscription status here because we need the database
    // The layout.tsx will handle the subscription check after authentication
    // This middleware just ensures the user is authenticated
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - admin (admin panel)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|admin).*)',
  ],
}
