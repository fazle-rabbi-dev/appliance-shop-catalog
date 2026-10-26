import { AdminCategories } from '@/components/admin/admin-categories'
import { catalogRepository } from '@/lib/data/catalog-repository'

export const metadata = {
  title: 'ক্যাটাগরি — অ্যাডমিন',
}

export default async function AdminCategoriesRoute() {
  const [categories, products] = await Promise.all([
    catalogRepository.listCategories(),
    catalogRepository.listProducts(),
  ])

  const counts: Record<string, number> = {}
  for (const product of products) {
    counts[product.categoryId] = (counts[product.categoryId] ?? 0) + 1
  }

  return <AdminCategories categories={categories} counts={counts} />
}
