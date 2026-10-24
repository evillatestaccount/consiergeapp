'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';
import { CompanionListing } from '@/lib/types';
import CompanionCard from './CompanionCard';

interface FeaturedSectionProps {
  initialListings: CompanionListing[];
}

export default function FeaturedSection({ initialListings }: FeaturedSectionProps) {
  const [activeTab, setActiveTab] = useState('ALL');

  const tabs = [
    { id: 'ALL', label: 'All Featured Escorts' },
    { id: 'Event Host', label: 'VIP Event Escorts' },
    { id: 'Travel Concierge', label: 'Travel Escorts' },
    { id: 'Dinner Date', label: 'Dinner Dates' },
    { id: 'Language Partner', label: 'Multilingual Escorts' },
  ];

  const filtered = activeTab === 'ALL'
    ? initialListings
    : initialListings.filter(l => l.services.includes(activeTab));

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
        <div>
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-magenta-500/10 border border-magenta-500/25 text-magenta-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-magenta-400" />
            <span>Curated Escort Directory</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
            Elite Escorts & VIP Companions
          </h2>
          <p className="text-sm text-neutral-400 mt-2 max-w-xl">
            Independently verified high-class escorts offering glamour, charm, and discreet VIP services across global cities.
          </p>
        </div>

        {/* View All Cities Link */}
        <div className="mt-4 md:mt-0">
          <Link
            href="/companions-in-london"
            className="inline-flex items-center space-x-2 text-sm font-semibold text-magenta-400 hover:text-magenta-300 transition-colors"
          >
            <span>Browse All City Escorts</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-medium tracking-wide whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-[#D91680] to-[#4B1248] text-white shadow-aura border border-magenta-400/40'
                : 'bg-white/5 text-neutral-300 hover:bg-white/10 hover:text-white border border-white/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filtered.map((listing) => (
          <CompanionCard key={listing.id} listing={listing} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
          <p className="text-sm text-neutral-400">No companions found for this category.</p>
        </div>
      )}

    </section>
  );
}
