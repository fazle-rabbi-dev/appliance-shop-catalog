import { Blender, CookingPot, Fan, Plug, Refrigerator, Tv, type LucideIcon } from 'lucide-react'
import type { CategoryIcon as CategoryIconName } from '@/lib/types'

const icons: Record<CategoryIconName, LucideIcon> = {
  refrigerator: Refrigerator,
  'rice-cooker': CookingPot,
  tv: Tv,
  fan: Fan,
  blender: Blender,
  plug: Plug,
}

export function CategoryIcon({ name, className }: { name: CategoryIconName; className?: string }) {
  const Icon = icons[name] ?? Plug
  return <Icon className={className} aria-hidden="true" />
}
