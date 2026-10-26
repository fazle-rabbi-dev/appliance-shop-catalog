import { Clock, MapPin, MessageCircle, Phone } from 'lucide-react'
import { shopConfig, whatsappLink } from '@/lib/shop-config'

const reasons = [
  { title: 'See it in person', body: 'Open the fridge door, hear the fan, check the TV picture before you decide.' },
  { title: 'Honest advice', body: 'We help you choose the right size and model for your home and budget.' },
  { title: 'Local support', body: 'Questions after you buy? We are just down the road, not a phone queue.' },
]

export function AboutSection() {
  return (
    <section id="about" aria-labelledby="about-title" className="border-y border-border bg-card">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-12 lg:px-8">
        <div className="flex flex-col gap-4 lg:col-span-5">
          <h2 id="about-title" className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            Your neighbourhood appliance shop
          </h2>
          <p className="text-base leading-relaxed text-pretty text-muted-foreground">{shopConfig.intro}</p>
        </div>
        <ul className="grid gap-6 sm:grid-cols-3 lg:col-span-7">
          {reasons.map((reason) => (
            <li key={reason.title} className="flex flex-col gap-2 border-t border-border pt-4">
              <h3 className="text-base font-semibold">{reason.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{reason.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export function ContactSection() {
  const { address, hours } = shopConfig
  return (
    <section id="contact" aria-labelledby="contact-title" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-2xl bg-foreground text-background">
        <div className="grid gap-10 p-6 sm:p-10 lg:grid-cols-2 lg:p-12">
          <div className="flex flex-col gap-4">
            <h2 id="contact-title" className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
              Visit the shop or give us a call
            </h2>
            <p className="max-w-md text-base leading-relaxed text-background/75">
              Prices and stock change often. Call or message before you travel and we will confirm availability for you.
            </p>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <a
                href={shopConfig.phoneHref}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-background px-5 text-base font-medium text-foreground transition-opacity hover:opacity-90"
              >
                <Phone className="size-4" aria-hidden="true" />
                Call {shopConfig.phoneDisplay}
              </a>
              <a
                href={whatsappLink(`Hello ${shopConfig.name}, I have a question about a product.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-background/25 px-5 text-base font-medium transition-colors hover:bg-background/10"
              >
                <MessageCircle className="size-4" aria-hidden="true" />
                WhatsApp
              </a>
            </div>
            <p className="text-xs text-background/60">Demo contact details — replace in lib/shop-config.ts.</p>
          </div>

          <dl className="grid gap-6 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <dt className="flex items-center gap-2 text-sm text-background/60">
                <MapPin className="size-4" aria-hidden="true" />
                Address
              </dt>
              <dd className="text-base leading-relaxed">
                {address.line1}
                <br />
                {address.line2}
                <br />
                {address.country}
                <a
                  href={shopConfig.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 block text-sm font-medium underline underline-offset-4 hover:no-underline"
                >
                  Open in Google Maps
                </a>
              </dd>
            </div>
            <div className="flex flex-col gap-2">
              <dt className="flex items-center gap-2 text-sm text-background/60">
                <Clock className="size-4" aria-hidden="true" />
                Opening hours
              </dt>
              <dd className="flex flex-col gap-2 text-base">
                {hours.map((h) => (
                  <span key={h.days} className="flex flex-col">
                    <span>{h.days}</span>
                    <span className="text-sm text-background/70">{h.time}</span>
                  </span>
                ))}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  )
}
