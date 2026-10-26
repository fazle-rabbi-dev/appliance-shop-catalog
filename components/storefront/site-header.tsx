'use client'

import { LayoutDashboard, MapPin, Menu, Phone, Search, X } from 'lucide-react'
import { useState } from 'react'
import { navigate, productsHref, type Route } from '@/hooks/use-hash-route'
import { shopConfig } from '@/lib/shop-config'
import { cn } from '@/lib/utils'

const links = [
  { href: '#', label: 'Home', match: (r: Route) => r.name === 'home' && !r.section },
  { href: '#products', label: 'Products', match: (r: Route) => r.name === 'products' || r.name === 'product' },
  { href: '#categories', label: 'Categories', match: (r: Route) => r.name === 'home' && r.section === 'categories' },
  { href: '#about', label: 'About', match: (r: Route) => r.name === 'home' && r.section === 'about' },
  { href: '#contact', label: 'Contact', match: (r: Route) => r.name === 'home' && r.section === 'contact' },
]

export function SiteHeader({ route }: { route: Route }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const initialQuery = route.name === 'products' ? (route.q ?? '') : ''

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const q = String(new FormData(event.currentTarget).get('q') ?? '').trim()
    const category = route.name === 'products' ? route.category : undefined
    setMenuOpen(false)
    navigate(productsHref({ q: q || undefined, category }))
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <a href="#" className="flex shrink-0 items-center gap-2.5" aria-label={`${shopConfig.name} home`}>
          <span className="flex size-8 items-center justify-center rounded-lg bg-foreground text-sm font-bold text-background">
            {shopConfig.shortName.charAt(0)}
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-tight">{shopConfig.name}</span>
            <span className="hidden text-xs text-muted-foreground sm:block">Home appliances</span>
          </span>
        </a>

        <nav aria-label="Main" className="ml-6 hidden md:block">
          <ul className="flex items-center gap-1">
            {links.map((link) => {
              const active = link.match(route)
              return (
                <li key={link.label}>
                  <a
                    href={link.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-foreground',
                      active ? 'text-foreground' : 'text-muted-foreground',
                    )}
                  >
                    {link.label}
                  </a>
                </li>
              )
            })}
          </ul>
        </nav>

        <form
          role="search"
          onSubmit={handleSearch}
          key={initialQuery}
          className="ml-auto hidden w-full max-w-xs items-center lg:flex"
        >
          <label htmlFor="header-search" className="sr-only">
            Search products
          </label>
          <div className="relative w-full">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              id="header-search"
              name="q"
              type="search"
              defaultValue={initialQuery}
              placeholder="Search refrigerators, TVs…"
              className="h-10 w-full rounded-lg border border-input bg-card pr-3 pl-9 text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/20"
            />
          </div>
        </form>

        <a
          href="#admin"
          className="ml-auto hidden items-center gap-1.5 rounded-md px-2.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex lg:ml-0"
        >
          <LayoutDashboard className="size-4" aria-hidden="true" />
          Admin
          <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase">Demo</span>
        </a>

        <a
          href="#contact"
          className="hidden shrink-0 items-center gap-2 whitespace-nowrap rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 active:translate-y-px sm:inline-flex lg:hidden xl:inline-flex"
        >
          <MapPin className="size-4" aria-hidden="true" />
          Visit Our Shop
        </a>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          className="ml-auto inline-flex size-10 items-center justify-center rounded-lg border border-border md:hidden sm:ml-0"
        >
          {menuOpen ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
          <span className="sr-only">{menuOpen ? 'Close menu' : 'Open menu'}</span>
        </button>
      </div>

      {menuOpen && (
        <div id="mobile-menu" className="border-t border-border bg-background md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4">
            <form role="search" onSubmit={handleSearch} className="relative">
              <label htmlFor="mobile-search" className="sr-only">
                Search products
              </label>
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <input
                id="mobile-search"
                name="q"
                type="search"
                defaultValue={initialQuery}
                placeholder="Search products"
                className="h-11 w-full rounded-lg border border-input bg-card pr-3 pl-9 text-base placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none"
              />
            </form>
            <nav aria-label="Mobile">
              <ul className="flex flex-col">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      aria-current={link.match(route) ? 'page' : undefined}
                      className="block rounded-md px-2 py-3 text-base font-medium hover:bg-muted"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
                <li>
                  <a
                    href="#admin"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 rounded-md px-2 py-3 text-base font-medium text-muted-foreground hover:bg-muted"
                  >
                    <LayoutDashboard className="size-4" aria-hidden="true" />
                    Admin (demo)
                  </a>
                </li>
              </ul>
            </nav>
            <a
              href={shopConfig.phoneHref}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-base font-medium text-primary-foreground"
            >
              <Phone className="size-4" aria-hidden="true" />
              Call {shopConfig.phoneDisplay}
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
