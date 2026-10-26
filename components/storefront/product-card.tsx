import { ArrowRight, Star } from 'lucide-react'
import { AvailabilityBadge } from '@/components/shared/availability-badge'
import { ProductImage } from '@/components/shared/product-image'
import { formatTaka } from '@/lib/format'
import type { Category, Product } from '@/lib/types'

export function ProductCard({ product, category }: { product: Product; category?: Category }) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xs transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-md focus-within:ring-3 focus-within:ring-ring/30 motion-reduce:hover:translate-y-0">
      <div className="relative">
        <ProductImage
          src={product.images[0]}
          alt={product.name}
          className="aspect-[4/3] border-b border-border"
          imgClassName="p-4 transition-transform duration-200 group-hover:scale-[1.03] motion-reduce:group-hover:scale-100"
        />
        {product.featured ? (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-card/95 px-2 py-1 text-[11px] font-semibold text-foreground shadow-xs">
            <Star className="size-3 fill-current text-primary" aria-hidden="true" />
            Featured
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="truncate text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {product.brand}
          {category ? <span className="font-normal normal-case"> · {category.name}</span> : null}
        </span>
        <h3 className="line-clamp-2 text-base leading-snug font-semibold text-pretty">
          <a href={`#product/${product.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
            {product.name}
          </a>
        </h3>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
          <p className="text-lg font-semibold tabular-nums">{formatTaka(product.price)}</p>
          <AvailabilityBadge value={product.availability} />
        </div>
        <span className="inline-flex items-center gap-1 text-sm font-medium text-primary" aria-hidden="true">
          View details
          <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
        </span>
      </div>
    </article>
  )
}
