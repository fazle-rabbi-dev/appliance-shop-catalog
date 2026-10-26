import type { Availability } from './types'

const takaFormatter = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 })

export function formatTaka(value: number) {
  return `Tk ${takaFormatter.format(value)}`
}

export const availabilityLabel: Record<Availability, string> = {
  in_stock: 'In stock',
  low_stock: 'Limited stock',
  out_of_stock: 'Out of stock',
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
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
