'use server'

import { updateTag } from 'next/cache'
import { CATALOG_TAG } from '@/lib/cache-tags'
import { deleteCloudinaryImages } from '@/lib/cloudinary'
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
  updateTag(CATALOG_TAG)
}

export async function saveProductAction(id: string | null, input: ProductInput): Promise<ProductActionResult> {
  if (!(await getSession())) return { ok: false, error: INVALID_SESSION }

  const problem = validateProductInput(input)
  if (problem) return { ok: false, error: problem }

  try {
    const [categories, previous] = await Promise.all([
      catalogRepository.listCategories(),
      id ? catalogRepository.getProductById(id) : Promise.resolve(null),
    ])
    if (!categories.some((category) => category.id === input.categoryId)) {
      return { ok: false, error: 'এই ক্যাটাগরিটি নেই।' }
    }

    const product = id
      ? await catalogRepository.updateProduct(id, input)
      : await catalogRepository.createProduct(input)

    if (previous) {
      const kept = new Set(input.images.map((image) => image.publicId).filter(Boolean))
      await deleteCloudinaryImages(
        previous.images.filter((image) => image.publicId && !kept.has(image.publicId)).map((image) => image.publicId),
      )
    }

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
    const product = await catalogRepository.getProductById(id)
    await catalogRepository.deleteProduct(id)
    if (product) await deleteCloudinaryImages(product.images.map((image) => image.publicId))
    refreshCatalog()
    return { ok: true }
  } catch (error) {
    return { ok: false, error: message(error, 'পণ্য মোছা যায়নি।') }
  }
}

export async function resetDemoDataAction(): Promise<ActionResult> {
  if (!(await getSession())) return { ok: false, error: INVALID_SESSION }

  try {
    const products = await catalogRepository.listProducts()
    await catalogRepository.resetDemoData()
    await deleteCloudinaryImages(products.flatMap((product) => product.images.map((image) => image.publicId)))
    refreshCatalog()
    return { ok: true }
  } catch (error) {
    return { ok: false, error: message(error, 'ক্যাটালগ রিসেট করা যায়নি।') }
  }
}
