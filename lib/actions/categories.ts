'use server'

import { revalidatePath } from 'next/cache'
import { validateCategoryInput } from '@/lib/category-validation'
import { catalogRepository } from '@/lib/data/catalog-repository'
import { getSession } from '@/lib/data/auth'
import type { Category, CategoryInput } from '@/lib/types'

export type CategoryActionResult = { ok: true; category: Category } | { ok: false; error: string }

const INVALID_SESSION = 'Your session expired. Sign in again.'

function message(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

function refreshCatalog() {
  revalidatePath('/', 'layout')
}

export async function saveCategoryAction(
  id: string | null,
  input: CategoryInput,
): Promise<CategoryActionResult> {
  if (!(await getSession())) return { ok: false, error: INVALID_SESSION }

  const problem = validateCategoryInput(input)
  if (problem) return { ok: false, error: problem }

  try {
    const category = id
      ? await catalogRepository.updateCategory(id, input)
      : await catalogRepository.createCategory(input)
    refreshCatalog()
    return { ok: true, category }
  } catch (error) {
    return { ok: false, error: message(error, 'Could not save the category.') }
  }
}

export async function deleteCategoryAction(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!(await getSession())) return { ok: false, error: INVALID_SESSION }

  try {
    await catalogRepository.deleteCategory(id)
    refreshCatalog()
    return { ok: true }
  } catch (error) {
    return { ok: false, error: message(error, 'Could not delete the category.') }
  }
}
