import type { Availability, ProductInput, ProductSpec } from './types'

export interface ProductFormValues {
  name: string
  slug: string
  categoryId: string
  brand: string
  model: string
  price: string
  description: string
  images: string[]
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

  const filledImages = values.images.map((v) => v.trim()).filter(Boolean)
  if (filledImages.length === 0) errors.images = 'Add at least one image URL.'
  const imageRows: Record<number, string> = {}
  values.images.forEach((url, index) => {
    if (url.trim() && !isValidImageUrl(url)) imageRows[index] = 'Enter a full https:// URL or a /images/ path.'
  })
  if (Object.keys(imageRows).length) errors.imageRows = imageRows

  const partialSpec = values.specs.some((s) => Boolean(s.label.trim()) !== Boolean(s.value.trim()))
  if (partialSpec) errors.specs = 'Each specification needs both a label and a value.'

  return errors
}

export function hasErrors(errors: ProductFormErrors) {
  return Object.keys(errors).length > 0
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
    images: values.images.map((v) => v.trim()).filter(Boolean),
    specs: values.specs
      .map((s) => ({ label: s.label.trim(), value: s.value.trim() }))
      .filter((s) => s.label && s.value),
    availability: values.availability,
    published: values.published,
    featured: values.featured,
  }
}
