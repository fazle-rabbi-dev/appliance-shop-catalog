import type { Availability } from './types'

const takaFormatter = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 })

const bengaliDate = new Intl.DateTimeFormat('bn-BD-u-nu-latn', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

export function formatTaka(value: number) {
  return `৳ ${takaFormatter.format(value)}`
}

export const availabilityLabel: Record<Availability, string> = {
  in_stock: 'স্টকে আছে',
  low_stock: 'সীমিত স্টক',
  out_of_stock: 'স্টক নেই',
}

export const availabilityOptions: Availability[] = ['in_stock', 'low_stock', 'out_of_stock']

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

export function formatDate(iso: string) {
  return bengaliDate.format(new Date(iso))
}
