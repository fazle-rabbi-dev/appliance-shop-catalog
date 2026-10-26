import { cacheLife, cacheTag } from 'next/cache'
import { CATALOG_TAG } from '@/lib/cache-tags'
import { connectToDatabase } from '@/lib/data/mongoose'
import { CategoryModel, ProductModel, type CategoryDoc, type ProductDoc } from '@/lib/data/models'
import { seedDatabase } from '@/lib/data/seed'
import type { Category, CategoryInput, Product, ProductImage, ProductInput } from '@/lib/types'

/**
 * THE DATA BOUNDARY.
 *
 * Everything above this line (pages, actions, components) talks to this
 * interface only. The Supabase migration would be a second object implementing
 * `CatalogRepository`, with the export below swapped.
 */
export interface CatalogRepository {
  listCategories(): Promise<Category[]>
  getCategoryBySlug(slug: string): Promise<Category | null>
  getCategoryById(id: string): Promise<Category | null>
  createCategory(input: CategoryInput): Promise<Category>
  updateCategory(id: string, input: CategoryInput): Promise<Category>
  deleteCategory(id: string): Promise<void>

  listProducts(): Promise<Product[]>
  listPublishedProducts(): Promise<Product[]>
  getProductById(id: string): Promise<Product | null>
  getPublishedProductBySlug(slug: string): Promise<Product | null>

  createProduct(input: ProductInput): Promise<Product>
  updateProduct(id: string, input: ProductInput): Promise<Product>
  patchProduct(
    id: string,
    patch: Partial<Pick<Product, 'published' | 'featured' | 'availability'>>,
  ): Promise<Product>
  deleteProduct(id: string): Promise<void>

  /** Prototype helper: replaces the catalog with the seed data. */
  resetDemoData(): Promise<void>
}

type LeanCategory = CategoryDoc
type LeanProduct = ProductDoc

function toCategory(doc: LeanCategory): Category {
  return {
    id: String(doc._id),
    name: doc.name,
    slug: doc.slug,
    icon: doc.icon,
    description: doc.description,
  }
}

function toProduct(doc: LeanProduct): Product {
  return {
    id: String(doc._id),
    name: doc.name,
    slug: doc.slug,
    categoryId: doc.categoryId,
    brand: doc.brand,
    model: doc.model,
    price: doc.price,
    description: doc.description,
    images: (doc.images ?? []).map((image) => ({
      url: image.url,
      publicId: image.publicId ?? null,
    })),
    specs: doc.specs ?? [],
    availability: doc.availability,
    published: doc.published,
    featured: doc.featured,
    createdAt: new Date(doc.createdAt).toISOString(),
  }
}

function normaliseImages(images: ProductImage[]): ProductImage[] {
  return images
    .map((image) => ({ url: image.url.trim(), publicId: image.publicId?.trim() || null }))
    .filter((image) => image.url)
}

function isDuplicateKey(error: unknown) {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 11000
}

async function assertUniqueCategorySlug(slug: string, ignoreId?: string) {
  const query: Record<string, unknown> = { slug }
  if (ignoreId) query._id = { $ne: ignoreId }

  await connectToDatabase()
  if (await CategoryModel.exists(query)) {
    throw new Error('এই স্লাগে আরেকটি ক্যাটাগরি আছে।')
  }
}

async function assertUniqueSlug(slug: string, ignoreId?: string) {
  const query: Record<string, unknown> = { slug }
  if (ignoreId) query._id = { $ne: ignoreId }

  await connectToDatabase()
  if (await ProductModel.exists(query)) {
    throw new Error('এই URL স্লাগে আরেকটি পণ্য আছে।')
  }
}

const mongoCatalogRepository: CatalogRepository = {
  async listCategories() {
    'use cache'
    cacheLife('hours')
    cacheTag(CATALOG_TAG)
    await connectToDatabase()
    const docs = await CategoryModel.find().sort({ sortOrder: 1 }).lean<LeanCategory[]>()
    return docs.map(toCategory)
  },

  async getCategoryBySlug(slug) {
    'use cache'
    cacheLife('hours')
    cacheTag(CATALOG_TAG)
    await connectToDatabase()
    const doc = await CategoryModel.findOne({ slug }).lean<LeanCategory | null>()
    return doc ? toCategory(doc) : null
  },

  async getCategoryById(id) {
    'use cache'
    cacheLife('hours')
    cacheTag(CATALOG_TAG)
    await connectToDatabase()
    const doc = await CategoryModel.findById(id).lean<LeanCategory | null>()
    return doc ? toCategory(doc) : null
  },

  async createCategory(input) {
    await assertUniqueCategorySlug(input.slug)
    try {
      const created = await CategoryModel.create(input)
      return toCategory(created.toObject<LeanCategory>())
    } catch (error) {
      if (isDuplicateKey(error)) throw new Error('এই স্লাগে আরেকটি ক্যাটাগরি আছে।')
      throw error
    }
  },

  async updateCategory(id, input) {
    await assertUniqueCategorySlug(input.slug, id)
    await connectToDatabase()
    try {
      const updated = await CategoryModel.findByIdAndUpdate(
        id,
        { $set: { ...input, updatedAt: new Date() } },
        { returnDocument: 'after', runValidators: true },
      ).lean<LeanCategory | null>()

      if (!updated) throw new Error('এই ক্যাটাগরিটি আর নেই।')
      return toCategory(updated)
    } catch (error) {
      if (isDuplicateKey(error)) throw new Error('এই স্লাগে আরেকটি ক্যাটাগরি আছে।')
      throw error
    }
  },

  async deleteCategory(id) {
    await connectToDatabase()
    const inUse = await ProductModel.countDocuments({ categoryId: id })
    if (inUse > 0) {
      throw new Error(
        `এই ক্যাটাগরিতে এখনো ${inUse}টি পণ্য আছে। আগে সেগুলো সরান বা মুছুন।`,
      )
    }

    const deleted = await CategoryModel.findByIdAndDelete(id).lean<LeanCategory | null>()
    if (!deleted) throw new Error('এই ক্যাটাগরিটি আর নেই।')
  },

  async listProducts() {
    'use cache'
    cacheLife('hours')
    cacheTag(CATALOG_TAG)
    await connectToDatabase()
    const docs = await ProductModel.find().sort({ createdAt: -1 }).lean<LeanProduct[]>()
    return docs.map(toProduct)
  },

  async listPublishedProducts() {
    'use cache'
    cacheLife('hours')
    cacheTag(CATALOG_TAG)
    await connectToDatabase()
    const docs = await ProductModel.find({ published: true })
      .sort({ createdAt: -1 })
      .lean<LeanProduct[]>()
    return docs.map(toProduct)
  },

  async getProductById(id) {
    'use cache'
    cacheLife('hours')
    cacheTag(CATALOG_TAG)
    await connectToDatabase()
    const doc = await ProductModel.findById(id).lean<LeanProduct | null>()
    return doc ? toProduct(doc) : null
  },

  async getPublishedProductBySlug(slug) {
    'use cache'
    cacheLife('hours')
    cacheTag(CATALOG_TAG)
    await connectToDatabase()
    const doc = await ProductModel.findOne({ slug, published: true }).lean<LeanProduct | null>()
    return doc ? toProduct(doc) : null
  },

  async createProduct(input) {
    await assertUniqueSlug(input.slug)
    try {
      const created = await ProductModel.create({
        ...input,
        images: normaliseImages(input.images),
      })
      return toProduct(created.toObject<LeanProduct>())
    } catch (error) {
      if (isDuplicateKey(error)) throw new Error('এই URL স্লাগে আরেকটি পণ্য আছে।')
      throw error
    }
  },

  async updateProduct(id, input) {
    await assertUniqueSlug(input.slug, id)
    await connectToDatabase()

    try {
      const updated = await ProductModel.findByIdAndUpdate(
        id,
        {
          $set: {
            ...input,
            images: normaliseImages(input.images),
            updatedAt: new Date(),
          },
        },
        { returnDocument: 'after', runValidators: true },
      ).lean<LeanProduct | null>()

      if (!updated) throw new Error('এই পণ্যটি আর নেই।')
      return toProduct(updated)
    } catch (error) {
      if (isDuplicateKey(error)) throw new Error('এই URL স্লাগে আরেকটি পণ্য আছে।')
      throw error
    }
  },

  async patchProduct(id, patch) {
    await connectToDatabase()
    const updated = await ProductModel.findByIdAndUpdate(
      id,
      { $set: { ...patch, updatedAt: new Date() } },
      { returnDocument: 'after', runValidators: true },
    ).lean<LeanProduct | null>()

    if (!updated) throw new Error('এই পণ্যটি আর নেই।')
    return toProduct(updated)
  },

  async deleteProduct(id) {
    await connectToDatabase()
    const deleted = await ProductModel.findByIdAndDelete(id).lean<LeanProduct | null>()
    if (!deleted) throw new Error('এই পণ্যটি আর নেই।')
  },

  async resetDemoData() {
    await seedDatabase()
  },
}

export const catalogRepository: CatalogRepository = mongoCatalogRepository
