'use server'

import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/data/auth'
import { catalogRepository } from '@/lib/data/catalog-repository'
import { validateProductInput } from '@/lib/product-validation'
import type { Availability, Product, ProductInput } from '@/lib/types'

/**
 * Server actions are the only way the UI mutates data.
 * They are the swap point for Supabase/Mongo: the UI calls these, not a client.
 */

export type ActionResult = { ok: true } | { ok: false; error: string }
export type ProductActionResult = { ok: true; product: Product } | { ok: false; error: string }

const INVALID_SESSION = 'আপনার সেশন শেষ হয়েছে। আবার লগইন করুন।'

function message(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

function refreshCatalog() {
  revalidatePath('/', 'layout')
}

export async function saveProductAction(id: string | null, input: ProductInput): Promise<ProductActionResult> {
  if (!(await getSession())) return { ok: false, error: INVALID_SESSION }

  const problem = validateProductInput(input)
  if (problem) return { ok: false, error: problem }

  try {
    const categories = await catalogRepository.listCategories()
    if (!categories.some((category) => category.id === input.categoryId)) {
      return { ok: false, error: 'এই ক্যাটাগরিটি নেই।' }
    }

    const product = id
      ? await catalogRepository.updateProduct(id, input)
      : await catalogRepository.createProduct(input)
    refreshCatalog()
    return { ok: true, product }
  } catch (error) {
    return { ok: false, error: message(error, 'পণ্য সংরক্ষণ করা যায়নি।') }
  }
}

export async function patchProductAction(
  id: string,
  patch: Partial<{ published: boolean; featured: boolean; availability: Availability }>,
): Promise<ActionResult> {
  if (!(await getSession())) return { ok: false, error: INVALID_SESSION }

  try {
    await catalogRepository.patchProduct(id, patch)
    refreshCatalog()
    return { ok: true }
  } catch (error) {
    return { ok: false, error: message(error, 'পণ্য আপডেট করা যায়নি।') }
  }
}

export async function deleteProductAction(id: string): Promise<ActionResult> {
  if (!(await getSession())) return { ok: false, error: INVALID_SESSION }

  try {
    await catalogRepository.deleteProduct(id)
    refreshCatalog()
    return { ok: true }
  } catch (error) {
    return { ok: false, error: message(error, 'পণ্য মোছা যায়নি।') }
  }
}

export async function resetDemoDataAction(): Promise<ActionResult> {
  if (!(await getSession())) return { ok: false, error: INVALID_SESSION }

  try {
    await catalogRepository.resetDemoData()
    refreshCatalog()
    return { ok: true }
  } catch (error) {
    return { ok: false, error: message(error, 'ক্যাটালগ রিসেট করা যায়নি।') }
  }
}
