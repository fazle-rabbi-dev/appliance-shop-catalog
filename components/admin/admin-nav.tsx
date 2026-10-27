'use client'

import { LayoutDashboard, Package, Plus, Tags } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { adminRoutes } from '@/lib/routes'
import { cn } from '@/lib/utils'

const NAV = [
  { href: adminRoutes.dashboard, label: 'সারসংক্ষেপ', icon: LayoutDashboard, exact: true },
  { href: adminRoutes.products, label: 'পণ্য', icon: Package, exact: true },
  { href: adminRoutes.categories, label: 'ক্যাটাগরি', icon: Tags, exact: false },
  { href: adminRoutes.newProduct, label: 'পণ্য যোগ করুন', icon: Plus, exact: true },
] as const

function isActive(pathname: string, item: (typeof NAV)[number]) {
  return item.exact ? pathname === item.href : pathname.startsWith(item.href)
}

const desktopLink = 'inline-flex h-10 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors'
const activeDesktop = 'bg-primary text-primary-foreground'
const idleDesktop = 'text-foreground hover:bg-muted'

const mobileLink = 'flex items-center gap-2 rounded-lg px-2 py-3 text-base font-medium'
const activeMobile = 'bg-primary text-primary-foreground'
const idleMobile = 'hover:bg-muted'

/** Active state needs `usePathname`, so this is a dynamic hole — always render inside <Suspense>. */
export function AdminNavDesktop() {
  const pathname = usePathname()

  return NAV.map((item) => {
    const active = isActive(pathname, item)
    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={active ? 'page' : undefined}
        className={cn(desktopLink, active ? activeDesktop : idleDesktop)}
      >
        <item.icon className="size-4" aria-hidden="true" />
        {item.label}
      </Link>
    )
  })
}

export function AdminNavDesktopFallback() {
  return NAV.map((item) => (
    <Link key={item.href} href={item.href} className={cn(desktopLink, idleDesktop)}>
      <item.icon className="size-4" aria-hidden="true" />
      {item.label}
    </Link>
  ))
}

export function AdminNavMobile({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return NAV.map((item) => {
    const active = isActive(pathname, item)
    return (
      <li key={item.href}>
        <Link
          href={item.href}
          onClick={onNavigate}
          aria-current={active ? 'page' : undefined}
          className={cn(mobileLink, active ? activeMobile : idleMobile)}
        >
          <item.icon className="size-4" aria-hidden="true" />
          {item.label}
        </Link>
      </li>
    )
  })
}

export function AdminNavMobileFallback({ onNavigate }: { onNavigate?: () => void }) {
  return NAV.map((item) => (
    <li key={item.href}>
      <Link href={item.href} onClick={onNavigate} className={cn(mobileLink, idleMobile)}>
        <item.icon className="size-4" aria-hidden="true" />
        {item.label}
      </Link>
    </li>
  ))
}
