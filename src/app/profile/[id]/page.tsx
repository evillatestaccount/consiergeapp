import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getListingById, getListings } from '@/lib/db';
import ProfileGallery from '@/components/ProfileGallery';
import CompanionCard from '@/components/CompanionCard';
import { ProfileJsonLd } from '@/components/JsonLd';
import { formatPrice, getCurrencySymbol } from '@/lib/currency';
import { getWhatsAppUrl } from '@/lib/whatsapp';
import WhatsAppIcon from '@/components/WhatsAppIcon';
import WhatsAppDirectButton from '@/components/WhatsAppDirectButton';
import {
  ShieldCheck,
  MapPin,
  Calendar,
  Clock,
  Globe,
  Briefcase,
  CheckCircle2,
  Lock,
  ArrowRight,
  ArrowUpRight,
  HeartHandshake,
  MessageSquare,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

interface ProfilePageProps {
  params: {
    id: string;
  };
}

export const revalidate = 60;

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const listing = await getListingById(params.id);
  if (!listing) {
    return { title: 'Escort Profile Not Found' };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://escortvilla.com';
  const profileUrl = `${siteUrl}/profile/${listing.id}`;
  const cityName = listing.city?.name || listing.citySlug;
  const title = `${listing.fullName} - Escort in ${cityName} | VIP Escort Services`;
  const description = `${listing.fullName} is an independent VIP escort in ${cityName}. ${listing.headline}. Available for private dinner dates, travel accompaniment, and executive engagements. Rates from ${formatPrice(listing.hourlyRate, listing.currency)}/hr.`;
  const primaryImage = listing.images[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80';

  return {
    title,
    description,
    keywords: [
      listing.fullName,
      `escort in ${cityName}`,
      `vip escort ${cityName}`,
      `independent escort ${cityName}`,
      listing.headline,
      ...(listing.services || []),
      ...(listing.languages || []),
      'vip escorts',
      'call girls',
      'dinner date escort',
      'travel escort',
      'luxury escort service',
    ],
    alternates: {
      canonical: profileUrl,
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
      title,
      description,
      url: profileUrl,
      siteName: 'EscortVilla',
      images: [
        {
          url: primaryImage,
          width: 1200,
          height: 630,
          alt: `${listing.fullName} - Verified VIP Escort in ${cityName}`,
        },
      ],
      type: 'profile',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [primaryImage],
    },
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const listing = await getListingById(params.id);

  if (!listing) {
    notFound();
  }

  // Similar companions in same city
  const similarListings = await getListings({
    citySlug: listing.citySlug,
    status: 'PUBLISHED',
  });
  const filteredSimilar = similarListings.filter((l) => l.id !== listing.id).slice(0, 3);

  const availabilityConfig = {
    AVAILABLE: { label: 'Available for Immediate Reservation', color: 'bg-emerald-400', text: 'text-emerald-400' },
    WEEKENDS_ONLY: { label: 'Weekend Engagements Only', color: 'bg-amber-400', text: 'text-amber-400' },
    BOOKED: { label: 'Currently Reserved (Advance Inquiries Welcome)', color: 'bg-rose-400', text: 'text-rose-400' },
  }[listing.availability || 'AVAILABLE'];

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* JSON-LD Schema */}
      <ProfileJsonLd listing={listing} />

      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-xs text-neutral-400 mb-8 font-medium">
        <Link href="/" className="hover:text-white transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
        <Link href={`/companions-in-${listing.citySlug}`} className="hover:text-white transition-colors capitalize">
          Escorts in {listing.city?.name || listing.citySlug}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
        <span className="text-magenta-400 font-semibold">{listing.fullName}</span>
      </nav>

      {/* Main Profile Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Image Gallery & Badges (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <ProfileGallery images={listing.images} fullName={listing.fullName} />

          {/* Verified Credentials Card */}
          <div className="p-6 rounded-2xl glass-card space-y-4">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-magenta-400" />
              <span>EscortVilla Verification & Discretion</span>
            </h4>

            <div className="space-y-3 text-xs">
              <div className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-white font-medium">100% Real & Verified Escort Profile</span>
                  <p className="text-neutral-400 text-[11px]">Direct biometric and photo verification clearance.</p>
                </div>
              </div>

              <div className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-white font-medium">Elite VIP Escort Services</span>
                  <p className="text-neutral-400 text-[11px]">Specializing in private dinner dates and travel accompaniment.</p>
                </div>
              </div>

              <div className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-white font-medium">Strict Discretion & Privacy</span>
                  <p className="text-neutral-400 text-[11px]">Encrypted communication and total confidentiality guaranteed.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Profile Info & Booking Panel (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Header Area */}
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <Link
                href={`/companions-in-${listing.citySlug}`}
                className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-magenta-500/15 border border-magenta-500/30 text-magenta-300 text-xs font-medium hover:bg-magenta-500/25 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span className="capitalize">{listing.city?.name || listing.citySlug} Resident</span>
              </Link>

              <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-neutral-300">
                <span className={`w-2 h-2 rounded-full ${availabilityConfig.color} animate-pulse`} />
                <span className={availabilityConfig.text}>{availabilityConfig.label}</span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight">
              {listing.fullName}
            </h1>

            <p className="text-base sm:text-lg text-neutral-300 font-light mt-2 leading-relaxed">
              {listing.headline}
            </p>
          </div>

          {/* Rates Table Card */}
          <div className="p-6 rounded-2xl glass-panel space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <span className="text-xs font-semibold text-white uppercase tracking-wider">
                Escort Rates & Booking Structure
              </span>
              <span className="text-xs text-neutral-400">Currency: {listing.currency} ({getCurrencySymbol(listing.currency)})</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[11px] text-neutral-400 block mb-1">Hourly Escort Rate</span>
                <span className="text-2xl font-bold text-white tracking-tight">
                  {formatPrice(listing.hourlyRate, listing.currency)}
                </span>
                <span className="text-[10px] text-neutral-400 block mt-1">Min. 2 hours booking</span>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[11px] text-neutral-400 block mb-1">Full Day / VIP Travel</span>
                <span className="text-2xl font-bold text-white tracking-tight">
                  {formatPrice(listing.dailyRate, listing.currency)}
                </span>
                <span className="text-[10px] text-neutral-400 block mt-1">Up to 8 hours duration</span>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 col-span-2 sm:col-span-1">
                <span className="text-[11px] text-neutral-400 block mb-1">VIP Travel Escort</span>
                <span className="text-sm font-semibold text-magenta-300 block pt-1">
                  Bespoke Terms
                </span>
                <span className="text-[10px] text-neutral-400 block mt-1">Flights & private suite</span>
              </div>
            </div>

            {/* Action Buttons: WhatsApp & Concierge Desk */}
            <div className="pt-2 space-y-3">
              {/* WhatsApp Direct Contact Button with Analytics Tracking */}
              <WhatsAppDirectButton
                url={getWhatsAppUrl(listing)}
                name={listing.fullName}
                city={listing.city?.name || listing.citySlug}
              />

              {/* Concierge Desk Web Form Button */}
              <Link
                href={`/contact?listingId=${listing.id}&companionName=${encodeURIComponent(listing.fullName)}&targetCity=${encodeURIComponent(listing.city?.name || listing.citySlug)}`}
                className="w-full py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-white font-semibold text-xs tracking-wider uppercase flex items-center justify-center space-x-2 transition-all text-center"
              >
                <Sparkles className="w-4 h-4 text-magenta-400" />
                <span>Reserve via VIP Escort Web Desk</span>
              </Link>

              <p className="text-[11px] text-neutral-400 text-center mt-2.5">
                WhatsApp inquiries open with a pre-filled booking draft. Absolute discretion and VIP confidentiality assured.
              </p>
            </div>
          </div>

          {/* About & Concierge Bio */}
          <div className="space-y-4">
            <h3 className="text-xl font-serif font-bold text-white">
              About & Escort Services
            </h3>
            <div className="p-6 rounded-2xl glass-card text-neutral-300 text-sm leading-relaxed space-y-4">
              <p className="whitespace-pre-line">{listing.bio}</p>
            </div>
          </div>

          {/* Languages & Services Scope */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Spoken Languages */}
            <div className="p-6 rounded-2xl glass-card space-y-3">
              <div className="flex items-center space-x-2 text-xs font-semibold text-white uppercase tracking-wider">
                <Globe className="w-4 h-4 text-magenta-400" />
                <span>Languages Spoken</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {listing.languages.map((lang, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-white"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>

            {/* Services Scope */}
            <div className="p-6 rounded-2xl glass-card space-y-3">
              <div className="flex items-center space-x-2 text-xs font-semibold text-white uppercase tracking-wider">
                <Briefcase className="w-4 h-4 text-magenta-400" />
                <span>Booking Scope</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {listing.services.map((svc, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl bg-magenta-500/15 border border-magenta-500/30 text-xs font-medium text-magenta-200"
                  >
                    {svc}
                  </span>
                ))}
              </div>
            </div>

          </div>

          {/* Concierge Booking Etiquette Guidelines */}
          <div className="p-6 rounded-2xl bg-[#140815] border border-white/10 space-y-3 text-xs text-neutral-400">
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px] flex items-center space-x-2">
              <Lock className="w-3.5 h-3.5 text-magenta-400" />
              <span>Escort Booking Guidelines & Discretion Protocol</span>
            </h4>
            <p>
              Bookings through EscortVilla are handled with the highest standards of discretion and mutual respect. Independent escorts maintain full personal autonomy and discretion. All initial communications and arrangements are encrypted and private.
            </p>
          </div>

        </div>

      </div>

      {/* Similar Companions in this City */}
      {filteredSimilar.length > 0 && (
        <section className="mt-24 pt-12 border-t border-white/10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-magenta-400">
                Local Chapter
              </span>
              <h2 className="text-2xl font-serif font-bold text-white tracking-tight mt-1">
                Other Verified Escorts in {listing.city?.name || listing.citySlug}
              </h2>
            </div>
            <Link
              href={`/companions-in-${listing.citySlug}`}
              className="text-xs font-semibold text-magenta-400 hover:text-magenta-300"
            >
              View All {listing.city?.name || listing.citySlug} Escorts &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredSimilar.map((item) => (
              <CompanionCard key={item.id} listing={item} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
