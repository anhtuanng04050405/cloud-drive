import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifySession, SESSION_COOKIE } from './lib/auth'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (pathname.startsWith('/login') || pathname === '/api/login') {
    return NextResponse.next()
  }
  const token = req.cookies.get(SESSION_COOKIE)?.value
  const ok = await verifySession(token)
  if (!ok) {
    if (pathname.startsWith('/api/')) {
      return new NextResponse('Unauthorized', { status: 401 })
    }
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}