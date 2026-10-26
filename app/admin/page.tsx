import { Plus, RotateCcw } from 'lucide-react'
import Link from 'next/link'
import { AvailabilityBadge } from '@/components/shared/availability-badge'
import { ProductImage } from '@/components/shared/product-image'
import { buttonVariants } from '@/components/ui/button'
import { ResetDemoData } from '@/components/admin/reset-demo-data'
import { catalogRepository } from '@/lib/data/catalog-repository'
import { formatDate, formatTaka } from '@/lib/format'
import { adminRoutes } from '@/lib/routes'
import { cn } from '@/lib/utils'

export default async function AdminDashboardRoute() {
  const [products, categories] = await Promise.all([
    catalogRepository.listProducts(),
    catalogRepository.listCategories(),
  ])

  const categoryById = new Map(categories.map((category) => [category.id, category]))

  const stats = [
    { label: 'Total products', value: products.length },
    { label: 'Published', value: products.filter((p) => p.published).length },
    { label: 'Out of stock', value: products.filter((p) => p.availability === 'out_of_stock').length },
    { label: 'Categories', value: categories.length },
  ]

  const recent = [...products].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5)

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-balance sm:text-3xl">Overview</h1>
          <p className="text-sm text-muted-foreground">A quick look at what customers can see right now.</p>
        </div>
        <Link href={adminRoutes.newProduct} className={cn(buttonVariants(), 'h-11 gap-2 px-4')}>
          <Plus aria-hidden="true" />
          Add product
        </Link>
      </div>

      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4">
            <dt className="text-sm text-muted-foreground">{stat.label}</dt>
            <dd className="text-3xl font-semibold tabular-nums">{stat.value}</dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby="recent-heading" className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <h2 id="recent-heading" className="text-lg font-semibold">
            Recently added
          </h2>
          <Link href={adminRoutes.products} className="text-sm font-medium text-primary hover:underline">
            Manage all products
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
            No products yet. Add your first product to get started.
          </p>
        ) : (
          <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
            {recent.map((product) => (
              <li key={product.id}>
                <Link
                  href={adminRoutes.editProduct(product.id)}
                  className="flex items-center gap-3 p-3 hover:bg-muted/60 sm:gap-4 sm:px-4"
                >
                  <ProductImage src={product.images[0]?.url} alt="" className="size-12 shrink-0 rounded-lg" />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate font-medium">{product.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {categoryById.get(product.categoryId)?.name ?? 'Uncategorised'} · Added {formatDate(product.createdAt)}
                    </span>
                  </div>
                  <div className="hidden flex-col items-end gap-1 sm:flex">
                    <span className="text-sm font-semibold tabular-nums">{formatTaka(product.price)}</span>
                    <AvailabilityBadge value={product.availability} />
                  </div>
                  {!product.published ? (
                    <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      Draft
                    </span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <RotateCcw className="size-4 text-muted-foreground" aria-hidden="true" />
            Restore demo data
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Replaces the current catalog with the original sample data.
          </p>
        </div>
        <ResetDemoData />
      </section>
    </div>
  )
}
