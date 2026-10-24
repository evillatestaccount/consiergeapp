import { Metadata } from 'next';
import { Suspense } from 'react';
import ContactClient from '@/components/ContactClient';
import { ContactJsonLd } from '@/components/JsonLd';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://escortvilla.com';

export const metadata: Metadata = {
  title: 'VIP Escort Booking & Concierge Inquiries',
  description: 'Inquire discreetly with EscortVilla for VIP escort services, independent luxury escorts, private dinner dates, and travel companions in London, New York, Delhi, and Mumbai.',
  keywords: [
    'book escort',
    'vip escort booking',
    'escort services',
    'hire escorts',
    'luxury escort agency',
    'independent escorts',
    'delhi escort booking',
    'london escort service',
    'mumbai vip escorts',
    'discreet escort inquiry',
  ],
  alternates: {
    canonical: `${siteUrl}/contact`,
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
  openGraph: {
    title: 'VIP Escort Booking & Concierge Inquiries | EscortVilla',
    description: 'Discreet inquiries and custom matching for VIP escort services, luxury dinner dates, and international travel accompaniment.',
    url: `${siteUrl}/contact`,
    siteName: 'EscortVilla',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80',
        width: 1200,
        height: 630,
        alt: 'EscortVilla VIP Escort Booking Desk',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VIP Escort Booking & Concierge Inquiries | EscortVilla',
    description: 'Inquire discreetly for VIP escort services, luxury dinner dates, and private travel accompaniment.',
    images: ['https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80'],
  },
};

export default function ContactPage() {
  return (
    <>
      {/* ContactPage & Organization Schema for Google Search Rich Snippets */}
      <ContactJsonLd />

      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center space-y-3">
              <div className="w-8 h-8 border-2 border-magenta-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-neutral-400">Connecting to VIP Escort Booking Desk...</p>
            </div>
          </div>
        }
      >
        <ContactClient />
      </Suspense>
    </>
  );
}
