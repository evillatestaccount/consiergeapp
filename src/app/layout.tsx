import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import AgeVerificationModal from '@/components/AgeVerificationModal';
import { WebsiteJsonLd } from '@/components/JsonLd';
import { getCities } from '@/lib/db';

export const viewport: Viewport = {
  themeColor: '#0B070E',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: 'EscortVilla | Premier VIP Escort Services & Luxury Escort Directory',
    template: '%s | EscortVilla',
  },
  description: 'EscortVilla is the premier global directory for verified VIP escort services, high-class independent escorts, and luxury companions for dinner dates, VIP travel, and private bookings.',
  keywords: [
    'escort services',
    'vip escorts',
    'luxury escort service',
    'independent escorts',
    'escort directory',
    'call girls',
    'high class escorts',
    'dinner date escorts',
    'travel escorts',
    'verified escorts',
    'private escort booking'
  ],
  authors: [{ name: 'EscortVilla VIP Management' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://escortvilla.com'),
  alternates: {
    canonical: './',
  },
  manifest: '/manifest.webmanifest',
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
  },
  openGraph: {
    title: 'EscortVilla | Premier VIP Escort Services & Luxury Escort Directory',
    description: 'Verified independent escorts and elite VIP escort services for dinner dates, international travel, and private bookings.',
    url: 'https://escortvilla.com',
    siteName: 'EscortVilla',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80',
        width: 1200,
        height: 630,
        alt: 'EscortVilla Premier VIP Escort Services',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EscortVilla | Premier VIP Escort Services',
    description: 'Verified independent escorts and luxury escort services worldwide.',
    images: ['https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80'],
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
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cities = await getCities({ onlyActive: true });

  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <WebsiteJsonLd />
      </head>
      <body className="min-h-screen flex flex-col bg-[#0B070E] text-white selection:bg-[#D91680] selection:text-white antialiased font-sans">
        <AgeVerificationModal />
        <GoogleAnalytics />
        <Navbar cities={cities} />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
