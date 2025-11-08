import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Layout from '@/components/Layout'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Randevuasistan - Kuaför Randevu Asistanı',
  description: 'Kuaförlere özel yapay zeka destekli randevu yönetim sistemi',
  keywords: ['randevu', 'kuaför', 'ai', 'whatsapp', 'telefon', 'yönetim'],
  authors: [{ name: 'Randevuasistan Team' }],
  creator: 'Randevuasistan Team',
  publisher: 'Randevuasistan',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://randevuasistan.com'),
  openGraph: {
    title: 'Randevuasistan - Kuaför Randevu Asistanı',
    description: 'Kuaförlere özel yapay zeka destekli randevu yönetim sistemi',
    url: 'https://randevuasistan.com',
    siteName: 'Randevuasistan',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Randevuasistan',
      },
    ],
    locale: 'tr_TR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Randevuasistan - Kuaför Randevu Asistanı',
    description: 'Kuaförlere özel yapay zeka destekli randevu yönetim sistemi',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <Layout>{children}</Layout>
      </body>
    </html>
  )
}
