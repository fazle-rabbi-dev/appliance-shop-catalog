/**
 * DEMO SHOP DETAILS — replace every value in this file with the real shop's
 * information before launch. Nothing here is a verified business claim.
 */
export const shopConfig = {
  name: 'রহমান ইলেকট্রনিকস',
  shortName: 'রহমান',
  tagline: 'প্রতিটি পরিবারের জন্য হোম অ্যাপ্লায়েন্স',
  intro:
    'আমাদের এলাকার একটি পারিবারিক ইলেকট্রনিকসের দোকান। পণ্য নিজে দেখে, পাশাপাশি মডেল মিলিয়ে এবং কেনার আগে পরামর্শ নিয়ে যেতে পারেন।',
  address: {
    line1: 'বাজার রোড, মূল মার্কেট',
    line2: '[উপজেলা], [জেলা]',
    country: 'বাংলাদেশ',
  },
  phoneDisplay: '+৮৮০ ১৭০০-০০০০০০',
  phoneHref: 'tel:+8801700000000',
  /** Demo WhatsApp number in international format, digits only. */
  whatsappNumber: '8801700000000',
  /** Map pin. Drives the embedded map and every Google Maps link. */
  coordinates: { lat: 24.757655, lng: 90.657191 },
  hours: [
    { days: 'শনি – বৃহস্পতি', time: 'সকাল ৯টা – রাত ৯টা' },
    { days: 'শুক্রবার', time: 'বিকাল ৩টা – রাত ৯টা' },
  ],
} as const

const mapQuery = `${shopConfig.coordinates.lat},${shopConfig.coordinates.lng}`

/** Google Maps URLs built from `shopConfig.coordinates`, so the pin lives in one place. */
export const mapLinks = {
  /** Keyless embed for the home page map. */
  embed: `https://www.google.com/maps?q=${mapQuery}&z=16&output=embed`,
  /** Opens the pin in Google Maps. */
  place: `https://www.google.com/maps/search/?api=1&query=${mapQuery}`,
  /** Opens turn-by-turn directions. */
  directions: `https://www.google.com/maps/dir/?api=1&destination=${mapQuery}`,
} as const

export function whatsappLink(message?: string) {
  const base = `https://wa.me/${shopConfig.whatsappNumber}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}
