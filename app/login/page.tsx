import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { LoginForm } from '@/components/auth/login-form'
import { getSession } from '@/lib/data/auth'
import { adminRoutes } from '@/lib/routes'

export const metadata: Metadata = {
  title: 'Staff sign in — Rahman Electronics',
  robots: { index: false, follow: false },
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams
  const session = await getSession()
  if (session) redirect(next && next.startsWith('/') && !next.startsWith('//') ? next : adminRoutes.dashboard)

  return <LoginForm next={next ?? adminRoutes.dashboard} />
}
