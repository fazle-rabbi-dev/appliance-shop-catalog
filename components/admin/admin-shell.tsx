'use client'

import { ArrowLeft, LayoutDashboard, LogOut, Package, Plus } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { adminRoutes } from '@/lib/routes'
import { shopConfig } from '@/lib/shop-config'
import { cn } from '@/lib/utils'

const NAV = [
  { href: adminRoutes.dashboard, label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: adminRoutes.products, label: 'Products', icon: Package, exact: false },
  { href: adminRoutes.newProduct, label: 'Add product', icon: Plus, exact: true },
] as const

export function AdminShell({
  username,
  signOut,
  children,
}: {
  username: string
  signOut: () => Promise<void>
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">Shop admin</span>
              <span className="text-base font-semibold">{shopConfig.name}</span>
            </div>
            <Link
              href="/"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground sm:hidden"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              View site
            </Link>
          </div>

          <nav aria-label="Admin" className="-mx-1 flex items-center gap-1 overflow-x-auto">
            {NAV.map((item) => {
              const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'inline-flex h-10 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors',
                    active ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted',
                  )}
                >
                  <item.icon className="size-4" aria-hidden="true" />
                  {item.label}
                </Link>
              )
            })}
            <Link
              href="/"
              className="ml-2 hidden h-10 items-center gap-1.5 rounded-lg border border-border px-3 text-sm font-medium hover:bg-muted sm:inline-flex"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              View site
            </Link>
          </nav>

          <div className="flex items-center justify-between gap-3 border-t border-border pt-3 sm:justify-end sm:border-t-0 sm:pt-0">
            <span className="truncate text-xs text-muted-foreground">{username}</span>
            <form action={signOut}>
              <button
                type="submit"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <LogOut className="size-4" aria-hidden="true" />
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
    </div>
  )
}
