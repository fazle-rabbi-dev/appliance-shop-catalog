import { ProductsPage } from '@/components/storefront/products-page'
import { catalogRepository } from '@/lib/data/catalog-repository'

export const metadata = {
  title: 'পণ্য — রহমান ইলেকট্রনিকস',
}

export default async function ProductsRoute({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>
}) {
  const { category, q } = await searchParams
  const [categories, products] = await Promise.all([
    catalogRepository.listCategories(),
    catalogRepository.listPublishedProducts(),
  ])

  return <ProductsPage categories={categories} products={products} categorySlug={category} query={q} />
}
