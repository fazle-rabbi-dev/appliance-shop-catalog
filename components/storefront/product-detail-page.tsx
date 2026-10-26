import { ArrowRight, MapPin, MessageCircle, Phone } from 'lucide-react'
import Link from 'next/link'
import { AvailabilityBadge } from '@/components/shared/availability-badge'
import { ProductCard } from './product-card'
import { ProductGallery } from './product-gallery'
import { formatTaka } from '@/lib/format'
import { homeSectionHref, productsHref } from '@/lib/routes'
import { shopConfig, whatsappLink } from '@/lib/shop-config'
import type { Category, Product } from '@/lib/types'

export function ProductDetailPage({
  product,
  category,
  related,
}: {
  product: Product
  category?: Category
  related: Product[]
}) {
  const enquiry = `Hello ${shopConfig.name}, is the ${product.name}${product.model ? ` (${product.model})` : ''} available? Listed at ${formatTaka(product.price)}.`

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          {category ? (
            <>
              <li>
                <Link href={productsHref({ category: category.slug })} className="hover:text-foreground">
                  {category.name}
                </Link>
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
        <div className="lg:col-span-7">
          <ProductGallery images={product.images} name={product.name} />
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
            <Link
              href={homeSectionHref('contact')}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <MapPin className="size-4" aria-hidden="true" />
              {shopConfig.address.line1} · See hours and directions
            </Link>
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
              <Link
                href={productsHref({ category: category.slug })}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                View all
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            ) : null}
          </div>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <li key={item.id}>
                <ProductCard product={item} category={category} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
