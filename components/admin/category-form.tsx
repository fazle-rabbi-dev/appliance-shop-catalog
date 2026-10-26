'use client'

import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useId, useState } from 'react'
import { CategoryIcon } from '@/components/shared/category-icon'
import { useToast } from '@/components/shared/toast-provider'
import { Button, buttonVariants } from '@/components/ui/button'
import { saveCategoryAction } from '@/lib/actions/categories'
import {
  categoryIconLabels,
  categoryIcons,
  hasCategoryErrors,
  toCategoryInput,
  validateCategory,
  type CategoryFormErrors,
  type CategoryFormValues,
} from '@/lib/category-validation'
import { slugify } from '@/lib/format'
import { adminRoutes } from '@/lib/routes'
import type { Category } from '@/lib/types'
import { cn } from '@/lib/utils'

const inputClass =
  'h-11 w-full rounded-lg border border-input bg-card px-3 text-base sm:text-sm aria-invalid:border-destructive'

function toFormValues(category?: Category): CategoryFormValues {
  if (!category) {
    return { name: '', slug: '', icon: 'plug', description: '' }
  }
  return {
    name: category.name,
    slug: category.slug,
    icon: category.icon,
    description: category.description,
  }
}

export function CategoryForm({ category }: { category?: Category }) {
  const router = useRouter()
  const { notify } = useToast()
  const uid = useId()
  const [values, setValues] = useState<CategoryFormValues>(() => toFormValues(category))
  const [errors, setErrors] = useState<CategoryFormErrors>({})
  const [slugTouched, setSlugTouched] = useState(Boolean(category))
  const [saving, setSaving] = useState(false)

  const isEdit = Boolean(category)
  const fieldId = (name: string) => `${uid}-${name}`

  function update(patch: Partial<CategoryFormValues>) {
    setValues((current) => {
      const next = { ...current, ...patch }
      if (patch.name !== undefined && !slugTouched) next.slug = slugify(patch.name)
      return next
    })
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const found = validateCategory(values)
    setErrors(found)
    if (hasCategoryErrors(found)) {
      notify('Please fix the highlighted fields.', 'error')
      return
    }

    setSaving(true)
    const input = toCategoryInput(values)
    const result = await saveCategoryAction(category?.id ?? null, input)

    if (!result.ok) {
      notify(result.error, 'error')
      setSaving(false)
      return
    }

    notify(isEdit ? `Saved changes to “${input.name}”.` : `Added “${input.name}”.`)
    router.push(adminRoutes.categories)
    router.refresh()
  }

  const errorId = (name: keyof CategoryFormErrors) => (errors[name] ? `${fieldId(name)}-error` : undefined)

  return (
    <form noValidate onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link
          href={adminRoutes.categories}
          className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to categories
        </Link>
        <h1 className="text-2xl font-semibold text-balance sm:text-3xl">
          {isEdit ? `Edit ${category?.name}` : 'Add a category'}
        </h1>
        <p className="text-sm text-muted-foreground">Categories group products on the storefront menu and homepage.</p>
      </div>

      <fieldset className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:p-5">
        <legend className="sr-only">Category details</legend>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={fieldId('name')} className="text-sm font-medium">
            Name <span className="text-destructive">*</span>
          </label>
          <input
            id={fieldId('name')}
            value={values.name}
            onChange={(e) => update({ name: e.target.value })}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errorId('name')}
            autoComplete="off"
            className={inputClass}
          />
          {errors.name ? (
            <p id={errorId('name')} className="text-xs text-destructive">
              {errors.name}
            </p>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor={fieldId('slug')} className="text-sm font-medium">
              URL slug <span className="text-destructive">*</span>
            </label>
            <input
              id={fieldId('slug')}
              value={values.slug}
              onChange={(e) => {
                setSlugTouched(true)
                update({ slug: e.target.value.toLowerCase() })
              }}
              aria-invalid={Boolean(errors.slug)}
              aria-describedby={errorId('slug')}
              autoComplete="off"
              spellCheck={false}
              className={cn(inputClass, 'font-mono')}
            />
            {errors.slug ? (
              <p id={errorId('slug')} className="text-xs text-destructive">
                {errors.slug}
              </p>
            ) : (
              <p className="truncate text-xs text-muted-foreground">
                {`Storefront link: /products?category=${values.slug || 'your-category'}`}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor={fieldId('icon')} className="text-sm font-medium">
              Icon
            </label>
            <div className="flex items-center gap-2">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-surface text-foreground">
                <CategoryIcon name={values.icon} className="size-5" />
              </span>
              <select
                id={fieldId('icon')}
                value={values.icon}
                onChange={(e) => update({ icon: e.target.value as CategoryFormValues['icon'] })}
                aria-invalid={Boolean(errors.icon)}
                aria-describedby={errorId('icon')}
                className={inputClass}
              >
                {categoryIcons.map((icon) => (
                  <option key={icon} value={icon}>
                    {categoryIconLabels[icon]}
                  </option>
                ))}
              </select>
            </div>
            {errors.icon ? (
              <p id={errorId('icon')} className="text-xs text-destructive">
                {errors.icon}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={fieldId('description')} className="text-sm font-medium">
            Description
          </label>
          <textarea
            id={fieldId('description')}
            rows={3}
            value={values.description}
            onChange={(e) => update({ description: e.target.value })}
            aria-invalid={Boolean(errors.description)}
            aria-describedby={errorId('description')}
            placeholder="Single door, double door and side-by-side"
            className={cn(inputClass, 'h-auto py-2.5 leading-relaxed')}
          />
          {errors.description ? (
            <p id={errorId('description')} className="text-xs text-destructive">
              {errors.description}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">{values.description.length}/160</p>
          )}
        </div>
      </fieldset>

      <div className="flex flex-col-reverse gap-2 sm:flex-row">
        <Link href={adminRoutes.categories} className={cn(buttonVariants({ variant: 'outline' }), 'h-11 px-4')}>
          Cancel
        </Link>
        <Button type="submit" disabled={saving} className="h-11 px-4">
          {saving ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
          {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add category'}
        </Button>
      </div>
    </form>
  )
}
