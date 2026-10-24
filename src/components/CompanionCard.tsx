'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShieldCheck, MapPin, Sparkles, Calendar, ArrowUpRight } from 'lucide-react';
import { CompanionListing } from '@/lib/types';
import { formatPrice } from '@/lib/currency';
import { getWhatsAppUrl } from '@/lib/whatsapp';
import WhatsAppIcon from '@/components/WhatsAppIcon';

interface CompanionCardProps {
  listing: CompanionListing;
}

export default function CompanionCard({ listing }: CompanionCardProps) {
  const primaryImage = listing.images && listing.images.length > 0
    ? listing.images[0]
    : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80';

  const availabilityConfig = {
    AVAILABLE: { label: 'Available', color: 'bg-emerald-400', textColor: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10' },
    WEEKENDS_ONLY: { label: 'Weekends Only', color: 'bg-amber-400', textColor: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/10' },
    BOOKED: { label: 'Reserved', color: 'bg-rose-400', textColor: 'text-rose-400', border: 'border-rose-500/30', bg: 'bg-rose-500/10' },
  }[listing.availability || 'AVAILABLE'];

  return (
    <div className="group relative rounded-2xl overflow-hidden glass-card transition-all duration-500 hover:-translate-y-1.5 flex flex-col h-full">
      
      {/* Image Container with Hover Zoom */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#1A0B1A]">
        <Image
          src={primaryImage}
          alt={listing.fullName}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
        />
        
        {/* Subtle Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B070E] via-transparent to-black/30 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          {/* Verification Badge */}
          {listing.verificationBadge && (
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#0B070E]/80 backdrop-blur-md border border-magenta-500/40 text-[11px] font-semibold text-magenta-300 shadow-md">
              <ShieldCheck className="w-3.5 h-3.5 text-magenta-400" />
              <span>EscortVilla Verified</span>
            </div>
          )}

          {/* Availability Status */}
          <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full backdrop-blur-md border ${availabilityConfig.border} ${availabilityConfig.bg} text-[11px] font-medium ${availabilityConfig.textColor}`}>
            <span className={`w-2 h-2 rounded-full ${availabilityConfig.color} animate-pulse`} />
            <span>{availabilityConfig.label}</span>
          </div>
        </div>

        {/* Floating Rate Tag */}
        <div className="absolute bottom-3 left-3 z-10">
          <div className="px-3.5 py-1.5 rounded-xl bg-[#0B070E]/85 backdrop-blur-md border border-white/15 shadow-lg">
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Hourly Rate</span>
            <span className="text-base font-bold text-white tracking-tight">
              {formatPrice(listing.hourlyRate, listing.currency)} <span className="text-xs font-normal text-neutral-300">/ hr</span>
            </span>
          </div>
        </div>

        {/* City Tag */}
        <div className="absolute bottom-3 right-3 z-10">
          <Link
            href={`/companions-in-${listing.citySlug}`}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-magenta-500/30 backdrop-blur-md border border-white/15 text-xs font-medium text-white transition-colors"
          >
            <MapPin className="w-3 h-3 text-magenta-400" />
            <span className="capitalize">{listing.city?.name || listing.citySlug.replace('-', ' ')}</span>
          </Link>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 flex flex-col flex-grow justify-between bg-[#110813]/90">
        <div>
          {/* Name & Headline */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-lg font-serif font-bold text-white group-hover:text-magenta-300 transition-colors">
              <Link href={`/profile/${listing.id}`}>
                {listing.fullName}
              </Link>
            </h3>
            <Link
              href={`/profile/${listing.id}`}
              className="p-1.5 rounded-lg bg-white/5 text-neutral-400 group-hover:text-white group-hover:bg-magenta-500/20 transition-colors"
              aria-label="View escort profile"
            >
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <p className="text-xs text-neutral-300 line-clamp-2 leading-relaxed mb-4">
            {listing.headline}
          </p>

          {/* Service Chips */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {listing.services.slice(0, 3).map((service, idx) => (
              <span
                key={idx}
                className="px-2.5 py-0.5 rounded-md text-[10px] font-medium tracking-wide bg-white/5 text-neutral-300 border border-white/10"
              >
                {service}
              </span>
            ))}
            {listing.services.length > 3 && (
              <span className="px-1.5 py-0.5 rounded-md text-[10px] text-neutral-400 bg-white/5">
                +{listing.services.length - 3}
              </span>
            )}
          </div>

          {/* Languages */}
          <div className="text-[11px] text-neutral-400 mb-3">
            <span className="text-neutral-500">Languages:</span> {listing.languages.slice(0, 2).join(', ')}
          </div>
        </div>

        {/* Footer Card Actions */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
          <a
            href={getWhatsAppUrl(listing)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 text-xs font-medium transition-all group/wa"
            title={`Contact ${listing.fullName} on WhatsApp`}
          >
            <WhatsAppIcon className="w-3.5 h-3.5 fill-current text-emerald-400 group-hover/wa:scale-110 transition-transform" />
            <span>WhatsApp</span>
          </a>

          <Link
            href={`/profile/${listing.id}`}
            className="text-xs font-semibold text-magenta-400 group-hover:text-magenta-300 flex items-center space-x-1 hover:underline"
          >
            <span>View Profile</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
