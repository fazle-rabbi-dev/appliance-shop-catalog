import { seedCategories, seedProducts } from './mock-data'
import type { CatalogState, Product, ProductInput } from './types'

/**
 * Prototype data layer backed by localStorage.
 *
 * Every read and write in the UI goes through this module, so swapping to
 * Supabase later means replacing the bodies of `catalogRepository` methods
 * with Supabase queries (they are already async) and replacing the
 * subscribe/getSnapshot pair with a SWR or realtime subscription.
 */

const STORAGE_KEY = 'shop-catalog:v1'

const seedState: CatalogState = { products: seedProducts, categories: seedCategories }

let state: CatalogState = seedState
let loaded = false
const listeners = new Set<() => void>()

function isCatalogState(value: unknown): value is CatalogState {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return Array.isArray(v.products) && Array.isArray(v.categories)
}

function readFromStorage(): CatalogState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return seedState
    const parsed: unknown = JSON.parse(raw)
    return isCatalogState(parsed) ? parsed : seedState
  } catch {
    return seedState
  }
}

function ensureLoaded() {
  if (loaded || typeof window === 'undefined') return
  loaded = true
  state = readFromStorage()
  window.addEventListener('storage', (event) => {
    if (event.key !== STORAGE_KEY) return
    state = readFromStorage()
    listeners.forEach((listener) => listener())
  })
}

function commit(next: CatalogState) {
  state = next
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    throw new Error('Could not save changes. Browser storage may be full or disabled.')
  } finally {
    listeners.forEach((listener) => listener())
  }
}

export function subscribeCatalog(listener: () => void) {
  ensureLoaded()
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getCatalogSnapshot() {
  ensureLoaded()
  return state
}

export function getCatalogServerSnapshot() {
  return seedState
}

function createId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function assertUniqueSlug(slug: string, ignoreId?: string) {
  const clash = state.products.some((p) => p.slug === slug && p.id !== ignoreId)
  if (clash) throw new Error('Another product already uses this URL slug.')
}

export const catalogRepository = {
  async createProduct(input: ProductInput): Promise<Product> {
    ensureLoaded()
    assertUniqueSlug(input.slug)
    const product: Product = { ...input, id: createId(), createdAt: new Date().toISOString() }
    commit({ ...state, products: [product, ...state.products] })
    return product
  },

  async updateProduct(id: string, input: ProductInput): Promise<Product> {
    ensureLoaded()
    const existing = state.products.find((p) => p.id === id)
    if (!existing) throw new Error('This product no longer exists.')
    assertUniqueSlug(input.slug, id)
    const updated: Product = { ...existing, ...input }
    commit({ ...state, products: state.products.map((p) => (p.id === id ? updated : p)) })
    return updated
  },

  async patchProduct(
    id: string,
    patch: Partial<Pick<Product, 'published' | 'featured' | 'availability'>>,
  ): Promise<Product> {
    ensureLoaded()
    const existing = state.products.find((p) => p.id === id)
    if (!existing) throw new Error('This product no longer exists.')
    const updated = { ...existing, ...patch }
    commit({ ...state, products: state.products.map((p) => (p.id === id ? updated : p)) })
    return updated
  },

  async deleteProduct(id: string): Promise<void> {
    ensureLoaded()
    commit({ ...state, products: state.products.filter((p) => p.id !== id) })
  },

  async resetDemoData(): Promise<void> {
    ensureLoaded()
    commit(seedState)
  },
}
