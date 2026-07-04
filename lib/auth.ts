import { SignJWT, jwtVerify } from 'jose'

export const SESSION_COOKIE = 'session'
const secret = new TextEncoder().encode(process.env.AUTH_SECRET || 'dev-only-change-me')

export async function createSession(): Promise<string> {
  return await new SignJWT({ authed: true })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
}

export async function verifySession(token?: string): Promise<boolean> {
  if (!token) return false
  try {
    await jwtVerify(token, secret)
    return true
  } catch {
    return false
  }
}