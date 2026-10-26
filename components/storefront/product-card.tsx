import Link from 'next/link'
import { ProductImage } from '@/components/shared/product-image'
import { AvailabilityBadge } from '@/components/shared/availability-badge'
import { formatTaka } from '@/lib/format'
import { productHref } from '@/lib/routes'
import type { Category, Product } from '@/lib/types'

export function ProductCard({ product, category }: { product: Product; category?: Category }) {
  return (
    <Link
      href={productHref(product.slug)}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/40"
    >
      <ProductImage src={product.images[0]} alt={product.name} className="aspect-[4/3] border-b border-border" imgClassName="p-6" />
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <span className="text-xs font-medium text-muted-foreground">{category?.name ?? 'Uncategorised'}</span>
        <span className="font-medium group-hover:text-primary">{product.name}</span>
        <span className="text-xs text-muted-foreground">
          {product.brand}
          {product.model ? ` · ${product.model}` : ''}
        </span>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <span className="text-sm font-semibold tabular-nums">{formatTaka(product.price)}</span>
          <AvailabilityBadge value={product.availability} />
        </div>
      </div>
    </Link>
  )
}
