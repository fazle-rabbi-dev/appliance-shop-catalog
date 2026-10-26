import { seedCategories, seedProducts } from '@/lib/mock-data'
import type { CatalogState } from '@/lib/types'

/**
 * In-memory mock store, seeded from `lib/mock-data.ts`.
 *
 * Kept on `globalThis` so it survives HMR and repeated module evaluation.
 * Data is lost when the dev server restarts. Swap this file for a database
 * client and the rest of the app keeps working unchanged.
 */
const globalStore = globalThis as typeof globalThis & {
  __shopCatalogStore?: CatalogState
}

function seed(): CatalogState {
  return {
    categories: structuredClone(seedCategories),
    products: structuredClone(seedProducts),
  }
}

export function getStore(): CatalogState {
  if (!globalStore.__shopCatalogStore) {
    globalStore.__shopCatalogStore = seed()
  }
  return globalStore.__shopCatalogStore
}

export function resetStore(): CatalogState {
  globalStore.__shopCatalogStore = seed()
  return globalStore.__shopCatalogStore
}
