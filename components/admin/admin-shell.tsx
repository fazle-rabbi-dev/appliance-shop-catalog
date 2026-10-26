'use client'

import { ArrowLeft, Info, LayoutDashboard, Package, Plus } from 'lucide-react'
import type { Route } from '@/hooks/use-hash-route'
import { shopConfig } from '@/lib/shop-config'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '#admin', label: 'Overview', icon: LayoutDashboard, match: ['admin'] },
  { href: '#admin/products', label: 'Products', icon: Package, match: ['admin-products', 'admin-edit'] },
  { href: '#admin/new', label: 'Add product', icon: Plus, match: ['admin-new'] },
] as const

export function AdminShell({ route, children }: { route: Route; children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <div className="border-b border-warning/30 bg-warning-soft text-foreground">
        <div className="mx-auto flex max-w-6xl items-start gap-2 px-4 py-2 text-xs leading-relaxed sm:items-center sm:px-6">
          <Info className="mt-0.5 size-3.5 shrink-0 text-warning sm:mt-0" aria-hidden="true" />
          <p>
            <strong className="font-semibold">Prototype Mode — Changes stored in this browser.</strong>{' '}
            <span className="text-muted-foreground">
              There is no login here. In production, admin access will be protected with Supabase Auth and database
              policies.
            </span>
          </p>
        </div>
      </div>

      <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Shop admin</span>
              <span className="text-base font-semibold">{shopConfig.name}</span>
            </div>
            <a
              href="#"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground sm:hidden"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              View site
            </a>
          </div>
          <nav aria-label="Admin" className="-mx-1 flex items-center gap-1 overflow-x-auto">
            {NAV.map((item) => {
              const active = (item.match as readonly string[]).includes(route.name)
              return (
                <a
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
                </a>
              )
            })}
            <a
              href="#"
              className="ml-2 hidden h-10 items-center gap-1.5 rounded-lg border border-border px-3 text-sm font-medium hover:bg-muted sm:inline-flex"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              View site
            </a>
          </nav>
        </div>
      </header>

      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
    </div>
  )
}
