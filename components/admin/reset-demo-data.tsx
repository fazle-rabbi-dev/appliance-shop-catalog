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
      notify(result.ok ? 'ডেমো ডেটা ফিরিয়ে আনা হয়েছে।' : result.error, result.ok ? 'success' : 'error')
      setOpen(false)
    })
  }

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        ডেমো ডেটা রিসেট
      </Button>
      <ConfirmDialog
        open={open}
        title="সব ডেমো ডেটা রিসেট করবেন?"
        description="আপনি যে পণ্য যোগ, সম্পাদনা বা মুছে ফেলেছেন সবগুলো মুছে গিয়ে আগের নমুনা ক্যাটালগ ফিরে আসবে।"
        confirmLabel="ডেটা রিসেট"
        pending={pending}
        onConfirm={handleConfirm}
        onCancel={() => setOpen(false)}
      />
    </>
  )
}
