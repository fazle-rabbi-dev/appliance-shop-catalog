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

  if (!values.name.trim()) errors.name = 'পণ্যের নাম লিখুন।'
  else if (values.name.trim().length > 120) errors.name = 'নাম ১২০ অক্ষরের মধ্যে রাখুন।'

  if (!values.slug.trim()) errors.slug = 'URL স্লাগ লিখুন।'
  else if (!SLUG_PATTERN.test(values.slug)) errors.slug = 'শুধু ছোট হাতের ইংরেজি অক্ষর, সংখ্যা ও একক হাইফেন ব্যবহার করুন।'

  if (!values.categoryId) errors.categoryId = 'একটি ক্যাটাগরি বেছে নিন।'
  if (!values.brand.trim()) errors.brand = 'ব্র্যান্ডের নাম লিখুন।'

  const price = Number(values.price)
  if (values.price.trim() === '') errors.price = 'দাম লিখুন।'
  else if (!Number.isFinite(price) || price < 0) errors.price = 'দাম ০ বা তার বেশি একটি সংখ্যা হতে হবে।'
  else if (price > 10_000_000) errors.price = 'দামটি খুব বেশি মনে হচ্ছে।'

  if (!values.description.trim()) errors.description = 'সংক্ষিপ্ত বিবরণ লিখুন।'
  else if (values.description.length > 2000) errors.description = 'বিবরণ ২০০০ অক্ষরের মধ্যে রাখুন।'

  const filledImages = values.images.map((image) => image.url.trim()).filter(Boolean)
  if (filledImages.length === 0) errors.images = 'অন্তত একটি ছবির URL দিন।'
  const imageRows: Record<number, string> = {}
  values.images.forEach((image, index) => {
    if (image.url.trim() && !isValidImageUrl(image.url)) imageRows[index] = 'পূর্ণ https:// URL অথবা /images/ পাথ দিন।'
  })
  if (Object.keys(imageRows).length) errors.imageRows = imageRows

  const partialSpec = values.specs.some((s) => Boolean(s.label.trim()) !== Boolean(s.value.trim()))
  if (partialSpec) errors.specs = 'প্রতিটি স্পেসিফিকেশনে নাম ও মান দুটোই লাগবে।'

  return errors
}

export function hasErrors(errors: ProductFormErrors) {
  return Object.keys(errors).length > 0
}

const AVAILABILITY: Availability[] = ['in_stock', 'low_stock', 'out_of_stock']

/** Server-side guard. Returns a user-facing message, or null when valid. */
export function validateProductInput(input: ProductInput): string | null {
  if (!input.name.trim()) return 'পণ্যের নাম আবশ্যক।'
  if (input.name.trim().length > 120) return 'নাম ১২০ অক্ষরের মধ্যে রাখুন।'
  if (!SLUG_PATTERN.test(input.slug)) return 'স্লাগে ছোট হাতের ইংরেজি অক্ষর, সংখ্যা ও হাইফেন ব্যবহার করুন।'
  if (!input.categoryId) return 'একটি ক্যাটাগরি বেছে নিন।'
  if (!input.brand.trim()) return 'ব্র্যান্ডের নাম আবশ্যক।'
  if (!Number.isFinite(input.price) || input.price < 0) return 'দাম ০ বা তার বেশি হতে হবে।'
  if (input.price > 10_000_000) return 'দামটি খুব বেশি মনে হচ্ছে।'
  if (!input.description.trim()) return 'বিবরণ আবশ্যক।'
  if (input.description.length > 2000) return 'বিবরণ ২০০০ অক্ষরের মধ্যে রাখুন।'
  if (input.images.length === 0) return 'অন্তত একটি ছবি দিন।'
  if (input.images.some((image) => !isValidImageUrl(image.url))) return 'প্রতিটি ছবির জন্য সঠিক URL দিন।'
  if (!AVAILABILITY.includes(input.availability)) return 'সঠিক স্টক স্ট্যাটাস বেছে নিন।'
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
