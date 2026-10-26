import Link from 'next/link'
import { CategoryIcon } from '@/components/shared/category-icon'
import { productsHref } from '@/lib/routes'
import type { Category } from '@/lib/types'

export function CategoryGrid({ categories, counts }: { categories: Category[]; counts: Map<string, number> }) {
  return (
    <section id="categories" aria-labelledby="categories-title" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-2">
        <h2 id="categories-title" className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Shop by category
        </h2>
        <p className="text-base leading-relaxed text-muted-foreground">Find what you need for the kitchen, living room and bedroom.</p>
      </div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {categories.map((category) => {
          const count = counts.get(category.id) ?? 0
          return (
            <li key={category.id}>
              <Link
                href={productsHref({ category: category.slug })}
                className="group flex h-full flex-col gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-accent"
              >
                <span className="flex size-11 items-center justify-center rounded-lg bg-surface text-foreground transition-colors group-hover:bg-card group-hover:text-primary">
                  <CategoryIcon name={category.icon} className="size-5" />
                </span>
                <span className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold">{category.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {count} {count === 1 ? 'product' : 'products'}
                  </span>
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
