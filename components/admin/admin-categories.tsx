'use client'

import { Pencil, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useState, useTransition } from 'react'
import { CategoryIcon } from '@/components/shared/category-icon'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { useToast } from '@/components/shared/toast-provider'
import { buttonVariants } from '@/components/ui/button'
import { deleteCategoryAction } from '@/lib/actions/categories'
import { adminRoutes } from '@/lib/routes'
import type { Category } from '@/lib/types'
import { cn } from '@/lib/utils'

export function AdminCategories({
  categories,
  counts,
}: {
  categories: Category[]
  counts: Record<string, number>
}) {
  const { notify } = useToast()
  const [isPending, startTransition] = useTransition()
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null)

  const pendingCount = pendingDelete ? (counts[pendingDelete.id] ?? 0) : 0

  function confirmDelete() {
    if (!pendingDelete) return
    const target = pendingDelete

    startTransition(async () => {
      const result = await deleteCategoryAction(target.id)
      notify(
        result.ok ? `“${target.name}” মুছে ফেলা হয়েছে।` : result.error,
        result.ok ? 'success' : 'error',
      )
      if (result.ok) setPendingDelete(null)
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold sm:text-3xl">ক্যাটাগরি</h1>
          <p className="text-sm text-muted-foreground">
            মোট {categories.length}টি · ওয়েবসাইটের মেনু ও ফিল্টারে দেখা যায়।
          </p>
        </div>
        <Link href={adminRoutes.newCategory} className={cn(buttonVariants(), 'h-11 gap-2 px-4')}>
          <Plus aria-hidden="true" />
          ক্যাটাগরি যোগ করুন
        </Link>
      </div>

      {categories.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card p-10 text-center">
          <p className="font-medium">এখনো কোনো ক্যাটাগরি নেই।</p>
          <p className="text-sm text-muted-foreground">পণ্য যোগ করার আগে একটি ক্যাটাগরি তৈরি করুন।</p>
        </div>
      ) : (
        <ul className="flex flex-col overflow-hidden rounded-xl border border-border bg-card" aria-busy={isPending}>
          {categories.map((category) => {
            const count = counts[category.id] ?? 0
            return (
              <li
                key={category.id}
                className="flex flex-wrap items-center gap-3 border-b border-border p-3 last:border-b-0 sm:flex-nowrap sm:gap-4 sm:p-4"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-surface text-foreground">
                  <CategoryIcon name={category.icon} className="size-5" />
                </span>

                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate font-medium">{category.name}</span>
                  <span className="truncate font-mono text-xs text-muted-foreground">/{category.slug}</span>
                  {category.description ? (
                    <span className="truncate text-xs text-muted-foreground">{category.description}</span>
                  ) : null}
                </div>

                <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground tabular-nums">
                  {count}টি পণ্য
                </span>

                <div className="ml-auto flex items-center gap-1 sm:ml-0">
                  <Link
                    href={adminRoutes.editCategory(category.id)}
                    className="inline-flex size-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <Pencil className="size-4" aria-hidden="true" />
                    <span className="sr-only">{category.name} সম্পাদনা করুন</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => setPendingDelete(category)}
                    disabled={count > 0}
                    title={count > 0 ? 'আগে এই ক্যাটাগরির পণ্য সরান বা মুছুন' : undefined}
                    className="inline-flex size-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:pointer-events-none disabled:opacity-40"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                    <span className="sr-only">
                      {category.name} মুছুন
                      {count > 0 ? ' (মোছা যাবে না: ক্যাটাগরিতে এখনো পণ্য আছে)' : ''}
                    </span>
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="এই ক্যাটাগরিটি মুছবেন?"
        description={
          pendingDelete
            ? pendingCount > 0
              ? `“${pendingDelete.name}” এ এখনো ${pendingCount}টি পণ্য আছে। আগে সেগুলো সরান বা মুছুন।`
              : `“${pendingDelete.name}” ওয়েবসাইট থেকে মুছে যাবে। এটি ফিরিয়ে আনা যাবে না।`
            : ''
        }
        confirmLabel="ক্যাটাগরি মুছুন"
        pending={isPending}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  )
}
