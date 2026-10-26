'use client'

import { PackageSearch, Search, SlidersHorizontal, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { ProductCard } from './product-card'
import { availabilityLabel, availabilityOptions } from '@/lib/format'
import { productsHref } from '@/lib/routes'
import type { Availability, Category, Product } from '@/lib/types'
import { cn } from '@/lib/utils'

type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'newest'
type AvailabilityFilter = 'all' | 'available' | Availability

const sortLabels: Record<SortKey, string> = {
  featured: 'Recommended',
  'price-asc': 'Price: low to high',
  'price-desc': 'Price: high to low',
  newest: 'Newest first',
}

export function ProductsPage({
  categories,
  products,
  categorySlug,
  query,
}: {
  categories: Category[]
  products: Product[]
  categorySlug?: string
  query?: string
}) {
  const router = useRouter()
  const [sort, setSort] = useState<SortKey>('featured')
  const [availability, setAvailability] = useState<AvailabilityFilter>('all')

  const categoryById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories])
  const activeCategory = categories.find((c) => c.slug === categorySlug)
  const q = (query ?? '').trim().toLowerCase()
  const hasActiveFilters = Boolean(categorySlug || q || availability !== 'all' || sort !== 'featured')

  function resetFilters() {
    setAvailability('all')
    setSort('featured')
    router.replace(productsHref())
  }

  const results = useMemo(() => {
    const filtered = products.filter((p) => {
      if (activeCategory && p.categoryId !== activeCategory.id) return false
      if (availability === 'available' && p.availability === 'out_of_stock') return false
      if (availability !== 'all' && availability !== 'available' && p.availability !== availability) return false
      if (!q) return true
      const haystack = `${p.name} ${p.brand} ${p.model} ${categoryById.get(p.categoryId)?.name ?? ''}`.toLowerCase()
      return q.split(/\s+/).every((term) => haystack.includes(term))
    })
    const sorted = [...filtered]
    if (sort === 'price-asc') sorted.sort((a, b) => a.price - b.price)
    else if (sort === 'price-desc') sorted.sort((a, b) => b.price - a.price)
    else if (sort === 'newest') sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    else sorted.sort((a, b) => Number(b.featured) - Number(a.featured) || a.name.localeCompare(b.name))
    return sorted
  }, [products, activeCategory, availability, q, sort, categoryById])

  const heading = activeCategory?.name ?? 'All products'

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = String(new FormData(event.currentTarget).get('q') ?? '').trim()
    router.push(productsHref({ category: categorySlug, q: value || undefined }))
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted-foreground">
        <ol className="flex items-center gap-1.5">
          <li>
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-foreground">
            {heading}
          </li>
        </ol>
      </nav>

      <div className="mb-6 flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{heading}</h1>
        {activeCategory ? <p className="text-base text-muted-foreground">{activeCategory.description}</p> : null}
      </div>

      <div className="mb-6 flex flex-col gap-4">
        <form role="search" onSubmit={handleSearch} key={query ?? ''} className="relative md:max-w-md">
          <label htmlFor="catalog-search" className="sr-only">
            Search in {heading}
          </label>
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            id="catalog-search"
            name="q"
            type="search"
            defaultValue={query ?? ''}
            placeholder="Search by name, brand or model"
            className="h-11 w-full rounded-lg border border-input bg-card pr-24 pl-9 text-base placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/20 sm:text-sm"
          />
          <button
            type="submit"
            className="absolute top-1/2 right-1.5 h-8 -translate-y-1/2 rounded-md bg-foreground px-3 text-sm font-medium text-background hover:opacity-90"
          >
            Search
          </button>
        </form>

        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <ul className="flex w-max gap-2" aria-label="Filter by category">
            <li>
              <Link
                href={productsHref({ q: query })}
                aria-current={!activeCategory ? 'true' : undefined}
                className={cn(
                  'inline-flex h-9 items-center rounded-full border px-4 text-sm font-medium transition-colors',
                  !activeCategory ? 'border-foreground bg-foreground text-background' : 'border-border bg-card hover:bg-muted',
                )}
              >
                All
              </Link>
            </li>
            {categories.map((c) => {
              const active = activeCategory?.id === c.id
              return (
                <li key={c.id}>
                  <Link
                    href={productsHref({ category: c.slug, q: query })}
                    aria-current={active ? 'true' : undefined}
                    className={cn(
                      'inline-flex h-9 items-center rounded-full border px-4 text-sm font-medium whitespace-nowrap transition-colors',
                      active ? 'border-foreground bg-foreground text-background' : 'border-border bg-card hover:bg-muted',
                    )}
                  >
                    {c.name}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {results.length} {results.length === 1 ? 'product' : 'products'}
            {q ? (
              <>
                {' '}
                for <span className="font-medium text-foreground">&ldquo;{query}&rdquo;</span>
              </>
            ) : null}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="size-4" aria-hidden="true" />
                Reset filters
              </button>
            ) : null}
            <label htmlFor="availability" className="sr-only">
              Filter by availability
            </label>
            <select
              id="availability"
              value={availability}
              onChange={(e) => setAvailability(e.target.value as AvailabilityFilter)}
              className="h-9 rounded-lg border border-input bg-card px-2.5 text-sm"
            >
              <option value="all">Any availability</option>
              <option value="available">Available now</option>
              {availabilityOptions.map((a) => (
                <option key={a} value={a}>
                  {availabilityLabel[a]}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="size-4 text-muted-foreground" aria-hidden="true" />
              <label htmlFor="sort" className="sr-only">
                Sort products
              </label>
              <select
                id="sort"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="h-9 rounded-lg border border-input bg-card px-2.5 text-sm"
              >
                {(Object.keys(sortLabels) as SortKey[]).map((key) => (
                  <option key={key} value={key}>
                    {sortLabels[key]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {categorySlug && !activeCategory ? (
        <EmptyState
          title="Category not found"
          body="This category may have been renamed or removed."
          actionHref={productsHref()}
          actionLabel="See all products"
        />
      ) : results.length === 0 ? (
        <EmptyState
          title="No products match"
          body={
            q
              ? 'Try a different word, check the spelling, or search across all categories.'
              : 'Nothing is listed here yet. Call the shop to ask about upcoming stock.'
          }
          actionHref={productsHref()}
          actionLabel="Clear search and filters"
        />
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} category={categoryById.get(product.categoryId)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function EmptyState({
  title,
  body,
  actionHref,
  actionLabel,
}: {
  title: string
  body: string
  actionHref: string
  actionLabel: string
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-6 py-16 text-center">
      <PackageSearch className="size-8 text-muted-foreground" aria-hidden="true" />
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">{body}</p>
      <Link
        href={actionHref}
        className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted"
      >
        <X className="size-4" aria-hidden="true" />
        {actionLabel}
      </Link>
    </div>
  )
}
