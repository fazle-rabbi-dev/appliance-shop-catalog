import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { CategoryGrid } from './category-grid'
import { HeroSection } from './hero-section'
import { ProductCard } from './product-card'
import { AboutSection, ContactSection } from './visit-section'
import { productsHref } from '@/lib/routes'
import type { Category, Product } from '@/lib/types'

export function HomePage({ categories, products }: { categories: Category[]; products: Product[] }) {
  const categoryById = new Map(categories.map((category) => [category.id, category]))

  const counts = new Map<string, number>()
  for (const product of products) {
    counts.set(product.categoryId, (counts.get(product.categoryId) ?? 0) + 1)
  }

  const featured = products.filter((product) => product.featured).slice(0, 8)

  return (
    <>
      <HeroSection />
      <CategoryGrid categories={categories} counts={counts} />

      <section id="featured" aria-labelledby="featured-title" className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h2 id="featured-title" className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Popular in the shop
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground">Models our customers ask about most.</p>
          </div>
          <Link href={productsHref()} className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
            View all products
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
        {featured.length > 0 ? (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} category={categoryById.get(product.categoryId)} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No featured products right now.{' '}
            <Link href={productsHref()} className="font-medium text-primary hover:underline">
              Browse the full catalog
            </Link>
            .
          </p>
        )}
      </section>

      <AboutSection />
      <ContactSection />
    </>
  )
}
