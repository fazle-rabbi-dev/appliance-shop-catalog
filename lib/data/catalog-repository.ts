import { getStore, resetStore } from '@/lib/data/mock-store'
import type { Category, Product, ProductInput } from '@/lib/types'

/**
 * THE DATA BOUNDARY.
 *
 * Everything above this line (pages, actions, components) talks to this
 * interface only. To move to Supabase or MongoDB, write a second object that
 * implements `CatalogRepository` and change the export at the bottom.
 *
 * The current implementation is an in-memory mock seeded from mock data.
 */
export interface CatalogRepository {
  listCategories(): Promise<Category[]>
  getCategoryBySlug(slug: string): Promise<Category | null>

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

  /** Prototype only: restores the seeded catalog. */
  resetDemoData(): Promise<void>
}

function createId() {
  return crypto.randomUUID()
}

const mockCatalogRepository: CatalogRepository = {
  async listCategories() {
    return [...getStore().categories]
  },

  async getCategoryBySlug(slug) {
    return getStore().categories.find((category) => category.slug === slug) ?? null
  },

  async listProducts() {
    return [...getStore().products]
  },

  async listPublishedProducts() {
    return getStore().products.filter((product) => product.published)
  },

  async getProductById(id) {
    return getStore().products.find((product) => product.id === id) ?? null
  },

  async getPublishedProductBySlug(slug) {
    return (
      getStore().products.find((product) => product.slug === slug && product.published) ??
      null
    )
  },

  async createProduct(input) {
    const store = getStore()
    assertUniqueSlug(store.products, input.slug)
    const product: Product = {
      ...input,
      id: createId(),
      createdAt: new Date().toISOString(),
    }
    store.products = [product, ...store.products]
    return product
  },

  async updateProduct(id, input) {
    const store = getStore()
    const existing = store.products.find((product) => product.id === id)
    if (!existing) throw new Error('This product no longer exists.')
    assertUniqueSlug(store.products, input.slug, id)
    const updated: Product = { ...existing, ...input }
    store.products = store.products.map((product) => (product.id === id ? updated : product))
    return updated
  },

  async patchProduct(id, patch) {
    const store = getStore()
    const existing = store.products.find((product) => product.id === id)
    if (!existing) throw new Error('This product no longer exists.')
    const updated: Product = { ...existing, ...patch }
    store.products = store.products.map((product) => (product.id === id ? updated : product))
    return updated
  },

  async deleteProduct(id) {
    const store = getStore()
    if (!store.products.some((product) => product.id === id)) {
      throw new Error('This product no longer exists.')
    }
    store.products = store.products.filter((product) => product.id !== id)
  },

  async resetDemoData() {
    resetStore()
  },
}

function assertUniqueSlug(products: Product[], slug: string, ignoreId?: string) {
  const clash = products.some((product) => product.slug === slug && product.id !== ignoreId)
  if (clash) throw new Error('Another product already uses this URL slug.')
}

/** Swap this binding when Supabase or MongoDB is wired up. */
export const catalogRepository: CatalogRepository = mockCatalogRepository
