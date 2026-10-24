import Image from 'next/image';
import Link from 'next/link';
import { MapPin, ShieldCheck, ChevronRight } from 'lucide-react';
import { City } from '@/lib/types';

interface CityHeroProps {
  city: City;
  companionCount: number;
}

export default function CityHero({ city, companionCount }: CityHeroProps) {
  return (
    <div className="relative h-72 sm:h-96 w-full overflow-hidden flex items-end">
      {/* City Hero Image */}
      <Image
        src={city.heroImage}
        alt={`Escort Services in ${city.name}`}
        fill
        priority
        className="object-cover object-center"
      />

      {/* Dark Luxury Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0B070E] via-[#0B070E]/70 to-[#0B070E]/30" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#D91680]/20 to-transparent pointer-events-none" />

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-xs text-neutral-400 mb-4 font-medium" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
          <Link href="/" className="hover:text-white transition-colors">
            Escorts
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
          <span className="text-magenta-400 font-semibold">{city.name}</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-magenta-500/20 border border-magenta-500/35 text-magenta-300 text-xs font-semibold mb-3">
              <MapPin className="w-3.5 h-3.5 text-magenta-400" />
              <span>{city.stateOrCountry} Chapter</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight">
              Verified Escorts & Escort Services in {city.name}
            </h1>
            
            <p className="text-sm sm:text-base text-neutral-300 font-light mt-2 max-w-2xl">
              Connect with verified independent escorts and premier VIP escort services in {city.name} for dinner dates, 
              private evenings, VIP travel, and executive accompaniment with 100% discretion.
            </p>
          </div>

          <div className="flex items-center space-x-2 px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-xs text-white flex-shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span><strong className="text-magenta-300">{companionCount}</strong> Verified Escorts</span>
          </div>
        </div>

      </div>
    </div>
  );
}
