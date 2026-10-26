'use client'

import { ArrowRight, MapPin, MessageCircle, Phone } from 'lucide-react'
import { useMemo, useState } from 'react'
import { AvailabilityBadge } from '@/components/shared/availability-badge'
import { ProductImage } from '@/components/shared/product-image'
import { useCatalog } from '@/hooks/use-catalog'
import { productsHref } from '@/hooks/use-hash-route'
import { formatTaka } from '@/lib/format'
import { shopConfig, whatsappLink } from '@/lib/shop-config'
import { cn } from '@/lib/utils'
import { ProductCard } from './product-card'

export function ProductDetailPage({ slug }: { slug: string }) {
  const { publishedProducts, categoryById } = useCatalog()
  const product = publishedProducts.find((p) => p.slug === slug)
  const [activeIndex, setActiveIndex] = useState(0)

  const related = useMemo(
    () =>
      product
        ? publishedProducts.filter((p) => p.categoryId === product.categoryId && p.id !== product.id).slice(0, 4)
        : [],
    [product, publishedProducts],
  )

  if (!product) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-24 text-center">
        <h1 className="text-2xl font-semibold">Product not found</h1>
        <p className="text-base leading-relaxed text-muted-foreground">
          This product may no longer be listed. Browse the catalog or call the shop to ask about it.
        </p>
        <a href="#products" className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          Browse products
        </a>
      </div>
    )
  }

  const category = categoryById.get(product.categoryId)
  const safeIndex = Math.min(activeIndex, product.images.length - 1)
  const enquiry = `Hello ${shopConfig.name}, is the ${product.name}${product.model ? ` (${product.model})` : ''} available? Listed at ${formatTaka(product.price)}.`

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <a href="#" className="hover:text-foreground">
              Home
            </a>
          </li>
          <li aria-hidden="true">/</li>
          {category ? (
            <>
              <li>
                <a href={productsHref({ category: category.slug })} className="hover:text-foreground">
                  {category.name}
                </a>
              </li>
              <li aria-hidden="true">/</li>
            </>
          ) : null}
          <li aria-current="page" className="max-w-[16rem] truncate text-foreground">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
        <div className="flex flex-col gap-3 lg:col-span-7">
          <ProductImage
            key={product.images[safeIndex]}
            src={product.images[safeIndex]}
            alt={`${product.name}, image ${safeIndex + 1} of ${product.images.length}`}
            className="aspect-square rounded-2xl border border-border sm:aspect-[4/3]"
            imgClassName="p-6 sm:p-10"
            eager
          />
          {product.images.length > 1 ? (
            <ul className="flex gap-3" aria-label="Product images">
              {product.images.map((src, index) => (
                <li key={`${src}-${index}`}>
                  <button
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    aria-pressed={index === safeIndex}
                    className={cn(
                      'block overflow-hidden rounded-lg border-2 transition-colors',
                      index === safeIndex ? 'border-primary' : 'border-border hover:border-muted-foreground/40',
                    )}
                  >
                    <ProductImage src={src} alt="" className="size-20" imgClassName="p-1.5" />
                    <span className="sr-only">Show image {index + 1}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="flex flex-col gap-6 lg:col-span-5">
          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
              {product.brand}
              {product.model ? <span className="normal-case"> · Model {product.model}</span> : null}
            </p>
            <h1 className="text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-4xl">{product.name}</h1>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-3xl font-semibold tabular-nums">{formatTaka(product.price)}</p>
              <AvailabilityBadge value={product.availability} />
            </div>
            <p className="text-xs text-muted-foreground">Reference price. Confirm the final price at the shop.</p>
          </div>

          <p className="text-base leading-relaxed text-pretty text-muted-foreground">{product.description}</p>

          <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:p-5">
            <p className="text-sm font-semibold">
              {product.availability === 'out_of_stock'
                ? 'Currently out of stock — ask us when it will be back.'
                : 'Interested? Contact the shop to reserve or confirm stock.'}
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              <a
                href={shopConfig.phoneHref}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <Phone className="size-4" aria-hidden="true" />
                Call shop
              </a>
              <a
                href={whatsappLink(enquiry)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 text-base font-medium transition-colors hover:bg-muted"
              >
                <MessageCircle className="size-4" aria-hidden="true" />
                Ask on WhatsApp
              </a>
            </div>
            <a href="#contact" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
              <MapPin className="size-4" aria-hidden="true" />
              {shopConfig.address.line1} · See hours and directions
            </a>
          </div>

          {product.specs.length > 0 ? (
            <section aria-labelledby="specs-title" className="flex flex-col gap-3">
              <h2 id="specs-title" className="text-lg font-semibold">
                Specifications
              </h2>
              <dl className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
                {product.specs.map((spec) => (
                  <div key={spec.label} className="grid grid-cols-5 gap-4 px-4 py-3 text-sm">
                    <dt className="col-span-2 text-muted-foreground">{spec.label}</dt>
                    <dd className="col-span-3 font-medium">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}
        </div>
      </div>

      {related.length > 0 ? (
        <section aria-labelledby="related-title" className="mt-16 border-t border-border pt-10">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <h2 id="related-title" className="text-xl font-semibold tracking-tight sm:text-2xl">
              More {category?.name.toLowerCase() ?? 'products'}
            </h2>
            {category ? (
              <a href={productsHref({ category: category.slug })} className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
                View all
                <ArrowRight className="size-4" aria-hidden="true" />
              </a>
            ) : null}
          </div>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <li key={p.id}>
                <ProductCard product={p} category={category} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
