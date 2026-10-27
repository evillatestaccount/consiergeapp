'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { MapPin, Sparkles, Menu, X, ChevronDown } from 'lucide-react';
import { useUserLocation } from '@/lib/location';

interface NavbarProps {
  cities?: Array<{ name: string; slug: string }>;
}

export default function Navbar({ cities = [] }: NavbarProps) {
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const { location } = useUserLocation();

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setCityDropdownOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setCityDropdownOpen(false);
      }
    }

    if (cityDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [cityDropdownOpen]);

  const defaultCities = cities.length > 0 ? cities : [
    { name: 'London', slug: 'london' },
    { name: 'New York', slug: 'new-york' },
    { name: 'Delhi', slug: 'delhi' },
    { name: 'Mumbai', slug: 'mumbai' },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0B070E]/80 border-b border-white/10 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative w-11 h-11 flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
              <Image
                src="/logo.png"
                alt="EscortVilla Logo"
                width={44}
                height={44}
                className="w-full h-full object-contain filter drop-shadow-[0_0_12px_rgba(217,22,128,0.6)]"
                priority
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-serif tracking-wider text-white font-bold group-hover:text-magenta-300 transition-colors">
                  ESCORT<span className="text-magenta-400">VILLA</span>
                </span>
                <span className="px-1.5 py-0.5 rounded-md border border-rose-500/50 bg-rose-500/15 text-rose-300 text-[10px] font-bold tracking-wider uppercase">
                  18+
                </span>
              </div>
              <span className="text-[10px] tracking-[0.25em] text-magenta-300 block font-sans uppercase font-medium">
                VIP Escort Directory
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/"
              className={`text-sm tracking-wide font-medium transition-colors hover:text-white ${
                pathname === '/' ? 'text-magenta-400 font-semibold' : 'text-neutral-300'
              }`}
            >
              Directory
            </Link>

            {/* City Hubs Dropdown */}
            <div ref={dropdownRef} className="relative">
              <button
                type="button"
                onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
                className={`flex items-center space-x-1.5 text-sm tracking-wide font-medium transition-colors py-2 px-3 rounded-xl ${
                  cityDropdownOpen
                    ? 'text-white bg-white/10'
                    : 'text-neutral-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>Global Cities</span>
                <ChevronDown
                  className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${
                    cityDropdownOpen ? 'rotate-180 text-magenta-400' : ''
                  }`}
                />
              </button>

              {cityDropdownOpen && (
                <div className="absolute top-full left-0 pt-2 w-64 z-50">
                  <div className="rounded-2xl bg-[#170C18]/95 backdrop-blur-2xl border border-white/20 shadow-2xl py-2 overflow-hidden">
                    <div className="px-4 py-2 border-b border-white/10 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
                      <span>Select City Directory</span>
                      <Sparkles className="w-3 h-3 text-magenta-400" />
                    </div>
                    {defaultCities.map((city) => (
                      <Link
                        key={city.slug}
                        href={`/companions-in-${city.slug}`}
                        prefetch={true}
                        onClick={() => setCityDropdownOpen(false)}
                        className="flex items-center justify-between px-4 py-2.5 text-sm text-neutral-200 hover:text-white hover:bg-magenta-500/20 hover:pl-5 transition-all cursor-pointer"
                      >
                        <span>Companions in {city.name}</span>
                        <MapPin className="w-3.5 h-3.5 text-magenta-400 opacity-60" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/#how-it-works"
              className="text-sm tracking-wide font-medium text-neutral-300 hover:text-white transition-colors"
            >
              How It Works
            </Link>

            <Link
              href="/contact"
              className={`text-sm tracking-wide font-medium transition-colors hover:text-white ${
                pathname === '/contact' ? 'text-magenta-400 font-semibold' : 'text-neutral-300'
              }`}
            >
              Concierge Desk
            </Link>
          </nav>

          {/* Right Action & Location Indicator */}
          <div className="hidden lg:flex items-center space-x-4">
            {location && (
              <Link
                href={`/companions-in-${location.slug}`}
                className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-neutral-300 hover:text-white transition-colors"
                title={`Explore escorts in ${location.displayName}`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <MapPin className="w-3.5 h-3.5 text-magenta-400" />
                <span>Detected: <strong className="text-white font-medium">{location.displayName}</strong></span>
              </Link>
            )}

            <Link
              href="/contact"
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#D91680] to-[#E62044] hover:from-magenta-600 hover:to-crimson text-white text-xs font-semibold tracking-wider uppercase shadow-aura hover:shadow-aura-lg transition-all"
            >
              Book Escort
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-white/5 text-neutral-200 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#120814] border-b border-white/15 px-4 pt-4 pb-6 space-y-4">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-white py-1"
          >
            Escort Directory Home
          </Link>
          
          <div className="py-2 border-y border-white/10 space-y-2">
            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              City Escort Directories
            </div>
            {defaultCities.map(c => (
              <Link
                key={c.slug}
                href={`/companions-in-${c.slug}`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between text-sm text-neutral-300 hover:text-white py-1"
              >
                <span>Escorts in {c.name}</span>
                <MapPin className="w-3.5 h-3.5 text-magenta-400" />
              </Link>
            ))}
          </div>

          <Link
            href="/#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-white py-1"
          >
            How It Works
          </Link>

          <Link
            href="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-white py-1"
          >
            Concierge Desk & Inquiries
          </Link>

          <div className="pt-2">
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-3 rounded-xl bg-gradient-to-r from-[#D91680] to-[#E62044] text-white text-xs font-semibold uppercase tracking-wider block"
            >
              Book Escort
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
