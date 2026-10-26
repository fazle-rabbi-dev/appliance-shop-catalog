'use client'

import { useMemo, useSyncExternalStore } from 'react'

export type Route =
  | { name: 'home'; section?: string }
  | { name: 'products'; category?: string; q?: string }
  | { name: 'product'; slug: string }
  | { name: 'admin' }
  | { name: 'admin-products' }
  | { name: 'admin-new' }
  | { name: 'admin-edit'; id: string }

const HOME_SECTIONS = new Set(['categories', 'featured', 'about', 'contact'])
const ROUTE_EVENT = 'app:routechange'

export function parseHash(hash: string): Route {
  const raw = hash.replace(/^#\/?/, '')
  const [path, query = ''] = raw.split('?')
  const segments = path.split('/').filter(Boolean).map(decodeURIComponent)
  const params = new URLSearchParams(query)

  const [first, second, third] = segments
  if (!first) return { name: 'home' }
  if (HOME_SECTIONS.has(first)) return { name: 'home', section: first }
  if (first === 'products')
    return {
      name: 'products',
      category: params.get('category') ?? undefined,
      q: params.get('q') ?? undefined,
    }
  if (first === 'product' && second) return { name: 'product', slug: second }
  if (first === 'admin') {
    if (!second) return { name: 'admin' }
    if (second === 'products') return { name: 'admin-products' }
    if (second === 'new') return { name: 'admin-new' }
    if (second === 'edit' && third) return { name: 'admin-edit', id: third }
  }
  return { name: 'home' }
}

function subscribe(listener: () => void) {
  window.addEventListener('hashchange', listener)
  window.addEventListener(ROUTE_EVENT, listener)
  return () => {
    window.removeEventListener('hashchange', listener)
    window.removeEventListener(ROUTE_EVENT, listener)
  }
}

const getSnapshot = () => window.location.hash
const getServerSnapshot = () => ''

export function useHashRoute() {
  const hash = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  return useMemo(() => parseHash(hash), [hash])
}

export function navigate(hash: string, options: { replace?: boolean } = {}) {
  const target = hash.startsWith('#') ? hash : `#${hash}`
  if (options.replace) {
    window.history.replaceState(null, '', target)
    window.dispatchEvent(new Event(ROUTE_EVENT))
  } else {
    window.location.hash = target
  }
}

export function productsHref(params: { category?: string; q?: string } = {}) {
  const search = new URLSearchParams()
  if (params.category) search.set('category', params.category)
  if (params.q) search.set('q', params.q)
  const qs = search.toString()
  return qs ? `#products?${qs}` : '#products'
}
