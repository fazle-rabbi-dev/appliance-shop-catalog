import { notFound } from 'next/navigation'
import { CategoryForm } from '@/components/admin/category-form'
import { catalogRepository } from '@/lib/data/catalog-repository'

export const metadata = {
  title: 'ক্যাটাগরি সম্পাদনা — অ্যাডমিন',
}

export default async function EditCategoryRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const category = await catalogRepository.getCategoryById(id)

  if (!category) notFound()

  return <CategoryForm key={category.id} category={category} />
}
