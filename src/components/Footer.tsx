import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Sparkles, Lock, Globe, Mail, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#070308] border-t border-white/10 text-neutral-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          
          {/* Brand & Manifesto */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="relative w-9 h-9 flex-shrink-0">
                <Image
                  src="/logo.png"
                  alt="EscortVilla Logo"
                  width={36}
                  height={36}
                  className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(217,22,128,0.5)]"
                />
              </div>
              <span className="text-xl font-serif tracking-wider text-white font-bold">
                ESCORT<span className="text-magenta-400">VILLA</span> DIRECTORY
              </span>
            </div>
            
            <p className="text-neutral-400 text-xs leading-relaxed max-w-sm">
              The premier global directory for verified independent escorts and elite VIP escort services. 
              Curated exclusively for private dinner dates, luxury travel accompaniment, executive galas, and discreet bookings.
            </p>

            <div className="flex items-center space-x-4 pt-2 text-xs text-neutral-300">
              <div className="flex items-center space-x-1.5">
                <Lock className="w-3.5 h-3.5 text-magenta-400" />
                <span>100% Discretion</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-magenta-400" />
                <span>100% Verified Escorts</span>
              </div>
            </div>
          </div>

          {/* Quick Hubs */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
              City Escort Directories
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/companions-in-london" className="hover:text-magenta-400 transition-colors">
                  Escorts in London
                </Link>
              </li>
              <li>
                <Link href="/companions-in-new-york" className="hover:text-magenta-400 transition-colors">
                  Escorts in New York
                </Link>
              </li>
              <li>
                <Link href="/companions-in-delhi" className="hover:text-magenta-400 transition-colors">
                  Escorts in Delhi
                </Link>
              </li>
              <li>
                <Link href="/companions-in-mumbai" className="hover:text-magenta-400 transition-colors">
                  Escorts in Mumbai
                </Link>
              </li>
            </ul>
          </div>

          {/* Concierge Services */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
              Escort Services Scope
            </h4>
            <ul className="space-y-2 text-xs">
              <li>VIP Dinner Dates & Banquets</li>
              <li>Executive & Private Event Escorts</li>
              <li>Luxury Travel Companions</li>
              <li>High-Class Independent Escorts</li>
              <li>Multilingual & Model Escorts</li>
            </ul>
          </div>

          {/* Concierge & Trust */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
              Concierge & Trust
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/contact" className="hover:text-magenta-400 transition-colors">
                  VIP Escort Booking Desk
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-magenta-400 transition-colors">
                  Booking Protocols
                </Link>
              </li>
              <li className="text-neutral-400">Strict Identity Verification</li>
              <li className="text-neutral-400">100% Confidential & Encrypted</li>
            </ul>
          </div>

        </div>

        {/* 18+ Adult Content & Compliance Notice */}
        <div className="my-8 p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 text-rose-200/90 text-xs leading-relaxed flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          <div className="flex-shrink-0 px-2 py-0.5 rounded-md bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold text-xs uppercase tracking-wider">
            18+ ONLY
          </div>
          <p className="text-[11px] sm:text-xs">
            <strong>ADULTS ONLY WARNING:</strong> This website contains adult-oriented directories, VIP escort advertisements, and private companion services strictly for individuals aged 18 years or older (or the legal age of majority in your jurisdiction). All companions featured are confirmed consenting adults.
          </p>
        </div>

        {/* Ethical Standards & Disclaimers */}
        <div className="pt-8 border-t border-white/10 text-[11px] text-neutral-300 leading-relaxed space-y-3">
          <p>
            <strong>VIP Escort Services & Discretion Protocol:</strong> EscortVilla is an elite directory featuring verified independent escorts and luxury VIP escort services worldwide. We facilitate discreet introductions for private dinner dates, VIP travel accompaniment, social events, and executive companionship. All independent escorts retain complete autonomy over their private bookings.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between pt-4 text-neutral-400">
            <p>&copy; {new Date().getFullYear()} EscortVilla Ltd. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 sm:mt-0">
              <span>Strict Discretion</span>
              <span>Encrypted Inquiries</span>
              <span>100% Verified Escorts</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
