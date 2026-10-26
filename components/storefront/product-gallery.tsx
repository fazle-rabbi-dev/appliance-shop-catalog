'use client'

import { useState } from 'react'
import { ProductImage } from '@/components/shared/product-image'
import { cn } from '@/lib/utils'

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const safeIndex = Math.min(activeIndex, images.length - 1)

  return (
    <div className="flex flex-col gap-3">
      <ProductImage
        key={images[safeIndex]}
        src={images[safeIndex]}
        alt={`${name}, ছবি ${safeIndex + 1}/${images.length}`}
        className="aspect-square rounded-2xl border border-border sm:aspect-[4/3]"
        imgClassName="p-6 sm:p-10"
        eager
      />
      {images.length > 1 ? (
        <ul className="flex gap-3" aria-label="পণ্যের ছবি">
          {images.map((src, index) => (
            <li key={`${src}-${index}`}>
              <button
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-pressed={index === safeIndex}
                className={cn(
                  'block overflow-hidden rounded-lg border-2 transition-colors',
                  index === safeIndex ? 'border-primary' : 'border-border hover:border-muted-foreground/40',
                )}
              >
                <ProductImage src={src} alt="" className="size-20" imgClassName="p-1.5" />
                <span className="sr-only">ছবি {index + 1} দেখান</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
