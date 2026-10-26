import type { CategoryIcon, CategoryInput } from './types'

export const categoryIcons: CategoryIcon[] = ['refrigerator', 'rice-cooker', 'tv', 'fan', 'blender', 'plug']

export const categoryIconLabels: Record<CategoryIcon, string> = {
  refrigerator: 'Refrigerator',
  'rice-cooker': 'Rice cooker',
  tv: 'Television',
  fan: 'Fan',
  blender: 'Blender',
  plug: 'Other / plug',
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

  if (!values.name.trim()) errors.name = 'Enter a category name.'
  else if (values.name.trim().length > 60) errors.name = 'Keep the name under 60 characters.'

  if (!values.slug.trim()) errors.slug = 'Enter a URL slug.'
  else if (!SLUG_PATTERN.test(values.slug) || values.slug.length > 60) {
    errors.slug = 'Use lowercase letters, numbers and single hyphens only.'
  }

  if (!categoryIcons.includes(values.icon)) errors.icon = 'Choose an icon.'
  if (values.description.length > 160) errors.description = 'Keep the description under 160 characters.'

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
  if (!input.name.trim()) return 'Category name is required.'
  if (input.name.trim().length > 60) return 'Keep the name under 60 characters.'
  if (!SLUG_PATTERN.test(input.slug) || input.slug.length > 60) {
    return 'Slug must use lowercase letters, numbers and hyphens.'
  }
  if (!categoryIcons.includes(input.icon)) return 'Pick a valid icon.'
  if (input.description.length > 160) return 'Keep the description under 160 characters.'
  return null
}
