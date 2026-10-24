'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Filter, RotateCcw, DollarSign, Globe, Briefcase, Calendar } from 'lucide-react';
import LuxurySelect from '@/components/LuxurySelect';
import { getCityCurrencyConfig, formatPrice } from '@/lib/currency';

interface FilterSidebarProps {
  totalCount: number;
  citySlug?: string;
}

export default function FilterSidebar({ totalCount, citySlug }: FilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currencyConfig = getCityCurrencyConfig(citySlug);
  const defaultMaxRate = currencyConfig.slider.defaultMax;

  const currentService = searchParams.get('service') || 'ALL';
  const currentLanguage = searchParams.get('language') || 'ALL';
  const currentAvailability = searchParams.get('availability') || 'ALL';
  const currentMaxRate = searchParams.get('maxRate') || String(defaultMaxRate);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'ALL' || !value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const clearAllFilters = () => {
    router.replace(pathname, { scroll: false });
  };

  const services = [
    { id: 'ALL', label: 'All Services' },
    { id: 'Event Host', label: 'VIP Event Escorts' },
    { id: 'Dinner Date', label: 'Dinner Dates' },
    { id: 'Travel Concierge', label: 'Travel Escorts' },
    { id: 'Language Partner', label: 'Multilingual Escorts' },
  ];

  const languages = [
    { id: 'ALL', label: 'All Languages' },
    { id: 'English', label: 'English' },
    { id: 'French', label: 'French' },
    { id: 'Hindi', label: 'Hindi' },
    { id: 'German', label: 'German' },
    { id: 'Spanish', label: 'Spanish' },
    { id: 'Italian', label: 'Italian' },
    { id: 'Mandarin', label: 'Mandarin' },
  ];

  const availabilities = [
    { id: 'ALL', label: 'All Availability' },
    { id: 'AVAILABLE', label: 'Available Anytime' },
    { id: 'WEEKENDS_ONLY', label: 'Weekends Only' },
  ];

  const hasActiveFilters = currentService !== 'ALL' || currentLanguage !== 'ALL' || currentAvailability !== 'ALL' || currentMaxRate !== String(defaultMaxRate);

  return (
    <aside className="w-full lg:w-72 flex-shrink-0">
      <div className="p-6 rounded-2xl glass-panel sticky top-28 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-magenta-400" />
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Directory Filters
            </h3>
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="flex items-center space-x-1 text-xs text-neutral-400 hover:text-magenta-400 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Total Results Counter */}
        <div className="text-xs text-neutral-300 bg-white/5 px-3 py-2 rounded-xl border border-white/10">
          Showing <strong className="text-white font-semibold">{totalCount}</strong> verified escorts
        </div>

        {/* 1. Services Filter */}
        <div className="space-y-3">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-neutral-300">
            <Briefcase className="w-3.5 h-3.5 text-magenta-400" />
            <span>Service Category</span>
          </div>
          <div className="space-y-1.5">
            {services.map((svc) => (
              <label
                key={svc.id}
                className="flex items-center space-x-2 text-xs text-neutral-300 hover:text-white cursor-pointer py-1"
              >
                <input
                  type="radio"
                  name="serviceFilter"
                  checked={currentService === svc.id}
                  onChange={() => updateParam('service', svc.id)}
                  className="accent-[#D91680] w-3.5 h-3.5"
                />
                <span className={currentService === svc.id ? 'text-white font-medium' : ''}>
                  {svc.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* 2. Language Filter */}
        <div className="space-y-3 pt-4 border-t border-white/10">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-neutral-300">
            <Globe className="w-3.5 h-3.5 text-magenta-400" />
            <span>Spoken Languages</span>
          </div>
          <LuxurySelect
            value={currentLanguage}
            onChange={(val) => updateParam('language', val)}
            placeholder="Select language"
            className="w-full py-2 px-3 rounded-xl glass-input text-xs bg-[#1A0B1A]"
            options={languages.map((lang) => ({
              value: lang.id,
              label: lang.label,
            }))}
          />
        </div>

        {/* 3. Availability Filter */}
        <div className="space-y-3 pt-4 border-t border-white/10">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-neutral-300">
            <Calendar className="w-3.5 h-3.5 text-magenta-400" />
            <span>Escort Availability</span>
          </div>
          <div className="space-y-1.5">
            {availabilities.map((avail) => (
              <label
                key={avail.id}
                className="flex items-center space-x-2 text-xs text-neutral-300 hover:text-white cursor-pointer py-1"
              >
                <input
                  type="radio"
                  name="availabilityFilter"
                  checked={currentAvailability === avail.id}
                  onChange={() => updateParam('availability', avail.id)}
                  className="accent-[#D91680] w-3.5 h-3.5"
                />
                <span>{avail.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 4. Maximum Hourly Rate Slider */}
        <div className="space-y-3 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between text-xs font-semibold text-neutral-300">
            <div className="flex items-center space-x-1.5">
              <span className="text-magenta-400 font-bold text-xs">{currencyConfig.symbol}</span>
              <span>Max Hourly Rate</span>
            </div>
            <span className="text-magenta-400 font-bold">
              {formatPrice(Number(currentMaxRate), currencyConfig.currency)}/hr
            </span>
          </div>
          <input
            type="range"
            min={currencyConfig.slider.min}
            max={currencyConfig.slider.max}
            step={currencyConfig.slider.step}
            value={currentMaxRate}
            onChange={(e) => updateParam('maxRate', e.target.value)}
            className="w-full accent-[#D91680] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
            <span>{formatPrice(currencyConfig.slider.min, currencyConfig.currency)}/hr</span>
            <span>{formatPrice(currencyConfig.slider.max, currencyConfig.currency)}+/hr</span>
          </div>
        </div>

      </div>
    </aside>
  );
}
