'use client'

import { useEffect } from 'react'
import { AdminDashboard } from '@/components/admin/admin-dashboard'
import { AdminProducts } from '@/components/admin/admin-products'
import { AdminShell } from '@/components/admin/admin-shell'
import { ProductForm } from '@/components/admin/product-form'
import { ToastProvider } from '@/components/shared/toast-provider'
import { HomePage } from '@/components/storefront/home-page'
import { ProductDetailPage } from '@/components/storefront/product-detail-page'
import { ProductsPage } from '@/components/storefront/products-page'
import { SiteFooter } from '@/components/storefront/site-footer'
import { SiteHeader } from '@/components/storefront/site-header'
import { useCatalog } from '@/hooks/use-catalog'
import { useHashRoute, type Route } from '@/hooks/use-hash-route'

export function AppShell() {
  const route = useHashRoute()
  const section = route.name === 'home' ? route.section : undefined

  useEffect(() => {
    if (section) {
      document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      window.scrollTo({ top: 0 })
    }
  }, [route, section])

  return (
    <ToastProvider>
      {route.name.startsWith('admin') ? (
        <AdminShell route={route}>
          <AdminView route={route} />
        </AdminShell>
      ) : (
        <PublicView route={route} />
      )}
    </ToastProvider>
  )
}

function PublicView({ route }: { route: Route }) {
  const { categories } = useCatalog()
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        onClick={(e) => {
          e.preventDefault()
          document.getElementById('main')?.focus()
        }}
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-card focus:px-4 focus:py-2"
      >
        Skip to content
      </a>
      <SiteHeader route={route} />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        {route.name === 'products' ? (
          <ProductsPage key={`${route.category ?? ''}|${route.q ?? ''}`} categorySlug={route.category} query={route.q} />
        ) : route.name === 'product' ? (
          <ProductDetailPage key={route.slug} slug={route.slug} />
        ) : (
          <HomePage />
        )}
      </main>
      <SiteFooter categories={categories} />
    </div>
  )
}

function AdminView({ route }: { route: Route }) {
  const { products } = useCatalog()

  if (route.name === 'admin-products') return <AdminProducts />
  if (route.name === 'admin-new') return <ProductForm key="new" />
  if (route.name === 'admin-edit') {
    const product = products.find((p) => p.id === route.id)
    if (!product) {
      return (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card p-10 text-center">
          <h1 className="text-lg font-semibold">Product not found</h1>
          <p className="text-sm text-muted-foreground">It may have been deleted, or the link is incorrect.</p>
          <a href="#admin/products" className="text-sm font-medium text-primary hover:underline">
            Back to products
          </a>
        </div>
      )
    }
    return <ProductForm key={product.id} product={product} />
  }
  return <AdminDashboard />
}
