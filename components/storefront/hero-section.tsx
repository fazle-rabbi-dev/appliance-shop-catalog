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
            মানসম্মত হোম অ্যাপ্লায়েন্স, আপনার কাছেই।
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg">
            {shopConfig.name}-এ ফ্রিজ, রাইস কুকার, টিভি আর ফ্যান দেখে নিন। আসার আগেই দাম আর স্টক আছে কিনা জেনে নিন।
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href={productsHref()}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90 active:translate-y-px"
            >
              পণ্য দেখুন
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              href={homeSectionHref('contact')}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-border bg-card px-6 text-base font-medium transition-colors hover:bg-muted active:translate-y-px"
            >
              <Phone className="size-4" aria-hidden="true" />
              দোকানে যোগাযোগ
            </Link>
          </div>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Store className="size-4 text-primary" aria-hidden="true" />
              স্থানীয় মালিকানাধীন দোকান
            </li>
            <li className="flex items-center gap-2">
              <BadgeCheck className="size-4 text-primary" aria-hidden="true" />
              আসল ব্র্যান্ডের পণ্য
            </li>
            <li className="flex items-center gap-2">
              <HandHelping className="size-4 text-primary" aria-hidden="true" />
              দোকানে পরামর্শ
            </li>
          </ul>
        </div>

        <div className="lg:col-span-6">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-surface">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/hero-kitchen.png"
              alt="উজ্জ্বল রান্নাঘরে ফ্রিজ, রাইস কুকার, ব্লেন্ডার আর টেবিল ফ্যান একসাথে সাজানো"
              className="aspect-[4/3] w-full object-cover"
              fetchPriority="high"
            />
            <div className="absolute right-3 bottom-3 left-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card/95 px-4 py-3 backdrop-blur sm:right-4 sm:bottom-4 sm:left-auto sm:max-w-xs">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">আজ খোলা</span>
                <span className="text-sm font-semibold">{shopConfig.hours[0].time}</span>
              </div>
              <Link href={homeSectionHref('contact')} className="text-sm font-medium text-primary hover:underline">
                আসুন
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
