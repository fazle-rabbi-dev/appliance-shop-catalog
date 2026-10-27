import { createHash } from 'node:crypto'

/**
 * Minimal Cloudinary REST client.
 *
 * Uploads go straight from the browser to Cloudinary using a short-lived
 * signature created here. The API secret never leaves the server.
 */

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME?.trim() ?? ''
const API_KEY = process.env.CLOUDINARY_API_KEY?.trim() ?? ''
const API_SECRET = process.env.CLOUDINARY_API_SECRET?.trim() ?? ''

const UPLOAD_FOLDER = 'electronics-shop/products'

export function isCloudinaryConfigured() {
  return Boolean(CLOUD_NAME && API_KEY && API_SECRET)
}

export interface CloudinaryUploadSignature {
  uploadUrl: string
  apiKey: string
  timestamp: number
  folder: string
  signature: string
}

/** Cloudinary signs the alphabetically sorted params with the API secret appended. */
function sign(params: Record<string, string | number>) {
  const payload = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&')
  return createHash('sha1').update(`${payload}${API_SECRET}`).digest('hex')
}

export function createUploadSignature(): CloudinaryUploadSignature {
  const timestamp = Math.floor(Date.now() / 1000)
  return {
    uploadUrl: `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    apiKey: API_KEY,
    timestamp,
    folder: UPLOAD_FOLDER,
    signature: sign({ folder: UPLOAD_FOLDER, timestamp }),
  }
}

export function isManagedPublicId(publicId: string) {
  return Boolean(publicId) && publicId.startsWith(`${UPLOAD_FOLDER}/`)
}

export async function deleteCloudinaryImage(publicId: string) {
  if (!isCloudinaryConfigured() || !publicId) return
  if (!isManagedPublicId(publicId)) throw new Error('শুধু এই অ্যাপের আপলোড করা ছবি মোছা যাবে।')

  const timestamp = Math.floor(Date.now() / 1000)
  const body = new URLSearchParams({
    public_id: publicId,
    timestamp: String(timestamp),
    api_key: API_KEY,
    signature: sign({ public_id: publicId, timestamp }),
  })

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/destroy`, {
    method: 'POST',
    body,
  })

  if (!response.ok) throw new Error(`Cloudinary ছবি মোছা যায়নি (${response.status})।`)

  const result = (await response.json()) as { result?: string }
  if (result.result !== 'ok' && result.result !== 'not found') {
    throw new Error('Cloudinary ছবি মোছা যায়নি।')
  }
}

/** Best-effort cleanup: a failed delete must never fail the catalog write. */
export async function deleteCloudinaryImages(publicIds: Array<string | null | undefined>) {
  const ids = [...new Set(publicIds.filter((id): id is string => Boolean(id)))]
  await Promise.allSettled(ids.map((id) => deleteCloudinaryImage(id)))
}
