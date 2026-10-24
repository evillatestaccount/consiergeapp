import type { Metadata } from 'next';
import { getCities, getListings } from '@/lib/db';
import HeroSection from '@/components/HeroSection';
import FeaturedSection from '@/components/FeaturedSection';
import HowItWorksAndCities from '@/components/HowItWorksAndCities';
import { WebsiteJsonLd } from '@/components/JsonLd';
import Link from 'next/link';
import { ShieldCheck, Lock, Star, Sparkles, Award, CheckCircle2 } from 'lucide-react';

export const revalidate = 60; // 60 seconds ISR

export const metadata: Metadata = {
  title: 'EscortVilla | VIP Escort Services & Luxury Independent Escorts',
  description: 'Verified global directory for independent VIP escorts, dinner dates, high-class escort services, and luxury travel companions in London, New York, Delhi, and Mumbai.',
  keywords: [
    'escort services',
    'vip escorts',
    'luxury escort service',
    'independent escorts',
    'call girls',
    'delhi escorts',
    'london escorts',
    'mumbai escorts',
    'new york escorts',
    'vip dinner dates',
    'verified escort directory',
  ],
  alternates: {
    canonical: 'https://escortvilla.com',
  },
  openGraph: {
    title: 'EscortVilla | VIP Escort Services & Luxury Independent Escorts',
    description: 'Verified global directory for independent VIP escorts, luxury dinner dates, and high-class travel companions.',
    url: 'https://escortvilla.com',
    siteName: 'EscortVilla',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80',
        width: 1200,
        height: 630,
        alt: 'EscortVilla VIP Escort Services',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EscortVilla | VIP Escort Services',
    description: 'Verified global directory for independent VIP escorts and luxury escort services.',
    images: ['https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80'],
  },
};

export default async function HomePage() {
  const [cities, listings] = await Promise.all([
    getCities({ onlyActive: true }),
    getListings({ status: 'PUBLISHED' }),
  ]);

  return (
    <div className="space-y-12">
      {/* Sitelinks Searchbox & Organization Structured Schema */}
      <WebsiteJsonLd />
      {/* 1. HERO SECTION */}
      <HeroSection cities={cities} />

      {/* 2. FEATURED DIRECTORY GRID */}
      <FeaturedSection initialListings={listings} />

      {/* 3. HOW IT WORKS & CRAWLABLE CITY HUBS */}
      <HowItWorksAndCities cities={cities} />

      {/* 4. CONCIERGE GUARANTEE & DISCRETION PROTOCOL */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-3xl p-8 sm:p-14 bg-gradient-to-r from-[#170C19] via-[#2A0D28] to-[#170C19] border border-magenta-500/30 relative overflow-hidden shadow-2xl">
          
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#D91680]/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-magenta-500/20 text-magenta-300 text-xs font-semibold uppercase tracking-wider mb-4 border border-magenta-500/30">
              <ShieldCheck className="w-4 h-4 text-magenta-400" />
              <span>The EscortVilla Discretion Guarantee</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight mb-6">
              VIP Escort Services with Absolute Discretion
            </h2>

            <p className="text-sm sm:text-base text-neutral-300 font-light leading-relaxed mb-8">
              Every VIP escort listed in our directory undergoes strict identity verification, profile authentication, and quality checks. We cater exclusively to refined gentlemen and executives seeking discreet introductions, private dinner dates, and luxury travel companions with end-to-end encrypted communication.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-white/10 mb-8">
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-white">Identity Verified</div>
                  <div className="text-[11px] text-neutral-400">Strict legal verification</div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-white">100% Confidential</div>
                  <div className="text-[11px] text-neutral-400">Discretion agreements</div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-white">VIP Concierge Desk</div>
                  <div className="text-[11px] text-neutral-400">Dedicated booking managers</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link
                href="/contact"
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#D91680] to-[#E62044] hover:from-magenta-600 hover:to-crimson text-white text-xs font-semibold tracking-wider uppercase shadow-aura transition-all text-center"
              >
                Request Custom VIP Escort Match
              </Link>
              <Link
                href="/#how-it-works"
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold tracking-wider text-center transition-all"
              >
                Explore Escort Booking Protocols
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. EDITORIAL PRESS & TESTIMONIALS */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
            Client Perspectives & Conclave Feedback
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl glass-card relative">
            <div className="flex items-center space-x-1 text-magenta-400 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="text-xs text-neutral-300 italic leading-relaxed mb-6">
              &ldquo;Attending high-level banquets in Mayfair required effortless conversational skill and elegance. Lady Vivienne was impeccably poised, articulate in French, and an exceptional VIP dinner escort.&rdquo;
            </p>
            <div className="text-xs font-semibold text-white">Managing Partner</div>
            <div className="text-[11px] text-neutral-400">Mayfair Private Capital, London</div>
          </div>

          <div className="p-8 rounded-2xl glass-card relative">
            <div className="flex items-center space-x-1 text-magenta-400 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="text-xs text-neutral-300 italic leading-relaxed mb-6">
              &ldquo;EscortVilla is in a league of its own. Reserving a VIP escort for my business trip to Mumbai was discreet, seamless, and executed with the utmost class.&rdquo;
            </p>
            <div className="text-xs font-semibold text-white">Executive Producer</div>
            <div className="text-[11px] text-neutral-400">International Film Conclave, Mumbai</div>
          </div>

          <div className="p-8 rounded-2xl glass-card relative">
            <div className="flex items-center space-x-1 text-magenta-400 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="text-xs text-neutral-300 italic leading-relaxed mb-6">
              &ldquo;Genevieve was the ideal escort for our private dinner on the Upper East Side. Knowledgeable in modern art, fluent in Italian, and deeply respectful of client discretion.&rdquo;
            </p>
            <div className="text-xs font-semibold text-white">Heritage Gallery Trustee</div>
            <div className="text-[11px] text-neutral-400">Manhattan, New York</div>
          </div>
        </div>
      </section>

    </div>
  );
}
