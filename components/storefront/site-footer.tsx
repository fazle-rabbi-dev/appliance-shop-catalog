import { Suspense } from 'react'
import Link from 'next/link'
import { connection } from 'next/server'
import { productsHref } from '@/lib/routes'
import { shopConfig } from '@/lib/shop-config'
import type { Category } from '@/lib/types'

async function FooterYear() {
  await connection()
  return new Date().getFullYear()
}

export function SiteFooter({ categories }: { categories: Category[] }) {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold">{shopConfig.name}</p>
          <p className="text-sm leading-relaxed text-muted-foreground">{shopConfig.tagline}</p>
        </div>
        <nav aria-label="ক্যাটাগরি" className="flex flex-col gap-2">
          <p className="text-sm font-semibold">ক্যাটাগরি</p>
          <ul className="flex flex-col gap-1.5">
            {categories.map((c) => (
              <li key={c.id}>
                <Link href={productsHref({ category: c.slug })} className="text-sm text-muted-foreground hover:text-foreground">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold">যোগাযোগ</p>
          <a href={shopConfig.phoneHref} className="text-sm text-muted-foreground hover:text-foreground">
            {shopConfig.phoneDisplay}
          </a>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {shopConfig.address.line1}, {shopConfig.address.line2}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold">জেনে রাখুন</p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            দেখানো দাম কেবল ধারণার জন্য, পরিবর্তন হতে পারে। আসার আগে দোকানে নিশ্চিত করে নিন।
          </p>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>
            © <Suspense fallback={null}><FooterYear /></Suspense> {shopConfig.name}। ডেমো ওয়েবসাইট।
          </p>
          <Link href="/login" className="hover:text-foreground">
            স্টাফ লগইন
          </Link>
        </div>
      </div>
    </footer>
  )
}
