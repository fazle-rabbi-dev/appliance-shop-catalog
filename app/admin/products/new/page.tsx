import { ProductForm } from '@/components/admin/product-form'
import { catalogRepository } from '@/lib/data/catalog-repository'

export const metadata = {
  title: 'Add product — Admin',
}

export default async function NewProductRoute() {
  const categories = await catalogRepository.listCategories()
  return <ProductForm categories={categories} />
}
