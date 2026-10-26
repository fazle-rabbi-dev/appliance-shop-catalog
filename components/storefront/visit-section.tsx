import { Clock, MapPin, MessageCircle, Phone } from 'lucide-react'
import { shopConfig, whatsappLink } from '@/lib/shop-config'

const reasons = [
  { title: 'নিজে দেখে নিন', body: 'ফ্রিজের দরজা খুলুন, ফ্যানের শব্দ শুনুন, টিভির ছবি দেখুন — তারপর সিদ্ধান্ত নিন।' },
  { title: 'সৎ পরামর্শ', body: 'আপনার ঘর আর বাজেট অনুযায়ী সঠিক সাইজ ও মডেল বেছে নিতে সাহায্য করি।' },
  { title: 'এলাকার সাপোর্ট', body: 'কেনার পরে সমস্যা? ফোনের লাইনে অপেক্ষা নয়, আমরা রাস্তার ওপরেই আছি।' },
]

export function AboutSection() {
  return (
    <section id="about" aria-labelledby="about-title" className="border-y border-border bg-card">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-12 lg:px-8">
        <div className="flex flex-col gap-4 lg:col-span-5">
          <h2 id="about-title" className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            আপনার পাড়ার ইলেকট্রনিকসের দোকান
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
              দোকানে আসুন বা ফোন করুন
            </h2>
            <p className="max-w-md text-base leading-relaxed text-background/75">
              দাম আর স্টক প্রায়ই বদলায়। আসার আগে ফোন বা মেসেজ দিন, আমরা স্টক নিশ্চিত করে জানাব।
            </p>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <a
                href={shopConfig.phoneHref}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-background px-5 text-base font-medium text-foreground transition-opacity hover:opacity-90"
              >
                <Phone className="size-4" aria-hidden="true" />
                কল করুন {shopConfig.phoneDisplay}
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
            <p className="text-xs text-background/60">যোগাযোগের তথ্য ডেমো — lib/shop-config.ts এ বদলে নিন।</p>
          </div>

          <dl className="grid gap-6 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <dt className="flex items-center gap-2 text-sm text-background/60">
                <MapPin className="size-4" aria-hidden="true" />
                ঠিকানা
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
                  গুগল ম্যাপে দেখুন
                </a>
              </dd>
            </div>
            <div className="flex flex-col gap-2">
              <dt className="flex items-center gap-2 text-sm text-background/60">
                <Clock className="size-4" aria-hidden="true" />
                খোলার সময়
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
