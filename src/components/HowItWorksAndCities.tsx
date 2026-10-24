import Link from 'next/link';
import Image from 'next/image';
import { Search, ShieldCheck, CalendarCheck, MapPin, ArrowRight } from 'lucide-react';
import { City } from '@/lib/types';

interface HowItWorksAndCitiesProps {
  cities: City[];
}

export default function HowItWorksAndCities({ cities }: HowItWorksAndCitiesProps) {
  const steps = [
    {
      step: '01',
      title: 'Select City & Escort Profile',
      desc: 'Browse verified independent escort profiles across our global directory hubs. Filter by location, services, rates, languages, and real-time availability.',
      icon: Search,
    },
    {
      step: '02',
      title: 'Discreet Direct Inquiry',
      desc: 'Connect directly with verified escorts via private WhatsApp or submit a confidential request through our 24/7 VIP concierge desk with complete privacy.',
      icon: ShieldCheck,
    },
    {
      step: '03',
      title: 'Confirm VIP Escort Booking',
      desc: 'Finalize meeting details, incall/outcall preferences, and schedule terms. Experience elite companionship tailored for private evenings, dinner dates, or VIP travel.',
      icon: CalendarCheck,
    },
  ];

  return (
    <div className="py-20 bg-gradient-to-b from-[#0B070E] via-[#120815] to-[#0B070E] border-y border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HOW IT WORKS SECTION */}
        <section id="how-it-works" className="mb-24">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-magenta-400">
              The EscortVilla VIP Standard
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight mt-2 mb-4">
              Seamless Three-Step Escort Booking Protocol
            </h2>
            <p className="text-sm text-neutral-400 font-light leading-relaxed">
              Designed for distinguished gentlemen, business executives, and international travelers who demand absolute privacy, luxury, and elite escort services.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="relative p-8 rounded-3xl glass-card flex flex-col justify-between group hover:border-magenta-500/40"
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-3xl font-serif font-bold text-magenta-500/40 group-hover:text-magenta-400 transition-colors">
                        {item.step}
                      </span>
                      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-magenta-500/20 group-hover:border-magenta-500/30 transition-all">
                        <Icon className="w-5 h-5 text-magenta-300" />
                      </div>
                    </div>

                    <h3 className="text-lg font-serif font-bold text-white mb-3">
                      {item.title}
                    </h3>

                    <p className="text-xs text-neutral-300 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  <div className="mt-8 pt-4 border-t border-white/10 flex items-center space-x-1.5 text-xs font-medium text-magenta-400">
                    <span>Protocol Protected</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* CITY QUICK-LINKS SECTION (CRAWLABLE DIRECTORY HUBS) */}
        <section>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-magenta-400">
                Global Destinations
              </span>
              <h2 className="text-3xl font-serif font-bold text-white tracking-tight mt-1">
                Explore City Escort Directories
              </h2>
            </div>
            <p className="text-xs text-neutral-400 max-w-md mt-2 md:mt-0">
              Direct pre-rendered directory hubs with localized escort listings, verified photos, and WhatsApp contact.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {cities.map((city) => (
              <Link
                key={city.slug}
                href={`/companions-in-${city.slug}`}
                className="group relative h-72 rounded-2xl overflow-hidden glass-card transition-all duration-500 hover:-translate-y-1 hover:shadow-aura"
              >
                {/* City Hero Image */}
                <Image
                  src={city.heroImage}
                  alt={`Escorts in ${city.name}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#0B070E] via-[#0B070E]/50 to-transparent" />

                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <div className="flex items-center space-x-1.5 text-xs text-magenta-300 font-medium mb-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{city.stateOrCountry}</span>
                  </div>

                  <h3 className="text-2xl font-serif font-bold text-white group-hover:text-magenta-300 transition-colors flex items-center justify-between">
                    <span>{city.name}</span>
                    <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-magenta-400" />
                  </h3>

                  <span className="text-[11px] text-neutral-300 mt-2 block">
                    View Escorts in {city.name} &rarr;
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
