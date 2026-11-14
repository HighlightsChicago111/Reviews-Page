import type {Metadata} from 'next'
import {Inter} from 'next/font/google'
import {SanityLive} from '@/sanity/lib/live'
import './globals.css'
import '@/components/site-navbar/site-navbar.css'

// Inter for the site-wide navbar only (its CSS reads --snav-inter); the rest of this app keeps its own fonts.
const navbarFont = Inter({subsets: ['latin'], variable: '--snav-inter', display: 'swap'})

export const metadata: Metadata = {
  metadataBase: new URL('https://www.highlightschicago.com'),
  title: {default: 'Chicago Electrician Reviews', template: '%s | Highlights Chicago'},
  description: 'Customer reviews for Highlights Chicago electrical services.',
  icons: {
    icon: [
      {url: '/reviews/icons/highlights-chicago-32.png', type: 'image/png', sizes: '32x32'},
      {url: '/reviews/icons/highlights-chicago-48.png', type: 'image/png', sizes: '48x48'},
      {url: '/reviews/icons/highlights-chicago-192.png', type: 'image/png', sizes: '192x192'},
    ],
    apple: [{url: '/reviews/icons/highlights-chicago-180.png', type: 'image/png', sizes: '180x180'}],
  },
}

export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return <html lang="en"><body className={navbarFont.variable}>{children}<SanityLive /></body></html>
}
