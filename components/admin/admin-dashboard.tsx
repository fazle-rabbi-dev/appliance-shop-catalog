'use client'

import { Plus, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { AvailabilityBadge } from '@/components/shared/availability-badge'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { ProductImage } from '@/components/shared/product-image'
import { useToast } from '@/components/shared/toast-provider'
import { Button, buttonVariants } from "@/components/ui/button"
import { useCatalog } from '@/hooks/use-catalog'
import { catalogRepository } from '@/lib/catalog-repository'
import { formatDate, formatTaka } from '@/lib/format'
import { cn } from "@/lib/utils"

export function AdminDashboard() {
  const { products, categories, categoryById } = useCatalog()
  const { notify } = useToast()
  const [confirmReset, setConfirmReset] = useState(false)

  const stats = [
    { label: 'Total products', value: products.length },
    { label: 'Published', value: products.filter((p) => p.published).length },
    { label: 'Out of stock', value: products.filter((p) => p.availability === 'out_of_stock').length },
    { label: 'Categories', value: categories.length },
  ]

  const recent = [...products].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5)

  async function handleReset() {
    try {
      await catalogRepository.resetDemoData()
      notify('Demo data restored.')
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Could not reset data.', 'error')
    } finally {
      setConfirmReset(false)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-balance sm:text-3xl">Overview</h1>
          <p className="text-sm text-muted-foreground">A quick look at what customers can see right now.</p>
        </div>
        <a href="#admin/new" className={cn(buttonVariants(), "h-11 gap-2 px-4")}>
          <Plus aria-hidden="true" />
          Add product
        </a>
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
          <a href="#admin/products" className="text-sm font-medium text-primary hover:underline">
            Manage all products
          </a>
        </div>
        {recent.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
            No products yet. Add your first product to get started.
          </p>
        ) : (
          <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
            {recent.map((product) => (
              <li key={product.id}>
                <a
                  href={`#admin/edit/${encodeURIComponent(product.id)}`}
                  className="flex items-center gap-3 p-3 hover:bg-muted/60 sm:gap-4 sm:px-4"
                >
                  <ProductImage src={product.images[0]} alt="" className="size-12 shrink-0 rounded-lg" />
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
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-semibold">Restore demo data</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Discards every change saved in this browser and reloads the original sample catalog.
          </p>
        </div>
        <Button variant="outline" onClick={() => setConfirmReset(true)}>
          <RotateCcw aria-hidden="true" />
          Reset demo data
        </Button>
      </section>

      <ConfirmDialog
        open={confirmReset}
        title="Reset all demo data?"
        description="All products you added, edited or deleted in this browser will be replaced by the original sample catalog."
        confirmLabel="Reset data"
        onConfirm={handleReset}
        onCancel={() => setConfirmReset(false)}
      />
    </div>
  )
}
