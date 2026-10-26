'use client'

import { AlertCircle, CheckCircle2, X } from 'lucide-react'
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

type ToastTone = 'success' | 'error'

interface Toast {
  id: number
  message: string
  tone: ToastTone
}

interface ToastContextValue {
  notify: (message: string, tone?: ToastTone) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(1)

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id))
  }, [])

  const notify = useCallback(
    (message: string, tone: ToastTone = 'success') => {
      const id = nextId.current++
      setToasts((current) => [...current.slice(-2), { id, message, tone }])
      window.setTimeout(() => dismiss(id), 3800)
    },
    [dismiss],
  )

  const value = useMemo(() => ({ notify }), [notify])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4 sm:items-end sm:px-6"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.tone === 'error' ? 'alert' : 'status'}
            className={cn(
              'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border bg-card p-3.5 text-sm shadow-lg animate-in fade-in slide-in-from-bottom-2',
              toast.tone === 'error' ? 'border-destructive/30' : 'border-border',
            )}
          >
            {toast.tone === 'error' ? (
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
            ) : (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
            )}
            <p className="flex-1 leading-relaxed text-card-foreground">{toast.message}</p>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              className="rounded p-0.5 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" aria-hidden="true" />
              <span className="sr-only">Dismiss notification</span>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}
