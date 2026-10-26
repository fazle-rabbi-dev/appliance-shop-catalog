'use server'

import { redirect } from 'next/navigation'
import { signIn, signOut } from '@/lib/data/auth'
import { adminRoutes } from '@/lib/routes'

export interface LoginState {
  error?: string
}

function safeNext(value: string) {
  if (!value.startsWith('/') || value.startsWith('//')) return adminRoutes.dashboard
  return value
}

export async function signInAction(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get('username') ?? '')
  const password = String(formData.get('password') ?? '')
  const next = safeNext(String(formData.get('next') ?? ''))

  try {
    await signIn(username, password)
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Could not sign in.' }
  }

  redirect(next)
}

export async function signOutAction(): Promise<void> {
  await signOut()
  redirect('/login')
}
