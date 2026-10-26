import { productsHref } from '@/hooks/use-hash-route'
import { shopConfig } from '@/lib/shop-config'
import type { Category } from '@/lib/types'

export function SiteFooter({ categories }: { categories: Category[] }) {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold">{shopConfig.name}</p>
          <p className="text-sm leading-relaxed text-muted-foreground">{shopConfig.tagline}</p>
        </div>
        <nav aria-label="Categories" className="flex flex-col gap-2">
          <p className="text-sm font-semibold">Categories</p>
          <ul className="flex flex-col gap-1.5">
            {categories.map((c) => (
              <li key={c.id}>
                <a href={productsHref({ category: c.slug })} className="text-sm text-muted-foreground hover:text-foreground">
                  {c.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold">Contact</p>
          <a href={shopConfig.phoneHref} className="text-sm text-muted-foreground hover:text-foreground">
            {shopConfig.phoneDisplay}
          </a>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {shopConfig.address.line1}, {shopConfig.address.line2}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold">Good to know</p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Prices shown are for reference and may change. Please confirm with the shop before visiting.
          </p>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>
            © {new Date().getFullYear()} {shopConfig.name}. Demo storefront.
          </p>
          <a href="#admin" className="hover:text-foreground">
            Staff login
          </a>
        </div>
      </div>
    </footer>
  )
}
