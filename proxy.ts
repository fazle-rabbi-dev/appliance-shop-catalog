import { NextResponse, type NextRequest } from 'next/server'
import { SESSION_COOKIE } from '@/lib/auth-cookie'
import { loginHref } from '@/lib/routes'

/**
 * First line of defence: no session cookie means no admin HTML.
 * The real check happens in `app/admin/layout.tsx` and in every server action,
 * because Proxy never touches Server Function handlers on other paths.
 */
export function proxy(request: NextRequest) {
  if (request.cookies.has(SESSION_COOKIE)) return NextResponse.next()

  const target = request.nextUrl.pathname + request.nextUrl.search
  return NextResponse.redirect(new URL(loginHref(target), request.url))
}

export const config = {
  matcher: ['/admin/:path*'],
}
