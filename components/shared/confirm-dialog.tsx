'use client'

import { useEffect, useId, useRef } from 'react'
import { Button } from '@/components/ui/button'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  pending?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({ open, title, description, confirmLabel, pending, onConfirm, onCancel }: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const descId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={descId}
      onCancel={(event) => {
        event.preventDefault()
        onCancel()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onCancel()
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-xl border border-border bg-card p-0 text-card-foreground shadow-xl backdrop:bg-foreground/40"
    >
      <div className="flex flex-col gap-2 p-6">
        <h2 id={titleId} className="text-lg font-semibold text-balance">
          {title}
        </h2>
        <p id={descId} className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
      <div className="flex flex-col-reverse gap-2 border-t border-border bg-muted/50 px-6 py-4 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onCancel} disabled={pending} autoFocus>
          Cancel
        </Button>
        <Button variant="destructive" onClick={onConfirm} disabled={pending}>
          {pending ? 'Deleting…' : confirmLabel}
        </Button>
      </div>
    </dialog>
  )
}
