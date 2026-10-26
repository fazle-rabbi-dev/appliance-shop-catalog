import { availabilityLabel } from '@/lib/format'
import type { Availability } from '@/lib/types'
import { cn } from '@/lib/utils'

const styles: Record<Availability, string> = {
  in_stock: 'bg-success-soft text-success',
  low_stock: 'bg-warning-soft text-warning',
  out_of_stock: 'bg-secondary text-muted-foreground',
}

const dot: Record<Availability, string> = {
  in_stock: 'bg-success',
  low_stock: 'bg-warning',
  out_of_stock: 'bg-muted-foreground',
}

export function AvailabilityBadge({ value, className }: { value: Availability; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        styles[value],
        className,
      )}
    >
      <span className={cn('size-1.5 rounded-full', dot[value])} aria-hidden="true" />
      {availabilityLabel[value]}
    </span>
  )
}
