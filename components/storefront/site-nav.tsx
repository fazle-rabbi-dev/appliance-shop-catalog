'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export interface SiteNavLink {
  key: string
  href: string
  label: string
}

export function SiteNav({ links }: { links: SiteNavLink[] }) {
  const pathname = usePathname()
  const isProducts = pathname.startsWith('/products')

  return (
    <ul className="flex items-center gap-1">
      {links.map((link) => {
        const active = link.key === 'products' ? isProducts : pathname === '/' && link.key === 'home'
        return (
          <li key={link.key}>
            <Link
              href={link.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-foreground',
                active ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              {link.label}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
