import { NextResponse } from 'next/server'
import { createSession, SESSION_COOKIE } from '@/lib/auth'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({ password: '' }))
  const password = body.password
  const expected = process.env.APP_PASSWORD
  // Cham lai mot chut de han che do mat khau (brute-force)
  await new Promise((r) => setTimeout(r, 300))
  if (!expected || password !== expected) {
    return NextResponse.json({ error: 'Sai mat khau' }, { status: 401 })
  }
  const token = await createSession()
  const res = NextResponse.json({ ok: true })
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
  return res
}