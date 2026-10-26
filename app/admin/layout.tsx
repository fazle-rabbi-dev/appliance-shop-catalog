import { AdminShell } from '@/components/admin/admin-shell'
import { signOutAction } from '@/lib/actions/auth'
import { requireAdmin } from '@/lib/data/auth'

export const metadata = {
  title: 'অ্যাডমিন — রহমান ইলেকট্রনিকস',
  robots: { index: false, follow: false },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin('/admin')

  return (
    <AdminShell username={user.username} signOut={signOutAction}>
      {children}
    </AdminShell>
  )
}
