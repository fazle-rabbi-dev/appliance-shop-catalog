'use client'

import { ArrowRight } from 'lucide-react'
import { useMemo } from 'react'
import { useCatalog } from '@/hooks/use-catalog'
import { CategoryGrid } from './category-grid'
import { HeroSection } from './hero-section'
import { ProductCard } from './product-card'
import { AboutSection, ContactSection } from './visit-section'

export function HomePage() {
  const { categories, publishedProducts, categoryById } = useCatalog()

  const counts = useMemo(() => {
    const map = new Map<string, number>()
    publishedProducts.forEach((p) => map.set(p.categoryId, (map.get(p.categoryId) ?? 0) + 1))
    return map
  }, [publishedProducts])

  const featured = useMemo(() => publishedProducts.filter((p) => p.featured).slice(0, 8), [publishedProducts])

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
          <a href="#products" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
            View all products
            <ArrowRight className="size-4" aria-hidden="true" />
          </a>
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
            No featured products right now. <a href="#products" className="font-medium text-primary hover:underline">Browse the full catalog</a>.
          </p>
        )}
      </section>

      <AboutSection />
      <ContactSection />
    </>
  )
}
