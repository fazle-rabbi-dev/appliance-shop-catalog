'use client'

import { AlertCircle, Loader2, LockKeyhole } from 'lucide-react'
import Link from 'next/link'
import { useActionState } from 'react'
import { signInAction, type LoginState } from '@/lib/actions/auth'
import { shopConfig } from '@/lib/shop-config'

const initialState: LoginState = {}

export function LoginForm({
  next,
  demo,
}: {
  next: string
  demo: { email: string; password: string } | null
}) {
  const [state, formAction, pending] = useActionState(signInAction, initialState)

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-surface px-4 py-12">
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="flex size-11 items-center justify-center rounded-xl bg-foreground text-background">
          <LockKeyhole className="size-5" aria-hidden="true" />
        </span>
        <h1 className="text-2xl font-semibold tracking-tight">Staff sign in</h1>
        <p className="text-sm text-muted-foreground">Manage the {shopConfig.name} catalog.</p>
      </div>

      <form action={formAction} className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-border bg-card p-5 sm:p-6">
        <input type="hidden" name="next" value={next} />

        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            required
            defaultValue={demo?.email}
            aria-invalid={Boolean(state.error)}
            className="h-11 w-full rounded-lg border border-input bg-card px-3 text-base sm:text-sm aria-invalid:border-destructive"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            defaultValue={demo?.password}
            aria-invalid={Boolean(state.error)}
            className="h-11 w-full rounded-lg border border-input bg-card px-3 text-base sm:text-sm aria-invalid:border-destructive"
          />
        </div>

        {state.error ? (
          <p role="alert" className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-2.5 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {state.error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
          {pending ? 'Signing in…' : 'Sign in'}
        </button>

        {demo ? (
          <p className="rounded-lg bg-muted p-2.5 text-xs leading-relaxed text-muted-foreground">
            Demo account: <span className="font-medium text-foreground">{demo.email}</span> /{' '}
            <span className="font-medium text-foreground">{demo.password}</span>
          </p>
        ) : null}
      </form>

      <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
        Back to storefront
      </Link>
    </div>
  )
}
