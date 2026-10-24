'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Sparkles, ShieldCheck, Briefcase, ChevronRight } from 'lucide-react';
import { City } from '@/lib/types';
import LuxurySelect from '@/components/LuxurySelect';
import { useUserLocation, getTimezoneLocation } from '@/lib/location';

interface HeroSectionProps {
  cities: City[];
}

export default function HeroSection({ cities }: HeroSectionProps) {
  const router = useRouter();
  const { location } = useUserLocation();
  const [selectedCity, setSelectedCity] = useState(() => getTimezoneLocation().slug);
  const [selectedService, setSelectedService] = useState('');
  const [keyword, setKeyword] = useState('');
  const [userLocation, setUserLocation] = useState(() => getTimezoneLocation().displayName);

  useEffect(() => {
    if (location) {
      setSelectedCity(location.slug);
      setUserLocation(location.displayName);
    }
  }, [location]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const citySlug = selectedCity || 'all';
    const params = new URLSearchParams();
    if (keyword) params.set('search', keyword);
    if (selectedService) params.set('service', selectedService);

    if (citySlug !== 'all') {
      router.push(`/companions-in-${citySlug}?${params.toString()}`);
    } else {
      router.push(`/companions-in-london?${params.toString()}`);
    }
  };

  const servicesList = [
    'Event Host',
    'Dinner Date',
    'Travel Concierge',
    'Language Partner',
  ];

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
      
      {/* Dynamic Animated Gradient Background */}
      <div className="absolute inset-0 bg-[#0B070E]">
        <div className="absolute -top-[30%] -left-[10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-br from-[#D91680]/30 to-[#4B1248]/40 blur-[120px] pointer-events-none animate-float" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[55vw] h-[55vw] rounded-full bg-gradient-to-tl from-[#E62044]/25 to-[#4B1248]/35 blur-[140px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[30vw] bg-[#D91680]/10 blur-[150px] pointer-events-none" />
        
        {/* Subtle Luxury Mesh Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #FFFFFF 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        
        {/* Location Detection Pill */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/15 backdrop-blur-md mb-8">
          <span className="w-2 h-2 rounded-full bg-[#D91680] animate-ping" />
          <MapPin className="w-3.5 h-3.5 text-magenta-400" />
          <span className="text-xs font-medium text-neutral-300">
            {userLocation ? `Viewing verified escorts in ${userLocation}` : 'Worldwide VIP Escort Directory'}
          </span>
          <span className="text-[10px] text-magenta-300 bg-magenta-500/20 px-2 py-0.5 rounded-full border border-magenta-500/30 font-semibold uppercase">
            Discreet
          </span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-bold text-white tracking-tight leading-[1.1] mb-6">
          Elite Escort Services &{' '}
          <span className="bg-gradient-to-r from-magenta-400 via-crimson to-magenta-300 bg-clip-text text-transparent">
            VIP Luxury Escorts
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl mx-auto text-base sm:text-lg text-neutral-300 leading-relaxed font-light mb-12">
          Curated worldwide directory of verified independent escorts and elite escort agencies for dinner dates, 
          VIP travel, private parties, and executive companionship with 100% discretion.
        </p>

        {/* Search Bar Container */}
        <form
          onSubmit={handleSearch}
          className="max-w-4xl mx-auto p-3 sm:p-4 rounded-3xl bg-[#170C19]/90 backdrop-blur-2xl border border-white/20 shadow-2xl space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3"
        >
          {/* Keyword Field */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Keywords (e.g. VIP Escort, Dinner Date, Model, Multilingual)"
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl glass-input text-sm text-white placeholder-neutral-400 bg-white/5 border border-white/10"
            />
          </div>

          {/* City Dropdown */}
          <div className="w-full sm:w-52">
            <LuxurySelect
              value={selectedCity}
              onChange={(val) => setSelectedCity(val)}
              placeholder="All Global Cities"
              icon={<MapPin className="w-4 h-4 text-magenta-400" />}
              className="px-4 py-3.5 rounded-2xl glass-input text-sm text-white bg-[#170C19]"
              options={[
                { value: '', label: 'All Global Cities' },
                ...cities.map((city) => ({
                  value: city.slug,
                  label: city.name,
                  sublabel: city.stateOrCountry,
                })),
              ]}
            />
          </div>

          {/* Service Dropdown */}
          <div className="w-full sm:w-52">
            <LuxurySelect
              value={selectedService}
              onChange={(val) => setSelectedService(val)}
              placeholder="All Services"
              icon={<Briefcase className="w-4 h-4 text-magenta-400" />}
              className="px-4 py-3.5 rounded-2xl glass-input text-sm text-white bg-[#170C19]"
              options={[
                { value: '', label: 'All Services' },
                ...servicesList.map((svc) => ({
                  value: svc,
                  label: svc,
                })),
              ]}
            />
          </div>

          {/* Search Button */}
          <button
            type="submit"
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#D91680] to-[#E62044] hover:from-magenta-600 hover:to-crimson text-white font-semibold text-sm tracking-wide shadow-aura hover:shadow-aura-lg flex items-center justify-center space-x-2 transition-all flex-shrink-0"
          >
            <span>Explore Escorts</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Suggestion Chips */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-xs text-neutral-400">
          <span className="font-medium text-neutral-500">Popular Escort Services:</span>
          {[
            { label: 'VIP Dinner Dates', service: 'Dinner Date' },
            { label: 'Private Event Escorts', service: 'Event Host' },
            { label: 'International Travel Companions', service: 'Travel Concierge' },
            { label: 'Multilingual High-Class Escorts', service: 'Language Partner' },
          ].map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setSelectedService(item.service);
                router.push(`/companions-in-london?service=${encodeURIComponent(item.service)}`);
              }}
              className="px-3 py-1 rounded-full bg-white/5 hover:bg-magenta-500/20 border border-white/10 hover:border-magenta-500/40 text-neutral-300 hover:text-white transition-colors"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-14 pt-10 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-magenta-500/15 border border-magenta-500/30 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5 text-magenta-400" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">ID & Conduct Verified</div>
              <div className="text-[11px] text-neutral-400">Rigorous protocol clearance</div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-magenta-500/15 border border-magenta-500/30 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-magenta-400" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">Formal Etiquette</div>
              <div className="text-[11px] text-neutral-400">Diplomatic & gala ready</div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-magenta-500/15 border border-magenta-500/30 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-magenta-400" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">Global Capital Hubs</div>
              <div className="text-[11px] text-neutral-400">London, NYC, Delhi, Mumbai</div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-magenta-500/15 border border-magenta-500/30 flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-5 h-5 text-magenta-400" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">24/7 Concierge</div>
              <div className="text-[11px] text-neutral-400">Private reservations</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
