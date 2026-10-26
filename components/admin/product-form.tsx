'use client'

import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useId, useState } from 'react'
import { ProductImage } from '@/components/shared/product-image'
import { useToast } from '@/components/shared/toast-provider'
import { Button, buttonVariants } from '@/components/ui/button'
import { saveProductAction } from '@/lib/actions/catalog'
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
import type { Category, Product } from '@/lib/types'
import { cn } from '@/lib/utils'

function toFormValues(product?: Product): ProductFormValues {
  if (!product) {
    return {
      name: '',
      slug: '',
      categoryId: '',
      brand: '',
      model: '',
      price: '',
      description: '',
      images: [''],
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
    images: product.images.length ? [...product.images] : [''],
    specs: product.specs.length ? product.specs.map((s) => ({ ...s })) : [{ label: '', value: '' }],
    availability: product.availability,
    published: product.published,
    featured: product.featured,
  }
}

const inputClass =
  'h-11 w-full rounded-lg border border-input bg-card px-3 text-base sm:text-sm aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/15'

export function ProductForm({ product, categories }: { product?: Product; categories: Category[] }) {
  const router = useRouter()
  const { notify } = useToast()
  const uid = useId()
  const [values, setValues] = useState<ProductFormValues>(() => toFormValues(product))
  const [errors, setErrors] = useState<ProductFormErrors>({})
  const [slugTouched, setSlugTouched] = useState(Boolean(product))
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)

  const isEdit = Boolean(product)
  const fieldId = (name: string) => `${uid}-${name}`

  function collectErrors(next: ProductFormValues) {
    return validateProduct(next)
  }

  function update(patch: Partial<ProductFormValues>) {
    setValues((current) => {
      const next = { ...current, ...patch }
      if (patch.name !== undefined && !slugTouched) next.slug = slugify(patch.name)
      if (submitted) setErrors(collectErrors(next))
      return next
    })
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
    const found = collectErrors(values)
    setErrors(found)
    if (hasErrors(found)) {
      notify('Please fix the highlighted fields.', 'error')
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

    notify(product ? `Saved changes to “${input.name}”.` : `Added “${input.name}”.`)
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
          Back to products
        </Link>
        <h1 className="text-2xl font-semibold text-balance sm:text-3xl">
          {isEdit ? `Edit ${product?.name}` : 'Add a product'}
        </h1>
        <p className="text-sm text-muted-foreground">
          Fields marked <span aria-hidden="true">*</span>
          <span className="sr-only">with an asterisk</span> are required.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex flex-col gap-6">
          <Fieldset legend="Basic details">
            <Field label="Product name" required id={fieldId('name')} error={errors.name}>
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
              label="URL slug"
              required
              id={fieldId('slug')}
              error={errors.slug}
              hint={`Page address: ${productHref(values.slug || 'your-product')}`}
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
              <Field label="Category" required id={fieldId('categoryId')} error={errors.categoryId}>
                <select
                  id={fieldId('categoryId')}
                  value={values.categoryId}
                  onChange={(e) => update({ categoryId: e.target.value })}
                  aria-invalid={Boolean(errors.categoryId)}
                  aria-describedby={errorId('categoryId')}
                  className={inputClass}
                >
                  <option value="">Choose a category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Price (BDT)" required id={fieldId('price')} error={errors.price}>
                <div className="relative">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
                  >
                    Tk
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
              <Field label="Brand" required id={fieldId('brand')} error={errors.brand}>
                <input
                  id={fieldId('brand')}
                  value={values.brand}
                  onChange={(e) => update({ brand: e.target.value })}
                  aria-invalid={Boolean(errors.brand)}
                  aria-describedby={errorId('brand')}
                  className={inputClass}
                />
              </Field>
              <Field label="Model" id={fieldId('model')}>
                <input
                  id={fieldId('model')}
                  value={values.model}
                  onChange={(e) => update({ model: e.target.value })}
                  className={inputClass}
                />
              </Field>
            </div>

            <Field label="Description" required id={fieldId('description')} error={errors.description}>
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

          <Fieldset legend="Images" required error={errors.images} errorId={`${fieldId('images')}-error`}>
            <p className="text-sm leading-relaxed text-muted-foreground">
              The first image is used as the main photo. Use full https:// links or paths like /images/fan.png.
            </p>
            <ol className="flex flex-col gap-3">
              {values.images.map((url, index) => {
                const rowError = errors.imageRows?.[index]
                const rowId = `${fieldId('image')}-${index}`
                return (
                  <li key={index} className="flex gap-3">
                    <ProductImage
                      src={url.trim() && isValidImageUrl(url) ? url.trim() : undefined}
                      alt={`Preview of image ${index + 1}`}
                      className="size-16 shrink-0 rounded-lg border border-border"
                    />
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <label htmlFor={rowId} className="text-xs font-medium text-muted-foreground">
                        Image {index + 1}
                        {index === 0 ? ' (main)' : ''}
                      </label>
                      <div className="flex gap-2">
                        <input
                          id={rowId}
                          type="url"
                          inputMode="url"
                          value={url}
                          placeholder="https://…"
                          onChange={(e) => {
                            const images = [...values.images]
                            images[index] = e.target.value
                            update({ images })
                          }}
                          aria-invalid={Boolean(rowError || (errors.images && index === 0))}
                          aria-describedby={rowError ? `${rowId}-error` : errors.images ? `${fieldId('images')}-error` : undefined}
                          className={inputClass}
                        />
                        <button
                          type="button"
                          disabled={values.images.length === 1}
                          onClick={() => update({ images: values.images.filter((_, i) => i !== index) })}
                          className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:pointer-events-none disabled:opacity-40"
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                          <span className="sr-only">Remove image {index + 1}</span>
                        </button>
                      </div>
                      {rowError ? (
                        <p id={`${rowId}-error`} className="text-xs text-destructive">
                          {rowError}
                        </p>
                      ) : null}
                    </div>
                  </li>
                )
              })}
            </ol>
            <Button
              type="button"
              variant="outline"
              className="h-10 w-fit px-3"
              disabled={values.images.length >= 8}
              onClick={() => update({ images: [...values.images, ''] })}
            >
              <Plus aria-hidden="true" />
              Add image URL
            </Button>
          </Fieldset>

          <Fieldset legend="Specifications" error={errors.specs} errorId={`${fieldId('specs')}-error`}>
            <ul className="flex flex-col gap-2">
              {values.specs.map((spec, index) => (
                <li key={index} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_2.75rem] gap-2">
                  <label htmlFor={`${fieldId('spec-label')}-${index}`} className="sr-only">
                    Specification {index + 1} label
                  </label>
                  <input
                    id={`${fieldId('spec-label')}-${index}`}
                    value={spec.label}
                    placeholder="e.g. Capacity"
                    onChange={(e) => {
                      const specs = values.specs.map((s, i) => (i === index ? { ...s, label: e.target.value } : s))
                      update({ specs })
                    }}
                    className={inputClass}
                  />
                  <label htmlFor={`${fieldId('spec-value')}-${index}`} className="sr-only">
                    Specification {index + 1} value
                  </label>
                  <input
                    id={`${fieldId('spec-value')}-${index}`}
                    value={spec.value}
                    placeholder="e.g. 250 litres"
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
                    <span className="sr-only">Remove specification {index + 1}</span>
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
              Add specification
            </Button>
          </Fieldset>
        </div>

        <aside className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
          <Fieldset legend="Visibility & stock">
            <Field label="Availability" id={fieldId('availability')}>
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
              label="Published"
              description="Visible on the public website."
              checked={values.published}
              onChange={(published) => update({ published })}
            />
            <Toggle
              label="Featured"
              description="Shown in the homepage highlights."
              checked={values.featured}
              onChange={(featured) => update({ featured })}
            />
          </Fieldset>

          <div className="flex flex-col-reverse gap-2 sm:flex-row lg:flex-col">
            <Link href={adminRoutes.products} className={cn(buttonVariants({ variant: 'outline' }), 'h-11 px-4 sm:flex-1 lg:flex-none')}>
              Cancel
            </Link>
            <Button type="submit" disabled={saving} className="h-11 px-4 sm:flex-1 lg:flex-none">
              {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add product'}
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
            <span className="sr-only"> (required)</span>
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
