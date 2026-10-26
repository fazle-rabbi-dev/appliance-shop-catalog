'use client'

import { LayoutDashboard, MapPin, Menu, Phone, Search, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { ThemeToggle } from '@/components/theme-toggle'
import { adminRoutes, homeSectionHref, productsHref } from '@/lib/routes'
import { shopConfig } from '@/lib/shop-config'
import { cn } from '@/lib/utils'

const links = [
  { key: 'home', href: '/', label: 'হোম' },
  { key: 'products', href: productsHref(), label: 'পণ্য' },
  { key: 'categories', href: homeSectionHref('categories'), label: 'ক্যাটাগরি' },
  { key: 'about', href: homeSectionHref('about'), label: 'আমাদের সম্পর্কে' },
  { key: 'contact', href: homeSectionHref('contact'), label: 'যোগাযোগ' },
]

export function SiteHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  const isProducts = pathname.startsWith('/products')

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const q = String(new FormData(event.currentTarget).get('q') ?? '').trim()
    setMenuOpen(false)
    router.push(productsHref({ q: q || undefined }))
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label={`${shopConfig.name} — হোম`}>
          <span className="flex size-8 items-center justify-center rounded-lg bg-foreground text-sm font-bold text-background">
            {shopConfig.shortName.charAt(0)}
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-tight">{shopConfig.name}</span>
            <span className="hidden text-xs text-muted-foreground sm:block">হোম অ্যাপ্লায়েন্স</span>
          </span>
        </Link>

        <nav aria-label="প্রধান" className="ml-6 hidden md:block">
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
        </nav>

        <form role="search" onSubmit={handleSearch} className="ml-auto hidden w-full max-w-xs items-center lg:flex">
          <label htmlFor="header-search" className="sr-only">
            পণ্য খুঁজুন
          </label>
          <div className="relative w-full">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              id="header-search"
              name="q"
              type="search"
              defaultValue=""
              placeholder="ফ্রিজ, টিভি খুঁজুন…"
              className="h-10 w-full rounded-lg border border-input bg-card pr-3 pl-9 text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/20"
            />
          </div>
        </form>

        <Link
          href={adminRoutes.dashboard}
          className="ml-auto hidden items-center gap-1.5 rounded-md px-2.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex lg:ml-0"
        >
          <LayoutDashboard className="size-4" aria-hidden="true" />
          স্টাফ
        </Link>

        <ThemeToggle className="hidden sm:inline-flex" />

        <Link
          href={homeSectionHref('contact')}
          className="hidden shrink-0 items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium whitespace-nowrap text-primary-foreground transition-colors hover:bg-primary/90 active:translate-y-px sm:inline-flex lg:hidden xl:inline-flex"
        >
          <MapPin className="size-4" aria-hidden="true" />
          দোকানে আসুন
        </Link>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          className="ml-auto inline-flex size-10 items-center justify-center rounded-lg border border-border sm:ml-0 md:hidden"
        >
          {menuOpen ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
          <span className="sr-only">{menuOpen ? 'মেনু বন্ধ করুন' : 'মেনু খুলুন'}</span>
        </button>
      </div>

      {menuOpen && (
        <div id="mobile-menu" className="border-t border-border bg-background md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4">
            <form role="search" onSubmit={handleSearch} className="relative">
              <label htmlFor="mobile-search" className="sr-only">
                পণ্য খুঁজুন
              </label>
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <input
                id="mobile-search"
                name="q"
                type="search"
                defaultValue=""
                placeholder="পণ্য খুঁজুন"
                className="h-11 w-full rounded-lg border border-input bg-card pr-3 pl-9 text-base placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none"
              />
            </form>
            <nav aria-label="মোবাইল">
              <ul className="flex flex-col">
                {links.map((link) => (
                  <li key={link.key}>
                    <Link
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className="block rounded-md px-2 py-3 text-base font-medium hover:bg-muted"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href={adminRoutes.dashboard}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 rounded-md px-2 py-3 text-base font-medium text-muted-foreground hover:bg-muted"
                  >
                    <LayoutDashboard className="size-4" aria-hidden="true" />
                    স্টাফ লগইন
                  </Link>
                </li>
                <li className="flex items-center justify-between gap-2 rounded-md px-2 py-1">
                  <span className="text-base font-medium">থিম</span>
                  <ThemeToggle />
                </li>
              </ul>
            </nav>
            <a
              href={shopConfig.phoneHref}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-base font-medium text-primary-foreground"
            >
              <Phone className="size-4" aria-hidden="true" />
              কল করুন {shopConfig.phoneDisplay}
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
