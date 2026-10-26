import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { LoginForm } from '@/components/auth/login-form'
import { getSession } from '@/lib/data/auth'
import { adminRoutes } from '@/lib/routes'

export const metadata: Metadata = {
  title: 'স্টাফ লগইন — রহমান ইলেকট্রনিকস',
  robots: { index: false, follow: false },
}

export default function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-surface text-sm text-muted-foreground">
          লোড হচ্ছে…
        </div>
      }
    >
      <LoginArea searchParams={searchParams} />
    </Suspense>
  )
}

async function LoginArea({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams
  const session = await getSession()
  if (session) redirect(next && next.startsWith('/') && !next.startsWith('//') ? next : adminRoutes.dashboard)

  return <LoginForm next={next ?? adminRoutes.dashboard} />
}
