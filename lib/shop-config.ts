/**
 * DEMO SHOP DETAILS — replace every value in this file with the real shop's
 * information before launch. Nothing here is a verified business claim.
 */
export const shopConfig = {
  name: 'Rahman Electronics',
  shortName: 'Rahman',
  tagline: 'Home appliances for every family',
  intro:
    'A family-run electronics shop serving our village and nearby areas. Come in to see products in person, compare models side by side, and get friendly advice before you buy.',
  address: {
    line1: 'Bazar Road, Main Market',
    line2: '[Upazila], [District]',
    country: 'Bangladesh',
  },
  phoneDisplay: '+880 1700-000000',
  phoneHref: 'tel:+8801700000000',
  /** Demo WhatsApp number in international format, digits only. */
  whatsappNumber: '8801700000000',
  /** Replace with the shop's real Google Maps share link. */
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Rahman+Electronics+Bangladesh',
  hours: [
    { days: 'Saturday – Thursday', time: '9:00 AM – 9:00 PM' },
    { days: 'Friday', time: '3:00 PM – 9:00 PM' },
  ],
} as const

export function whatsappLink(message?: string) {
  const base = `https://wa.me/${shopConfig.whatsappNumber}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}
