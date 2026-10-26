import type { CategoryIcon, CategoryInput } from './types'

export const categoryIcons: CategoryIcon[] = ['refrigerator', 'rice-cooker', 'tv', 'fan', 'blender', 'plug']

export const categoryIconLabels: Record<CategoryIcon, string> = {
  refrigerator: 'রেফ্রিজারেটর',
  'rice-cooker': 'রাইস কুকার',
  tv: 'টেলিভিশন',
  fan: 'ফ্যান',
  blender: 'ব্লেন্ডার',
  plug: 'অন্যান্য / প্লাগ',
}

export interface CategoryFormValues {
  name: string
  slug: string
  icon: CategoryIcon
  description: string
}

export type CategoryFormErrors = Partial<Record<keyof CategoryFormValues, string>>

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function validateCategory(values: CategoryFormValues): CategoryFormErrors {
  const errors: CategoryFormErrors = {}

  if (!values.name.trim()) errors.name = 'ক্যাটাগরির নাম লিখুন।'
  else if (values.name.trim().length > 60) errors.name = 'নাম ৬০ অক্ষরের মধ্যে রাখুন।'

  if (!values.slug.trim()) errors.slug = 'URL স্লাগ লিখুন।'
  else if (!SLUG_PATTERN.test(values.slug) || values.slug.length > 60) {
    errors.slug = 'শুধু ছোট হাতের ইংরেজি অক্ষর, সংখ্যা ও একক হাইফেন ব্যবহার করুন।'
  }

  if (!categoryIcons.includes(values.icon)) errors.icon = 'একটি আইকন বেছে নিন।'
  if (values.description.length > 160) errors.description = 'বিবরণ ১৬০ অক্ষরের মধ্যে রাখুন।'

  return errors
}

export function hasCategoryErrors(errors: CategoryFormErrors) {
  return Object.keys(errors).length > 0
}

export function toCategoryInput(values: CategoryFormValues): CategoryInput {
  return {
    name: values.name.trim(),
    slug: values.slug.trim(),
    icon: values.icon,
    description: values.description.trim(),
  }
}

/** Server-side guard. Returns a user-facing message, or null when valid. */
export function validateCategoryInput(input: CategoryInput): string | null {
  if (!input.name.trim()) return 'ক্যাটাগরির নাম আবশ্যক।'
  if (input.name.trim().length > 60) return 'নাম ৬০ অক্ষরের মধ্যে রাখুন।'
  if (!SLUG_PATTERN.test(input.slug) || input.slug.length > 60) {
    return 'স্লাগে ছোট হাতের ইংরেজি অক্ষর, সংখ্যা ও হাইফেন ব্যবহার করুন।'
  }
  if (!categoryIcons.includes(input.icon)) return 'সঠিক আইকন বেছে নিন।'
  if (input.description.length > 160) return 'বিবরণ ১৬০ অক্ষরের মধ্যে রাখুন।'
  return null
}
