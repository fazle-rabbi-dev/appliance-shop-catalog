import { AdminShell } from '@/components/admin/admin-shell'
import { signOutAction } from '@/lib/actions/auth'
import { requireAdmin } from '@/lib/data/auth'

export const metadata = {
  title: 'Admin — Rahman Electronics',
  robots: { index: false, follow: false },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin('/admin')

  return (
    <AdminShell userEmail={user.email} signOut={signOutAction}>
      {children}
    </AdminShell>
  )
}
