/**
 * Single source of truth for URLs. Never build route strings by hand.
 */

export function productsHref(params: { category?: string; q?: string } = {}) {
  const search = new URLSearchParams()
  if (params.category) search.set('category', params.category)
  if (params.q) search.set('q', params.q)
  const qs = search.toString()
  return qs ? `/products?${qs}` : '/products'
}

export function productHref(slug: string) {
  return `/products/${encodeURIComponent(slug)}`
}

export function homeSectionHref(section: string) {
  return `/#${section}`
}

export const adminRoutes = {
  dashboard: '/admin',
  products: '/admin/products',
  newProduct: '/admin/products/new',
  editProduct: (id: string) => `/admin/products/${encodeURIComponent(id)}/edit`,
}

export function loginHref(next?: string) {
  if (!next) return '/login'
  return `/login?next=${encodeURIComponent(next)}`
}
