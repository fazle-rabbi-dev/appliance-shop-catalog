'use client'

import { useMemo, useSyncExternalStore } from 'react'
import { getCatalogServerSnapshot, getCatalogSnapshot, subscribeCatalog } from '@/lib/catalog-repository'

export function useCatalog() {
  const state = useSyncExternalStore(subscribeCatalog, getCatalogSnapshot, getCatalogServerSnapshot)

  const categoryById = useMemo(() => new Map(state.categories.map((c) => [c.id, c])), [state.categories])

  const publishedProducts = useMemo(() => state.products.filter((p) => p.published), [state.products])

  return { ...state, categoryById, publishedProducts }
}
