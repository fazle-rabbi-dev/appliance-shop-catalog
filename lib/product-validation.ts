import type { Availability, ProductImage, ProductInput, ProductSpec } from './types'

export interface ProductFormValues {
  name: string
  slug: string
  categoryId: string
  brand: string
  model: string
  price: string
  description: string
  images: ProductImage[]
  specs: ProductSpec[]
  availability: Availability
  published: boolean
  featured: boolean
}

export type ProductFormErrors = Partial<Record<'name' | 'slug' | 'categoryId' | 'brand' | 'price' | 'description' | 'images' | 'specs', string>> & {
  imageRows?: Record<number, string>
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function isValidImageUrl(value: string) {
  const trimmed = value.trim()
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return true
  try {
    const url = new URL(trimmed)
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}

export function validateProduct(values: ProductFormValues): ProductFormErrors {
  const errors: ProductFormErrors = {}

  if (!values.name.trim()) errors.name = 'Enter a product name.'
  else if (values.name.trim().length > 120) errors.name = 'Keep the name under 120 characters.'

  if (!values.slug.trim()) errors.slug = 'Enter a URL slug.'
  else if (!SLUG_PATTERN.test(values.slug)) errors.slug = 'Use lowercase letters, numbers and single hyphens only.'

  if (!values.categoryId) errors.categoryId = 'Choose a category.'
  if (!values.brand.trim()) errors.brand = 'Enter the brand.'

  const price = Number(values.price)
  if (values.price.trim() === '') errors.price = 'Enter a price.'
  else if (!Number.isFinite(price) || price < 0) errors.price = 'Price must be a number of 0 or more.'
  else if (price > 10_000_000) errors.price = 'That price looks too high.'

  if (!values.description.trim()) errors.description = 'Add a short description.'
  else if (values.description.length > 2000) errors.description = 'Keep the description under 2000 characters.'

  const filledImages = values.images.map((image) => image.url.trim()).filter(Boolean)
  if (filledImages.length === 0) errors.images = 'Add at least one image URL.'
  const imageRows: Record<number, string> = {}
  values.images.forEach((image, index) => {
    if (image.url.trim() && !isValidImageUrl(image.url)) imageRows[index] = 'Enter a full https:// URL or a /images/ path.'
  })
  if (Object.keys(imageRows).length) errors.imageRows = imageRows

  const partialSpec = values.specs.some((s) => Boolean(s.label.trim()) !== Boolean(s.value.trim()))
  if (partialSpec) errors.specs = 'Each specification needs both a label and a value.'

  return errors
}

export function hasErrors(errors: ProductFormErrors) {
  return Object.keys(errors).length > 0
}

const AVAILABILITY: Availability[] = ['in_stock', 'low_stock', 'out_of_stock']

/** Server-side guard. Returns a user-facing message, or null when valid. */
export function validateProductInput(input: ProductInput): string | null {
  if (!input.name.trim()) return 'Product name is required.'
  if (input.name.trim().length > 120) return 'Keep the name under 120 characters.'
  if (!SLUG_PATTERN.test(input.slug)) return 'Slug must use lowercase letters, numbers and hyphens.'
  if (!input.categoryId) return 'Choose a category.'
  if (!input.brand.trim()) return 'Brand is required.'
  if (!Number.isFinite(input.price) || input.price < 0) return 'Price must be 0 or more.'
  if (input.price > 10_000_000) return 'That price looks too high.'
  if (!input.description.trim()) return 'Description is required.'
  if (input.description.length > 2000) return 'Keep the description under 2000 characters.'
  if (input.images.length === 0) return 'Add at least one image.'
  if (input.images.some((image) => !isValidImageUrl(image.url))) return 'Every image needs a valid URL.'
  if (!AVAILABILITY.includes(input.availability)) return 'Pick a valid availability.'
  return null
}

export function toProductInput(values: ProductFormValues): ProductInput {
  return {
    name: values.name.trim(),
    slug: values.slug.trim(),
    categoryId: values.categoryId,
    brand: values.brand.trim(),
    model: values.model.trim(),
    price: Math.round(Number(values.price)),
    description: values.description.trim(),
    images: values.images
      .map((image) => ({ url: image.url.trim(), publicId: image.publicId?.trim() || null }))
      .filter((image) => image.url),
    specs: values.specs
      .map((s) => ({ label: s.label.trim(), value: s.value.trim() }))
      .filter((s) => s.label && s.value),
    availability: values.availability,
    published: values.published,
    featured: values.featured,
  }
}
