'use server'

import { createUploadSignature, deleteCloudinaryImage, isCloudinaryConfigured, type CloudinaryUploadSignature } from '@/lib/cloudinary'
import { getSession } from '@/lib/data/auth'

export type UploadSignatureResult = ({ ok: true } & CloudinaryUploadSignature) | { ok: false; error: string }
export type DeleteImageResult = { ok: true } | { ok: false; error: string }

/** Admins get a one-shot signed upload config; the file itself goes to Cloudinary. */
export async function getUploadSignatureAction(): Promise<UploadSignatureResult> {
  if (!(await getSession())) return { ok: false, error: 'আপনার সেশন শেষ হয়েছে। আবার লগইন করুন।' }
  if (!isCloudinaryConfigured()) {
    return { ok: false, error: 'Cloudinary কনফিগার করা হয়নি। .env.local এ CLOUDINARY_* ভেরিয়েবল দিন।' }
  }
  return { ok: true, ...createUploadSignature() }
}

/** Deletes an image that was uploaded but never saved on a product. */
export async function deleteUploadedImageAction(publicId: string): Promise<DeleteImageResult> {
  if (!(await getSession())) return { ok: false, error: 'আপনার সেশন শেষ হয়েছে। আবার লগইন করুন।' }

  try {
    await deleteCloudinaryImage(publicId)
    return { ok: true }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'ছবি মোছা যায়নি।' }
  }
}
