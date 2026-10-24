import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getCities, getCityBySlug, getListings } from '@/lib/db';
import CityHero from '@/components/CityHero';
import FilterSidebar from '@/components/FilterSidebar';
import CompanionCard from '@/components/CompanionCard';
import { DirectoryJsonLd } from '@/components/JsonLd';
import Link from 'next/link';
import { MapPin, Sparkles, ShieldCheck } from 'lucide-react';

interface CityPageProps {
  params: {
    city: string;
  };
  searchParams: {
    service?: string;
    language?: string;
    availability?: string;
    maxRate?: string;
    search?: string;
  };
}

export const revalidate = 60; // ISR revalidation

// Static Site Generation (SSG) Pre-rendering
export async function generateStaticParams() {
  const cities = await getCities({ onlyActive: true });
  return cities.map((c) => ({
    city: c.slug,
  }));
}

// Dynamic SEO Metadata
export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const cityParam = params?.city || 'london';
  const city = await getCityBySlug(cityParam);
  const cityName = city ? city.name : cityParam.charAt(0).toUpperCase() + cityParam.slice(1);
  const country = city ? city.stateOrCountry : 'International';

  const title = `Top Escort Services in ${cityName} | Verified VIP Escorts`;
  const description = `Find verified VIP escort services, high-class independent escorts, and luxury companions in ${cityName}, ${country} for private dinner dates, travel accompaniment, and executive bookings.`;

  return {
    title,
    description,
    keywords: [
      `escort services in ${cityName.toLowerCase()}`,
      `escorts in ${cityName.toLowerCase()}`,
      `vip escorts ${cityName.toLowerCase()}`,
      `independent escorts ${cityName.toLowerCase()}`,
      `call girls in ${cityName.toLowerCase()}`,
      `luxury escorts ${cityName.toLowerCase()}`,
      `dinner dates ${cityName.toLowerCase()}`,
      `${cityName.toLowerCase()} escort directory`,
    ],
    openGraph: {
      title,
      description,
      url: `https://escortvilla.com/companions-in-${cityParam}`,
      siteName: 'EscortVilla',
      images: [
        {
          url: city?.heroImage || 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80',
          width: 1200,
          height: 630,
          alt: `VIP Escorts in ${cityName}`,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [city?.heroImage || 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80'],
    },
  };
}

export default async function CityPage({ params, searchParams }: CityPageProps) {
  const citySlug = (params?.city || '').toLowerCase();
  if (!citySlug) {
    notFound();
  }
  const city = await getCityBySlug(citySlug);

  if (!city) {
    notFound();
  }

  // Parse filters from URL search parameters (Zero client-side spinners)
  const maxRate = searchParams.maxRate ? parseFloat(searchParams.maxRate) : undefined;

  const listings = await getListings({
    citySlug,
    status: 'PUBLISHED',
    service: searchParams.service,
    language: searchParams.language,
    availability: searchParams.availability,
    maxRate,
    search: searchParams.search,
  });

  return (
    <div className="min-h-screen pb-24">
      {/* JSON-LD Structured SEO Schema */}
      <DirectoryJsonLd
        cityName={city.name}
        citySlug={city.slug}
        listings={listings}
      />

      {/* City Hero Banner */}
      <CityHero city={city} companionCount={listings.length} />

      {/* Main Directory Layout with Interactive Filter Sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Static-Compatible Filter Sidebar */}
          <Suspense fallback={<div className="w-full lg:w-72 flex-shrink-0" />}>
            <FilterSidebar totalCount={listings.length} citySlug={city.slug} />
          </Suspense>

          {/* 3-Column Responsive Grid of Companions */}
          <div className="flex-1">
            {listings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {listings.map((listing) => (
                  <CompanionCard key={listing.id} listing={listing} />
                ))}
              </div>
            ) : (
              <div className="text-center py-24 rounded-3xl glass-card p-8 border border-white/10">
                <div className="w-16 h-16 rounded-full bg-magenta-500/10 border border-magenta-500/20 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-magenta-400" />
                </div>
                <h3 className="text-xl font-serif font-bold text-white mb-2">
                  No Escorts Match Your Current Criteria
                </h3>
                <p className="text-xs text-neutral-400 max-w-md mx-auto mb-6">
                  Try adjusting your filter options or contact our private concierge desk for bespoke VIP escort matchmaking in {city.name}.
                </p>
                <div className="flex justify-center space-x-4">
                  <Link
                    href={`/companions-in-${city.slug}`}
                    className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition-colors"
                  >
                    Clear Filters
                  </Link>
                  <Link
                    href="/contact"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D91680] to-[#E62044] text-xs font-semibold text-white shadow-aura transition-all"
                  >
                    VIP Escort Request
                  </Link>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
