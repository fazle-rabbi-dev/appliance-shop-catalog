import { NextResponse, type NextRequest } from 'next/server'
import { SESSION_COOKIE } from '@/lib/auth-cookie'
import { adminRoutes, loginHref } from '@/lib/routes'

/**
 * First line of defence: no session cookie means no admin HTML.
 * The real check happens in `app/admin/layout.tsx` and in every server action,
 * because Proxy never touches Server Function handlers on other paths.
 *
 * Also keeps signed-in staff off the login page, so links never bounce through
 * a redirect (which renders as a blank frame on the client).
 */
export function proxy(request: NextRequest) {
  const signedIn = request.cookies.has(SESSION_COOKIE)
  const { pathname, search } = request.nextUrl

  if (pathname.startsWith('/admin') && !signedIn) {
    return NextResponse.redirect(new URL(loginHref(pathname + search), request.url))
  }

  if (pathname === '/login' && signedIn) {
    const next = request.nextUrl.searchParams.get('next')
    const target = next?.startsWith('/') && !next.startsWith('//') ? next : adminRoutes.dashboard
    return NextResponse.redirect(new URL(target, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
}
