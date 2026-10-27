import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import localFont from 'next/font/local'
import { ToastProvider } from '@/components/shared/toast-provider'
import { ThemeProvider } from '@/components/theme-provider'
import { siteUrl } from '@/lib/site'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })

const bengali = localFont({
  src: [
    { path: '../public/PurnoPran/Unicode/Li Purno Pran Unicode.ttf', weight: '400', style: 'normal' },
    {
      path: '../public/PurnoPran/Unicode/Li Purno Pran Unicode Italic.ttf',
      weight: '400',
      style: 'italic',
    },
  ],
  variable: '--font-bengali',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'রহমান ইলেকট্রনিকস — হোম অ্যাপ্লায়েন্স ক্যাটালগ',
  description:
    'ফ্রিজ, রাইস কুকার, টিভি, ফ্যান, ব্লেন্ডারসহ নানা হোম অ্যাপ্লায়েন্স দেখুন। দোকানে আসার আগেই দাম ও স্টক জেনে নিন।',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafaf8' },
    { media: '(prefers-color-scheme: dark)', color: '#0e1116' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="bn"
      className={`${inter.variable} ${bengali.variable} bg-background`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
