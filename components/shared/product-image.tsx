'use client'

import { ImageOff } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface ProductImageProps {
  src?: string
  alt: string
  className?: string
  imgClassName?: string
  eager?: boolean
}

export function ProductImage({ src, alt, className, imgClassName, eager }: ProductImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const failed = !src || failedSrc === src

  return (
    <div className={cn('relative overflow-hidden bg-surface', className)}>
      {failed ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
          <ImageOff className="size-6" aria-hidden="true" />
          <span className="text-xs">Image unavailable</span>
          <span className="sr-only">{alt}</span>
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- admin-supplied URLs can be any host
        <img
          src={src}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onError={() => setFailedSrc(src)}
          className={cn('h-full w-full object-contain', imgClassName)}
        />
      )}
    </div>
  )
}
