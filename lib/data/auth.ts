import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createHmac, timingSafeEqual } from 'node:crypto'
import { SESSION_COOKIE } from '@/lib/auth-cookie'
import { loginHref } from '@/lib/routes'
import type { SessionUser } from '@/lib/types'

/**
 * THE AUTH BOUNDARY.
 *
 * Demo implementation: one admin account from env vars, signed cookie session.
 * To move to Supabase Auth or a Mongo-backed session store, keep the exported
 * functions and replace their bodies. Nothing else in the app reads cookies.
 */
const DEMO_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@shop.test'
const DEMO_PASSWORD = process.env.ADMIN_PASSWORD ?? 'admin1234'
const SESSION_SECRET = process.env.AUTH_SECRET ?? 'dev-only-insecure-secret-change-me'
const SESSION_MAX_AGE = 60 * 60 * 24 * 7

interface SessionPayload extends SessionUser {
  exp: number
}

function sign(payload: string) {
  return createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url')
}

function createToken(user: SessionUser) {
  const payload = Buffer.from(
    JSON.stringify({ ...user, exp: Date.now() + SESSION_MAX_AGE * 1000 } satisfies SessionPayload),
  ).toString('base64url')
  return `${payload}.${sign(payload)}`
}

function verifyToken(token: string | undefined): SessionUser | null {
  if (!token) return null
  const [payload, signature] = token.split('.')
  if (!payload || !signature) return null

  const expected = sign(payload)
  const a = Buffer.from(signature)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null

  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString()) as SessionPayload
    if (parsed.exp < Date.now()) return null
    return { email: parsed.email, role: parsed.role }
  } catch {
    return null
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies()
  return verifyToken(store.get(SESSION_COOKIE)?.value)
}

/** Use in server components/actions that must be admin-only. */
export async function requireAdmin(returnTo?: string): Promise<SessionUser> {
  const session = await getSession()
  if (!session) redirect(loginHref(returnTo))
  return session
}

export async function signIn(email: string, password: string): Promise<SessionUser> {
  const ok =
    email.trim().toLowerCase() === DEMO_EMAIL.toLowerCase() && password === DEMO_PASSWORD
  if (!ok) throw new Error('Invalid email or password.')

  const user: SessionUser = { email: DEMO_EMAIL, role: 'admin' }
  const store = await cookies()
  store.set(SESSION_COOKIE, createToken(user), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  })
  return user
}

export async function signOut(): Promise<void> {
  const store = await cookies()
  store.delete(SESSION_COOKIE)
}

/** Demo credentials, shown on the login screen only outside production. */
export function demoCredentials() {
  if (process.env.NODE_ENV === 'production' && process.env.ADMIN_EMAIL) return null
  return { email: DEMO_EMAIL, password: DEMO_PASSWORD }
}
