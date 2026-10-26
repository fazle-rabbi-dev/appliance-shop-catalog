import { ArrowRight, BadgeCheck, HandHelping, MapPin, Phone, Store } from 'lucide-react'
import Link from 'next/link'
import { homeSectionHref, productsHref } from '@/lib/routes'
import { shopConfig } from '@/lib/shop-config'

export function HeroSection() {
  return (
    <section aria-labelledby="hero-title" className="border-b border-border">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:py-16 lg:grid-cols-12 lg:items-center lg:gap-12 lg:px-8 lg:py-20">
        <div className="flex flex-col gap-6 lg:col-span-6">
          <p className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <MapPin className="size-3.5 text-primary" aria-hidden="true" />
            {shopConfig.address.line1}
          </p>
          <h1 id="hero-title" className="text-4xl leading-[1.08] font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Quality home appliances, close to home.
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg">
            Explore the refrigerators, rice cookers, TVs and fans we carry at {shopConfig.name}. Check the price and
            whether it&apos;s on the shelf before you visit.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href={productsHref()}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90 active:translate-y-px"
            >
              Explore Products
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              href={homeSectionHref('contact')}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-border bg-card px-6 text-base font-medium transition-colors hover:bg-muted active:translate-y-px"
            >
              <Phone className="size-4" aria-hidden="true" />
              Contact Shop
            </Link>
          </div>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Store className="size-4 text-primary" aria-hidden="true" />
              Locally owned
            </li>
            <li className="flex items-center gap-2">
              <BadgeCheck className="size-4 text-primary" aria-hidden="true" />
              Genuine brand products
            </li>
            <li className="flex items-center gap-2">
              <HandHelping className="size-4 text-primary" aria-hidden="true" />
              Helpful in-store advice
            </li>
          </ul>
        </div>

        <div className="lg:col-span-6">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-surface">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/hero-kitchen.png"
              alt="A refrigerator, rice cooker, blender and table fan arranged together in a bright kitchen"
              className="aspect-[4/3] w-full object-cover"
              fetchPriority="high"
            />
            <div className="absolute right-3 bottom-3 left-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card/95 px-4 py-3 backdrop-blur sm:right-4 sm:bottom-4 sm:left-auto sm:max-w-xs">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Open today</span>
                <span className="text-sm font-semibold">{shopConfig.hours[0].time}</span>
              </div>
              <Link href={homeSectionHref('contact')} className="text-sm font-medium text-primary hover:underline">
                Visit us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
