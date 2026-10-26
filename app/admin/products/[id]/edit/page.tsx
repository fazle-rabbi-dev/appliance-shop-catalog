import { notFound } from 'next/navigation'
import { ProductForm } from '@/components/admin/product-form'
import { catalogRepository } from '@/lib/data/catalog-repository'

export const metadata = {
  title: 'পণ্য সম্পাদনা — অ্যাডমিন',
}

export default async function EditProductRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [product, categories] = await Promise.all([
    catalogRepository.getProductById(id),
    catalogRepository.listCategories(),
  ])

  if (!product) notFound()

  return <ProductForm key={product.id} product={product} categories={categories} />
}
