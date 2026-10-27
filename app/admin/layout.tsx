import { AdminHeader } from '@/components/admin/admin-header'

export const metadata = {
  title: 'অ্যাডমিন — রহমান ইলেকট্রনিকস',
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const username = process.env.ADMIN_USERNAME ?? 'অ্যাডমিন'

  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <AdminHeader username={username} />
      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
    </div>
  )
}
