import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ProductDetailPage } from '@/components/storefront/product-detail-page'
import { catalogRepository } from '@/lib/data/catalog-repository'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const product = await catalogRepository.getPublishedProductBySlug(slug)
  if (!product) return { title: 'Product not found — Rahman Electronics' }
  return {
    title: `${product.name} — Rahman Electronics`,
    description: product.description.slice(0, 160),
  }
}

export default async function ProductRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await catalogRepository.getPublishedProductBySlug(slug)
  if (!product) notFound()

  const [categories, published] = await Promise.all([
    catalogRepository.listCategories(),
    catalogRepository.listPublishedProducts(),
  ])

  const category = categories.find((c) => c.id === product.categoryId)
  const related = published.filter((p) => p.categoryId === product.categoryId && p.id !== product.id).slice(0, 4)

  return <ProductDetailPage product={product} category={category} related={related} />
}
