import { AdminProducts } from '@/components/admin/admin-products'
import { catalogRepository } from '@/lib/data/catalog-repository'

export const metadata = {
  title: 'পণ্য — অ্যাডমিন',
}

export default async function AdminProductsRoute() {
  const [products, categories] = await Promise.all([
    catalogRepository.listProducts(),
    catalogRepository.listCategories(),
  ])

  return <AdminProducts products={products} categories={categories} />
}
