import { Suspense } from 'react'
import { AdminShell } from '@/components/admin/admin-shell'
import { signOutAction } from '@/lib/actions/auth'
import { requireAdmin } from '@/lib/data/auth'

export const metadata = {
  title: 'অ্যাডমিন — রহমান ইলেকট্রনিকস',
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-surface text-sm text-muted-foreground">
          লোড হচ্ছে…
        </div>
      }
    >
      <AdminArea>{children}</AdminArea>
    </Suspense>
  )
}

async function AdminArea({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin('/admin')

  return (
    <AdminShell username={user.username} signOut={signOutAction}>
      {children}
    </AdminShell>
  )
}
