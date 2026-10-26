'use client'

import { Pencil, Plus, Search, Star, Trash2, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState, useTransition } from 'react'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { ProductImage } from '@/components/shared/product-image'
import { useToast } from '@/components/shared/toast-provider'
import { Button, buttonVariants } from '@/components/ui/button'
import { deleteProductAction, patchProductAction, type ActionResult } from '@/lib/actions/catalog'
import { availabilityLabel, availabilityOptions, formatTaka } from '@/lib/format'
import { adminRoutes } from '@/lib/routes'
import type { Availability, Category, Product } from '@/lib/types'
import { cn } from '@/lib/utils'

type StatusFilter = 'all' | 'published' | 'draft' | 'featured' | 'out_of_stock'

export function AdminProducts({ products, categories }: { products: Product[]; categories: Category[] }) {
  const { notify } = useToast()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [categoryId, setCategoryId] = useState('all')
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null)

  const categoryById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories])
  const q = query.trim().toLowerCase()

  const filtered = useMemo(
    () =>
      products.filter((p) => {
        if (categoryId !== 'all' && p.categoryId !== categoryId) return false
        if (status === 'published' && !p.published) return false
        if (status === 'draft' && p.published) return false
        if (status === 'featured' && !p.featured) return false
        if (status === 'out_of_stock' && p.availability !== 'out_of_stock') return false
        if (!q) return true
        return [p.name, p.brand, p.model, p.slug].some((v) => v.toLowerCase().includes(q))
      }),
    [products, categoryId, status, q],
  )

  const hasFilters = Boolean(q) || status !== 'all' || categoryId !== 'all'

  function run(action: () => Promise<ActionResult>, success: string) {
    startTransition(async () => {
      const result = await action()
      notify(result.ok ? success : result.error, result.ok ? 'success' : 'error')
      if (result.ok) {
        setPendingDelete(null)
        router.refresh()
      }
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold sm:text-3xl">পণ্য</h1>
          <p className="text-sm text-muted-foreground">
            মোট {products.length}টি · পরিবর্তন সাথে সাথে ওয়েবসাইটে দেখা যাবে।
          </p>
        </div>
        <Link href={adminRoutes.newProduct} className={cn(buttonVariants(), 'h-11 gap-2 px-4')}>
          <Plus aria-hidden="true" />
          পণ্য যোগ করুন
        </Link>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative flex-1 sm:min-w-64">
          <label htmlFor="admin-search" className="sr-only">
            পণ্য খুঁজুন
          </label>
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            id="admin-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="নাম, ব্র্যান্ড, মডেল খুঁজুন…"
            className="h-11 w-full rounded-lg border border-input bg-card pr-3 pl-9 text-base sm:text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <label htmlFor="admin-status" className="sr-only">
            স্ট্যাটাস অনুযায়ী ফিল্টার
          </label>
          <select
            id="admin-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusFilter)}
            className="h-11 rounded-lg border border-input bg-card px-2.5 text-sm"
          >
            <option value="all">সব স্ট্যাটাস</option>
            <option value="published">প্রকাশিত</option>
            <option value="draft">খসড়া</option>
            <option value="featured">নির্বাচিত</option>
            <option value="out_of_stock">স্টক নেই</option>
          </select>
          <label htmlFor="admin-category" className="sr-only">
            ক্যাটাগরি অনুযায়ী ফিল্টার
          </label>
          <select
            id="admin-category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="h-11 rounded-lg border border-input bg-card px-2.5 text-sm"
          >
            <option value="all">সব ক্যাটাগরি</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        {hasFilters ? (
          <Button
            variant="ghost"
            onClick={() => {
              setQuery('')
              setStatus('all')
              setCategoryId('all')
            }}
          >
            <X aria-hidden="true" />
            রিসেট
          </Button>
        ) : null}
      </div>

      <p className="sr-only" aria-live="polite">
        {filtered.length}টি পণ্য দেখানো হচ্ছে
      </p>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card p-10 text-center">
          <p className="font-medium">এই ফিল্টারে কোনো পণ্য মেলেনি।</p>
          <p className="text-sm text-muted-foreground">অন্য কিছু খুঁজুন বা ফিল্টার রিসেট করুন।</p>
        </div>
      ) : (
        <ul className="flex flex-col overflow-hidden rounded-xl border border-border bg-card" aria-busy={isPending}>
          <li
            aria-hidden="true"
            className="hidden grid-cols-[3.5rem_minmax(0,1fr)_8rem_9rem_7rem_7.5rem] items-center gap-4 border-b border-border bg-muted/60 px-4 py-2.5 text-xs font-medium tracking-wider text-muted-foreground uppercase lg:grid"
          >
            <span />
            <span>পণ্য</span>
            <span className="text-right">দাম</span>
            <span>স্টক</span>
            <span>স্ট্যাটাস</span>
            <span className="text-right">কাজ</span>
          </li>
          {filtered.map((product) => (
            <li
              key={product.id}
              className="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-x-3 gap-y-3 border-b border-border p-3 last:border-b-0 sm:p-4 lg:grid-cols-[3.5rem_minmax(0,1fr)_8rem_9rem_7rem_7.5rem] lg:items-center lg:gap-4"
            >
              <ProductImage src={product.images[0]?.url} alt="" className="size-14 rounded-lg" />
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="truncate font-medium">{product.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {categoryById.get(product.categoryId)?.name ?? 'ক্যাটাগরি নেই'} · {product.brand}
                  {product.model ? ` ${product.model}` : ''}
                </span>
                <span className="text-sm font-semibold tabular-nums lg:hidden">{formatTaka(product.price)}</span>
              </div>

              <span className="hidden text-right text-sm font-semibold tabular-nums lg:block">
                {formatTaka(product.price)}
              </span>

              <div className="col-span-2 flex flex-wrap items-center gap-2 lg:col-span-1">
                <label htmlFor={`avail-${product.id}`} className="sr-only">
                  {product.name} এর স্টক
                </label>
                <select
                  id={`avail-${product.id}`}
                  value={product.availability}
                  disabled={isPending}
                  onChange={(e) =>
                    run(
                      () => patchProductAction(product.id, { availability: e.target.value as Availability }),
                      `${product.name} — ${availabilityLabel[e.target.value as Availability]}।`,
                    )
                  }
                  className={cn(
                    'h-10 w-full rounded-lg border px-2 text-sm font-medium sm:w-auto lg:w-full',
                    product.availability === 'in_stock' && 'border-success/30 bg-success-soft text-success',
                    product.availability === 'low_stock' && 'border-warning/30 bg-warning-soft text-warning',
                    product.availability === 'out_of_stock' && 'border-border bg-muted text-muted-foreground',
                  )}
                >
                  {availabilityOptions.map((a) => (
                    <option key={a} value={a}>
                      {availabilityLabel[a]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-2 flex items-center gap-2 lg:col-span-1">
                <button
                  type="button"
                  role="switch"
                  aria-checked={product.published}
                  aria-label={`প্রকাশিত: ${product.name}`}
                  disabled={isPending}
                  onClick={() =>
                    run(
                      () => patchProductAction(product.id, { published: !product.published }),
                      product.published ? `${product.name} খসড়ায় সরানো হয়েছে।` : `${product.name} এখন প্রকাশিত।`,
                    )
                  }
                  className={cn(
                    'inline-flex h-10 items-center gap-2 rounded-full border px-3 text-xs font-semibold transition-colors',
                    product.published
                      ? 'border-primary/30 bg-primary/10 text-primary'
                      : 'border-border bg-muted text-muted-foreground',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn('size-2 rounded-full', product.published ? 'bg-primary' : 'bg-muted-foreground/50')}
                  />
                  {product.published ? 'প্রকাশিত' : 'খসড়া'}
                </button>
              </div>

              <div className="col-span-2 flex items-center justify-end gap-1 border-t border-border pt-3 lg:col-span-1 lg:border-t-0 lg:pt-0">
                <button
                  type="button"
                  aria-pressed={product.featured}
                  disabled={isPending}
                  onClick={() =>
                    run(
                      () => patchProductAction(product.id, { featured: !product.featured }),
                      product.featured ? `${product.name} নির্বাচিত তালিকা থেকে সরানো হয়েছে।` : `${product.name} এখন নির্বাচিত।`,
                    )
                  }
                  className="inline-flex size-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <Star className={cn('size-4', product.featured && 'fill-warning text-warning')} aria-hidden="true" />
                  <span className="sr-only">
                    {product.featured ? 'নির্বাচিত থেকে সরান' : 'নির্বাচিত হিসেবে চিহ্নিত করুন'}: {product.name}
                  </span>
                </button>
                <Link
                  href={adminRoutes.editProduct(product.id)}
                  className="inline-flex size-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <Pencil className="size-4" aria-hidden="true" />
                  <span className="sr-only">{product.name} সম্পাদনা করুন</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setPendingDelete(product)}
                  className="inline-flex size-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                  <span className="sr-only">{product.name} মুছুন</span>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="এই পণ্যটি মুছবেন?"
        description={
          pendingDelete
            ? `“${pendingDelete.name}” ক্যাটালগ ও ওয়েবসাইট থেকে মুছে যাবে। এটি ফিরিয়ে আনা যাবে না।`
            : ''
        }
        confirmLabel="পণ্য মুছুন"
        pending={isPending}
        onConfirm={() => {
          if (!pendingDelete) return
          run(() => deleteProductAction(pendingDelete.id), `“${pendingDelete.name}” মুছে ফেলা হয়েছে।`)
        }}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  )
}
