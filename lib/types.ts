export type Availability = 'in_stock' | 'low_stock' | 'out_of_stock'

export type CategoryIcon = 'refrigerator' | 'rice-cooker' | 'tv' | 'fan' | 'blender' | 'plug'

export interface Category {
  id: string
  name: string
  slug: string
  icon: CategoryIcon
  description: string
}

export interface ProductSpec {
  label: string
  value: string
}

export interface Product {
  id: string
  name: string
  slug: string
  categoryId: string
  brand: string
  model: string
  price: number
  description: string
  images: string[]
  specs: ProductSpec[]
  availability: Availability
  published: boolean
  featured: boolean
  createdAt: string
}

export type ProductInput = Omit<Product, 'id' | 'createdAt'>

export interface CatalogState {
  products: Product[]
  categories: Category[]
}

export interface SessionUser {
  email: string
  role: 'admin'
}
