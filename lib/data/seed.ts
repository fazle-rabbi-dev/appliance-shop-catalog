import { seedCategories, seedProducts } from '@/lib/mock-data'
import { CategoryModel, ProductModel, type CategoryDoc, type ProductDoc } from './models'
import { connectToDatabase } from './mongoose'

/**
 * Replaces both collections with the mock seed. Idempotent: safe to re-run.
 * Used by `bun run seed` and by the admin "Reset demo data" action.
 */
export async function seedDatabase() {
  await connectToDatabase()

  const categories: CategoryDoc[] = seedCategories.map((category, index) => ({
    _id: category.id,
    name: category.name,
    slug: category.slug,
    icon: category.icon,
    description: category.description,
    sortOrder: index,
  }))

  const products: ProductDoc[] = seedProducts.map((product) => ({
    _id: product.id,
    name: product.name,
    slug: product.slug,
    categoryId: product.categoryId,
    brand: product.brand,
    model: product.model,
    price: product.price,
    description: product.description,
    images: product.images,
    specs: product.specs,
    availability: product.availability,
    published: product.published,
    featured: product.featured,
    createdAt: new Date(product.createdAt),
    updatedAt: new Date(),
  }))

  await Promise.all([CategoryModel.deleteMany({}), ProductModel.deleteMany({})])
  await CategoryModel.insertMany(categories)
  await ProductModel.insertMany(products)

  // Unique slug indexes are declared on the schemas; build them now.
  await Promise.all([CategoryModel.syncIndexes(), ProductModel.syncIndexes()])

  return { categories: categories.length, products: products.length }
}
