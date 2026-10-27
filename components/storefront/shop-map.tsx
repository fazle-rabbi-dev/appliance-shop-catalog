import { mapLinks, shopConfig } from '@/lib/shop-config'

export function ShopMapSection() {
  return (
    <section aria-labelledby="map-title" className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
      <h2 id="map-title" className="sr-only">
        দোকানের লোকেশন
      </h2>
      <div className="overflow-hidden rounded-2xl border border-border bg-muted">
        <iframe
          src={mapLinks.embed}
          title={`${shopConfig.name} — গুগল ম্যাপে দোকানের লোকেশন`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
          className="block h-80 w-full border-0 sm:h-96"
        />
      </div>
    </section>
  )
}
