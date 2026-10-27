'use client'

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ArrowLeft, GripVertical, Loader2, Plus, Trash2, Upload } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useId, useRef, useState } from 'react'
import { ProductImage } from '@/components/shared/product-image'
import { useToast } from '@/components/shared/toast-provider'
import { Button, buttonVariants } from '@/components/ui/button'
import { saveProductAction } from '@/lib/actions/catalog'
import { deleteUploadedImageAction, getUploadSignatureAction } from '@/lib/actions/cloudinary'
import { availabilityLabel, availabilityOptions, slugify } from '@/lib/format'
import {
  hasErrors,
  isValidImageUrl,
  toProductInput,
  validateProduct,
  type ProductFormErrors,
  type ProductFormValues,
} from '@/lib/product-validation'
import { adminRoutes, productHref } from '@/lib/routes'
import type { Category, Product, ProductImage as ProductImageType } from '@/lib/types'
import { cn } from '@/lib/utils'

type FormImage = ProductImageType & { key: string }
type FormValues = Omit<ProductFormValues, 'images'> & { images: FormImage[] }

let imageKeyCounter = 0

function withKey(image: ProductImageType): FormImage {
  imageKeyCounter += 1
  return { ...image, key: `image-${imageKeyCounter}` }
}

function toFormValues(product?: Product): FormValues {
  if (!product) {
    return {
      name: '',
      slug: '',
      categoryId: '',
      brand: '',
      model: '',
      price: '',
      description: '',
      images: [withKey({ url: '', publicId: null })],
      specs: [{ label: '', value: '' }],
      availability: 'in_stock',
      published: true,
      featured: false,
    }
  }
  return {
    name: product.name,
    slug: product.slug,
    categoryId: product.categoryId,
    brand: product.brand,
    model: product.model,
    price: String(product.price),
    description: product.description,
    images: product.images.length
      ? product.images.map((image) => withKey({ ...image }))
      : [withKey({ url: '', publicId: null })],
    specs: product.specs.length ? product.specs.map((s) => ({ ...s })) : [{ label: '', value: '' }],
    availability: product.availability,
    published: product.published,
    featured: product.featured,
  }
}

const inputClass =
  'h-11 w-full rounded-lg border border-input bg-card px-3 text-base sm:text-sm aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/15'

const MAX_IMAGE_BYTES = 8 * 1024 * 1024

function SortableImageRow({
  id,
  disabled,
  children,
}: {
  id: string
  disabled: boolean
  children: (handle: ReturnType<typeof useSortable>) => React.ReactNode
}) {
  const handle = useSortable({ id, disabled })
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(handle.transform),
    transition: handle.transition,
    zIndex: handle.isDragging ? 10 : undefined,
  }

  return (
    <li
      ref={handle.setNodeRef}
      style={style}
      className={cn('relative flex gap-3 rounded-lg', handle.isDragging && 'z-10 bg-card opacity-90 shadow-lg')}
    >
      {children(handle)}
    </li>
  )
}

export function ProductForm({ product, categories }: { product?: Product; categories: Category[] }) {
  const router = useRouter()
  const { notify } = useToast()
  const uid = useId()
  const [values, setValues] = useState<FormValues>(() => toFormValues(product))
  const [errors, setErrors] = useState<ProductFormErrors>({})
  const [slugTouched, setSlugTouched] = useState(Boolean(product))
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null)
  const uploadedPublicIds = useRef(new Set<string>())
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const isEdit = Boolean(product)
  const fieldId = (name: string) => `${uid}-${name}`

  function collectErrors(next: FormValues) {
    return validateProduct(next)
  }

  function update(patch: Partial<FormValues>) {
    setValues((current) => {
      const next = { ...current, ...patch }
      if (patch.name !== undefined && !slugTouched) next.slug = slugify(patch.name)
      if (submitted) setErrors(collectErrors(next))
      return next
    })
  }

  function discardUploaded(publicId: string | null) {
    if (!publicId || !uploadedPublicIds.current.has(publicId)) return
    uploadedPublicIds.current.delete(publicId)
    void deleteUploadedImageAction(publicId).then((result) => {
      if (!result.ok) notify(result.error, 'error')
    })
  }

  function removeImage(index: number) {
    const image = values.images[index]
    if (image?.publicId && !uploadedPublicIds.current.has(image.publicId)) {
      notify('পণ্য সেভ করলে ছবিটি Cloudinary থেকেও মুছে যাবে।')
    }
    discardUploaded(image?.publicId ?? null)
    update({ images: values.images.filter((_, i) => i !== index) })
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = values.images.findIndex((image) => image.key === active.id)
    const newIndex = values.images.findIndex((image) => image.key === over.id)
    if (oldIndex < 0 || newIndex < 0) return

    update({ images: arrayMove(values.images, oldIndex, newIndex) })
  }

  async function uploadImage(index: number, file: File) {
    const previousPublicId = values.images[index]?.publicId ?? null

    if (!file.type.startsWith('image/')) {
      notify('শুধু ছবি ফাইল আপলোড করুন।', 'error')
      return
    }
    if (file.size > MAX_IMAGE_BYTES) {
      notify('ছবির আকার ৮ MB এর মধ্যে রাখুন।', 'error')
      return
    }

    setUploadingIndex(index)
    try {
      const signature = await getUploadSignatureAction()
      if (!signature.ok) throw new Error(signature.error)

      const body = new FormData()
      body.append('file', file)
      body.append('api_key', signature.apiKey)
      body.append('timestamp', String(signature.timestamp))
      body.append('folder', signature.folder)
      body.append('signature', signature.signature)

      const response = await fetch(signature.uploadUrl, { method: 'POST', body })
      const result = (await response.json()) as {
        secure_url?: string
        public_id?: string
        error?: { message?: string }
      }

      if (!response.ok || !result.secure_url || !result.public_id) {
        throw new Error(result.error?.message ?? 'ছবি আপলোড করা যায়নি।')
      }

      uploadedPublicIds.current.add(result.public_id)
      if (previousPublicId && previousPublicId !== result.public_id) discardUploaded(previousPublicId)

      setValues((current) => ({
        ...current,
        images: current.images.map((image, i) =>
          i === index ? { ...image, url: result.secure_url!, publicId: result.public_id! } : image,
        ),
      }))
      setErrors((current) => {
        if (!submitted) return current
        const next = { ...current }
        delete next.images
        if (next.imageRows) {
          const imageRows = { ...next.imageRows }
          delete imageRows[index]
          if (Object.keys(imageRows).length) next.imageRows = imageRows
          else delete next.imageRows
        }
        return next
      })
      notify('ছবি আপলোড হয়েছে।')
    } catch (error) {
      notify(error instanceof Error ? error.message : 'ছবি আপলোড করা যায়নি।', 'error')
    } finally {
      setUploadingIndex(null)
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
    const found = collectErrors(values)
    setErrors(found)
    if (hasErrors(found)) {
      notify('চিহ্নিত ঘরগুলো ঠিক করুন।', 'error')
      const firstInvalid = event.currentTarget.querySelector<HTMLElement>('[aria-invalid="true"]')
      firstInvalid?.focus()
      return
    }
    setSaving(true)
    const input = toProductInput(values)
    const result = await saveProductAction(product?.id ?? null, input)

    if (!result.ok) {
      notify(result.error, 'error')
      setSaving(false)
      return
    }

    notify(product ? `“${input.name}” এর পরিবর্তন সংরক্ষণ হয়েছে।` : `“${input.name}” যোগ করা হয়েছে।`)
    uploadedPublicIds.current.clear()
    router.push(adminRoutes.products)
    router.refresh()
  }

  const errorId = (name: string) => (errors[name as keyof ProductFormErrors] ? `${fieldId(name)}-error` : undefined)

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link
          href={adminRoutes.products}
          className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          পণ্যে ফিরে যান
        </Link>
        <h1 className="text-2xl font-semibold text-balance sm:text-3xl">
          {isEdit ? `${product?.name} সম্পাদনা` : 'পণ্য যোগ করুন'}
        </h1>
        <p className="text-sm text-muted-foreground">
          <span aria-hidden="true">*</span>
          <span className="sr-only">তারকা চিহ্নিত</span> ঘরগুলো অবশ্যই পূরণ করতে হবে।
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex flex-col gap-6">
          <Fieldset legend="মূল তথ্য">
            <Field label="পণ্যের নাম" required id={fieldId('name')} error={errors.name}>
              <input
                id={fieldId('name')}
                value={values.name}
                onChange={(e) => update({ name: e.target.value })}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errorId('name')}
                autoComplete="off"
                className={inputClass}
              />
            </Field>

            <Field
              label="URL স্লাগ"
              required
              id={fieldId('slug')}
              error={errors.slug}
              hint={`পেজের ঠিকানা: ${productHref(values.slug || 'আপনার-পণ্য')}`}
            >
              <input
                id={fieldId('slug')}
                value={values.slug}
                onChange={(e) => {
                  setSlugTouched(true)
                  update({ slug: e.target.value.toLowerCase() })
                }}
                aria-invalid={Boolean(errors.slug)}
                aria-describedby={errorId('slug') ?? `${fieldId('slug')}-hint`}
                autoComplete="off"
                spellCheck={false}
                className={cn(inputClass, 'font-mono')}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="ক্যাটাগরি" required id={fieldId('categoryId')} error={errors.categoryId}>
                <select
                  id={fieldId('categoryId')}
                  value={values.categoryId}
                  onChange={(e) => update({ categoryId: e.target.value })}
                  aria-invalid={Boolean(errors.categoryId)}
                  aria-describedby={errorId('categoryId')}
                  className={inputClass}
                >
                  <option value="">ক্যাটাগরি বেছে নিন</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="দাম (টাকা)" required id={fieldId('price')} error={errors.price}>
                <div className="relative">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
                  >
                    ৳
                  </span>
                  <input
                    id={fieldId('price')}
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={1}
                    value={values.price}
                    onChange={(e) => update({ price: e.target.value })}
                    aria-invalid={Boolean(errors.price)}
                    aria-describedby={errorId('price')}
                    className={cn(inputClass, 'pl-10 tabular-nums')}
                  />
                </div>
              </Field>
              <Field label="ব্র্যান্ড" required id={fieldId('brand')} error={errors.brand}>
                <input
                  id={fieldId('brand')}
                  value={values.brand}
                  onChange={(e) => update({ brand: e.target.value })}
                  aria-invalid={Boolean(errors.brand)}
                  aria-describedby={errorId('brand')}
                  className={inputClass}
                />
              </Field>
              <Field label="মডেল" id={fieldId('model')}>
                <input
                  id={fieldId('model')}
                  value={values.model}
                  onChange={(e) => update({ model: e.target.value })}
                  className={inputClass}
                />
              </Field>
            </div>

            <Field label="বিবরণ" required id={fieldId('description')} error={errors.description}>
              <textarea
                id={fieldId('description')}
                rows={5}
                value={values.description}
                onChange={(e) => update({ description: e.target.value })}
                aria-invalid={Boolean(errors.description)}
                aria-describedby={errorId('description')}
                className={cn(inputClass, 'h-auto py-2.5 leading-relaxed')}
              />
            </Field>
          </Fieldset>

          <Fieldset legend="ছবি" required error={errors.images} errorId={`${fieldId('images')}-error`}>
            <p className="text-sm leading-relaxed text-muted-foreground">
              প্রথম ছবিটি মূল ছবি হিসেবে দেখানো হবে। JPG, PNG বা WebP ছবি আপলোড করুন (সর্বোচ্চ ৮ MB)। ক্রম বদলাতে
              ছবি টেনে সাজান। নতুন আপলোড করা ছবি সরালে সাথে সাথে Cloudinary থেকেও মুছে যাবে; আগে সংরক্ষিত ছবি সরালে
              পণ্য সেভ করার সময় মুছে যাবে।
            </p>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext
                items={values.images.map((image) => image.key)}
                strategy={verticalListSortingStrategy}
              >
                <ol className="flex flex-col gap-3">
                  {values.images.map((image, index) => {
                    const rowError = errors.imageRows?.[index]
                    const fileId = `${fieldId('image-file')}-${index}`
                    const busy = uploadingIndex === index
                    const disabled = uploadingIndex !== null && !busy
                    return (
                      <SortableImageRow
                        key={image.key}
                        id={image.key}
                        disabled={uploadingIndex !== null}
                      >
                        {(handle) => (
                          <>
                            <button
                              type="button"
                              {...handle.attributes}
                              {...handle.listeners}
                              disabled={uploadingIndex !== null}
                              aria-label={`ছবি ${index + 1} টেনে সাজান`}
                              className="flex w-8 shrink-0 touch-none cursor-grab items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 active:cursor-grabbing disabled:pointer-events-none disabled:opacity-40"
                            >
                              <GripVertical className="size-5" aria-hidden="true" />
                            </button>
                            <ProductImage
                              src={image.url.trim() && isValidImageUrl(image.url) ? image.url.trim() : undefined}
                              alt={`ছবি ${index + 1} এর প্রিভিউ`}
                              className="size-20 shrink-0 rounded-lg border border-border"
                            />
                            <div className="flex min-w-0 flex-1 flex-col gap-2">
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                <span className="text-xs font-medium text-muted-foreground">
                                  ছবি {index + 1}
                                  {index === 0 ? ' (মূল)' : ''}
                                </span>
                                {image.publicId ? (
                                  <span className="text-xs text-muted-foreground">Cloudinary</span>
                                ) : null}
                              </div>
                              <p className="truncate text-xs text-muted-foreground">
                                {image.url || 'এখনো কোনো ছবি নেই'}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                <input
                                  id={fileId}
                                  type="file"
                                  accept="image/*"
                                  className="peer sr-only"
                                  disabled={uploadingIndex !== null}
                                  aria-describedby={rowError ? `${fileId}-error` : undefined}
                                  onChange={(event) => {
                                    const file = event.target.files?.[0]
                                    event.target.value = ''
                                    if (file) void uploadImage(index, file)
                                  }}
                                />
                                <label
                                  htmlFor={fileId}
                                  className={cn(
                                    buttonVariants({ variant: 'outline' }),
                                    'h-10 cursor-pointer px-3 peer-focus-visible:ring-2 peer-focus-visible:ring-ring/50',
                                    (busy || disabled) && 'pointer-events-none opacity-50',
                                  )}
                                >
                                  {busy ? (
                                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                                  ) : (
                                    <Upload className="size-4" aria-hidden="true" />
                                  )}
                                  {busy ? 'আপলোড হচ্ছে…' : image.url ? 'ছবি বদলান' : 'ছবি আপলোড করুন'}
                                </label>
                                <button
                                  type="button"
                                  disabled={values.images.length === 1 || uploadingIndex !== null}
                                  onClick={() => removeImage(index)}
                                  className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-border px-3 text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:pointer-events-none disabled:opacity-40"
                                >
                                  <Trash2 className="size-4" aria-hidden="true" />
                                  সরান
                                </button>
                              </div>
                              {rowError ? (
                                <p id={`${fileId}-error`} className="text-xs text-destructive">
                                  {rowError}
                                </p>
                              ) : null}
                            </div>
                          </>
                        )}
                      </SortableImageRow>
                    )
                  })}
                </ol>
              </SortableContext>
            </DndContext>
            <Button
              type="button"
              variant="outline"
              className="h-10 w-fit px-3"
              disabled={values.images.length >= 8 || uploadingIndex !== null}
              onClick={() => update({ images: [...values.images, withKey({ url: '', publicId: null })] })}
            >
              <Plus aria-hidden="true" />
              ছবি যোগ করুন
            </Button>
          </Fieldset>

          <Fieldset legend="স্পেসিফিকেশন" error={errors.specs} errorId={`${fieldId('specs')}-error`}>
            <ul className="flex flex-col gap-2">
              {values.specs.map((spec, index) => (
                <li key={index} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_2.75rem] gap-2">
                  <label htmlFor={`${fieldId('spec-label')}-${index}`} className="sr-only">
                    স্পেসিফিকেশন {index + 1} এর নাম
                  </label>
                  <input
                    id={`${fieldId('spec-label')}-${index}`}
                    value={spec.label}
                    placeholder="যেমন: ধারণক্ষমতা"
                    onChange={(e) => {
                      const specs = values.specs.map((s, i) => (i === index ? { ...s, label: e.target.value } : s))
                      update({ specs })
                    }}
                    className={inputClass}
                  />
                  <label htmlFor={`${fieldId('spec-value')}-${index}`} className="sr-only">
                    স্পেসিফিকেশন {index + 1} এর মান
                  </label>
                  <input
                    id={`${fieldId('spec-value')}-${index}`}
                    value={spec.value}
                    placeholder="যেমন: 250 লিটার"
                    onChange={(e) => {
                      const specs = values.specs.map((s, i) => (i === index ? { ...s, value: e.target.value } : s))
                      update({ specs })
                    }}
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      update({
                        specs:
                          values.specs.length === 1
                            ? [{ label: '', value: '' }]
                            : values.specs.filter((_, i) => i !== index),
                      })
                    }
                    className="inline-flex size-11 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                    <span className="sr-only">স্পেসিফিকেশন {index + 1} সরান</span>
                  </button>
                </li>
              ))}
            </ul>
            <Button
              type="button"
              variant="outline"
              className="h-10 w-fit px-3"
              onClick={() => update({ specs: [...values.specs, { label: '', value: '' }] })}
            >
              <Plus aria-hidden="true" />
              স্পেসিফিকেশন যোগ করুন
            </Button>
          </Fieldset>
        </div>

        <aside className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
          <Fieldset legend="দৃশ্যমানতা ও স্টক">
            <Field label="স্টক" id={fieldId('availability')}>
              <select
                id={fieldId('availability')}
                value={values.availability}
                onChange={(e) => update({ availability: e.target.value as ProductFormValues['availability'] })}
                className={inputClass}
              >
                {availabilityOptions.map((a) => (
                  <option key={a} value={a}>
                    {availabilityLabel[a]}
                  </option>
                ))}
              </select>
            </Field>
            <Toggle
              label="প্রকাশিত"
              description="ওয়েবসাইটে সবাই দেখতে পাবে।"
              checked={values.published}
              onChange={(published) => update({ published })}
            />
            <Toggle
              label="নির্বাচিত"
              description="হোমপেজের নির্বাচিত অংশে দেখানো হবে।"
              checked={values.featured}
              onChange={(featured) => update({ featured })}
            />
          </Fieldset>

          <div className="flex flex-col-reverse gap-2 sm:flex-row lg:flex-col">
            <Link href={adminRoutes.products} className={cn(buttonVariants({ variant: 'outline' }), 'h-11 px-4 sm:flex-1 lg:flex-none')}>
              বাতিল
            </Link>
            <Button type="submit" disabled={saving} className="h-11 px-4 sm:flex-1 lg:flex-none">
              {saving ? 'সংরক্ষণ হচ্ছে…' : isEdit ? 'পরিবর্তন সংরক্ষণ' : 'পণ্য যোগ করুন'}
            </Button>
          </div>
        </aside>
      </div>
    </form>
  )
}

function Fieldset({
  legend,
  required,
  error,
  errorId,
  children,
}: {
  legend: string
  required?: boolean
  error?: string
  errorId?: string
  children: React.ReactNode
}) {
  return (
    <fieldset className="flex min-w-0 flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:p-5">
      <legend className="sr-only">{legend}</legend>
      <div aria-hidden="true" className="text-base font-semibold">
        {legend}
        {required ? <span className="text-destructive"> *</span> : null}
      </div>
      {error ? (
        <p id={errorId} role="alert" className="-mt-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {children}
    </fieldset>
  )
}

function Field({
  label,
  id,
  required,
  error,
  hint,
  children,
}: {
  label: string
  id: string
  required?: boolean
  error?: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
        {required ? (
          <>
            <span aria-hidden="true" className="text-destructive">
              {' *'}
            </span>
            <span className="sr-only"> (আবশ্যক)</span>
          </>
        ) : null}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="truncate text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-border p-3 hover:bg-muted/50">
      <span className="flex flex-col">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs text-muted-foreground">{description}</span>
      </span>
      <span className="relative inline-flex shrink-0">
        <input
          type="checkbox"
          role="switch"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className="h-6 w-11 rounded-full bg-muted-foreground/30 transition-colors peer-checked:bg-primary peer-focus-visible:ring-3 peer-focus-visible:ring-ring/50"
        />
        <span
          aria-hidden="true"
          className="absolute left-0.5 top-0.5 size-5 rounded-full bg-card shadow transition-transform peer-checked:translate-x-5"
        />
      </span>
    </label>
  )
}
