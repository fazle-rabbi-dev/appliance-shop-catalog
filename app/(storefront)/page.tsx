import { HomePage } from '@/components/storefront/home-page'
import { catalogRepository } from '@/lib/data/catalog-repository'

export default async function HomeRoute() {
  const [categories, products] = await Promise.all([
    catalogRepository.listCategories(),
    catalogRepository.listPublishedProducts(),
  ])

  return <HomePage categories={categories} products={products} />
}
