'use client'

import { useState, useTransition } from 'react'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { useToast } from '@/components/shared/toast-provider'
import { Button } from '@/components/ui/button'
import { resetDemoDataAction } from '@/lib/actions/catalog'

export function ResetDemoData() {
  const { notify } = useToast()
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  function handleConfirm() {
    startTransition(async () => {
      const result = await resetDemoDataAction()
      notify(result.ok ? 'Demo data restored.' : result.error, result.ok ? 'success' : 'error')
      setOpen(false)
    })
  }

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Reset demo data
      </Button>
      <ConfirmDialog
        open={open}
        title="Reset all demo data?"
        description="All products you added, edited or deleted will be replaced by the original sample catalog."
        confirmLabel="Reset data"
        pending={pending}
        onConfirm={handleConfirm}
        onCancel={() => setOpen(false)}
      />
    </>
  )
}
