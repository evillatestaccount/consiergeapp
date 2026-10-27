'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Sparkles,
  MapPin,
  Mail,
  Phone,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  Clock,
  Lock,
  ChevronDown,
  Building,
} from 'lucide-react';
import ConciergeMap from '@/components/ConciergeMap';
import LuxurySelect from '@/components/LuxurySelect';
import { useUserLocation, getTimezoneLocation } from '@/lib/location';
import { event as trackGaEvent } from '@/lib/gtag';

export default function ContactClient() {
  const searchParams = useSearchParams();
  const { location } = useUserLocation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [targetCity, setTargetCity] = useState(() => {
    return searchParams.get('targetCity') || getTimezoneLocation().closestChapter;
  });
  const [listingId, setListingId] = useState<string | null>(null);
  const [companionName, setCompanionName] = useState<string>('');
  const [eventDate, setEventDate] = useState('');
  const [message, setMessage] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const lId = searchParams.get('listingId');
    const cName = searchParams.get('companionName');
    const tCity = searchParams.get('targetCity');

    if (lId) setListingId(lId);
    if (cName) setCompanionName(cName);
    if (tCity) {
      setTargetCity(tCity);
    } else if (location?.closestChapter) {
      setTargetCity(location.closestChapter);
    }

    // Default event date to 7 days in future
    const d = new Date();
    d.setDate(d.getDate() + 7);
    setEventDate(d.toISOString().split('T')[0]);
  }, [searchParams, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          targetCity: targetCity || 'London',
          listingId: listingId || null,
          eventDate,
          message,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit inquiry');
      }

      setSubmittedData({
        ...data.inquiry,
        companionName,
      });

      trackGaEvent({
        action: 'generate_lead',
        category: 'Inquiry',
        label: targetCity || 'General VIP Inquiry',
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  const offices = [
    { city: 'London', address: '28 Mayfair Place, Mayfair, London W1J 8BN', phone: '+44 20 7946 0190' },
    { city: 'New York', address: '767 Fifth Avenue, Manhattan, NY 10153', phone: '+1 212 555 0184' },
    { city: 'Delhi', address: 'Barakhamba Road, Connaught Place, New Delhi 110001', phone: '+91 11 4150 9900' },
    { city: 'Mumbai', address: 'Bandra Kurla Complex (BKC), Mumbai 400051', phone: '+91 22 6650 8800' },
  ];

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-magenta-500/15 border border-magenta-500/30 text-magenta-300 text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5 text-magenta-400" />
          <span>VIP Escort Booking Desk</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-serif font-bold text-white tracking-tight mb-4">
          Reserve VIP Escort Services
        </h1>
        <p className="text-sm sm:text-base text-neutral-300 font-light leading-relaxed">
          Submit your discreet VIP escort booking details or request a bespoke escort introduction. 
          All communications are encrypted and handled with absolute discretion.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Form (7 cols) */}
        <div className="lg:col-span-7">
          <div className="p-8 sm:p-10 rounded-3xl glass-panel relative overflow-hidden">
            
            {submittedData ? (
              <div className="text-center py-12 space-y-6">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                
                <div>
                  <h3 className="text-2xl font-serif font-bold text-white mb-2">
                    Inquiry Discreetly Registered
                  </h3>
                  <p className="text-xs text-neutral-300 max-w-md mx-auto leading-relaxed">
                    Thank you, <strong className="text-white">{submittedData.name}</strong>. A confirmation email has been dispatched to <strong className="text-white">{submittedData.email}</strong>.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-left max-w-md mx-auto text-xs space-y-2.5">
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-neutral-400">Concierge Ref ID:</span>
                    <span className="text-magenta-400 font-mono font-bold">#{submittedData.id.slice(-8).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Target City:</span>
                    <span className="text-white font-medium">{submittedData.targetCity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Event Date:</span>
                    <span className="text-white font-medium">
                      {new Date(submittedData.eventDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  {submittedData.companionName && (
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Requested Escort:</span>
                      <span className="text-white font-medium">{submittedData.companionName}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-white/10">
                    <span className="text-neutral-400">Protocol Status:</span>
                    <span className="text-emerald-400 font-semibold">Under Concierge Review</span>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => {
                      setSubmittedData(null);
                      setMessage('');
                    }}
                    className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-colors"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Companion Pre-Selection Alert */}
                {companionName && (
                  <div className="p-4 rounded-2xl bg-magenta-500/10 border border-magenta-500/30 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Sparkles className="w-4 h-4 text-magenta-400" />
                      <div className="text-xs">
                        <span className="text-neutral-400">Selected Escort: </span>
                        <strong className="text-white">{companionName}</strong>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setListingId(null);
                        setCompanionName('');
                      }}
                      className="text-[11px] text-neutral-400 hover:text-white"
                    >
                      Clear
                    </button>
                  </div>
                )}

                {errorMessage && (
                  <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                    {errorMessage}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Client Name */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                      Full Name / Dignitary Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Lord Harrington, Dr. Mehta"
                      className="w-full px-4 py-3 rounded-xl glass-input text-sm text-white placeholder-neutral-500"
                    />
                  </div>

                  {/* Client Email */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="client@executive.com"
                      className="w-full px-4 py-3 rounded-xl glass-input text-sm text-white placeholder-neutral-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Phone / WhatsApp */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                      Phone / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+44 20 7946 0000"
                      className="w-full px-4 py-3 rounded-xl glass-input text-sm text-white placeholder-neutral-500"
                    />
                  </div>

                  {/* Target City */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                      Target City *
                    </label>
                    <LuxurySelect
                      value={targetCity}
                      onChange={(val) => setTargetCity(val)}
                      placeholder="Select Destination City"
                      name="targetCity"
                      required
                      className="px-4 py-3 rounded-xl glass-input text-sm text-white bg-[#1A0B1A]"
                      options={[
                        { value: 'London', label: 'London', sublabel: 'United Kingdom Chapter HQ' },
                        { value: 'New York', label: 'New York', sublabel: 'Manhattan & Tristate Area' },
                        { value: 'Delhi', label: 'Delhi', sublabel: 'Connaught Place & Diplomatic Zone' },
                        { value: 'Mumbai', label: 'Mumbai', sublabel: 'Bandra Kurla Complex (BKC)' },
                        { value: 'International Travel', label: 'International Voyage / Other', sublabel: 'Global Private Tour Concierge' },
                      ]}
                    />
                  </div>
                </div>

                {/* Event Date */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                    Preferred Event Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl glass-input text-sm text-white bg-[#1A0B1A]"
                  />
                </div>

                {/* Event Details & Message */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                    Escort Booking Details & Special Requests *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Specify the occasion (e.g. Dinner Date, VIP Social Event, International Travel, Hotel Outcall/Incall), preferred duration, and any specific preferences..."
                    className="w-full px-4 py-3 rounded-xl glass-input text-sm text-white placeholder-neutral-500 leading-relaxed"
                  />
                </div>

                <div className="flex items-center space-x-2 text-[11px] text-neutral-400">
                  <Lock className="w-3.5 h-3.5 text-magenta-400 flex-shrink-0" />
                  <span>Submissions are encrypted and subject to strict confidentiality.</span>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#D91680] via-[#E62044] to-[#4B1248] hover:from-magenta-600 hover:to-crimson text-white font-semibold text-sm tracking-wider uppercase shadow-aura hover:shadow-aura-lg transition-all disabled:opacity-50"
                >
                  {submitting ? 'Transmitting VIP Booking Request...' : 'Dispatch VIP Escort Booking Request'}
                </button>
              </form>
            )}

          </div>
        </div>

        {/* Right Info & Map Placeholder (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Concierge Offices Card */}
          <div className="p-8 rounded-3xl glass-card space-y-6">
            <h3 className="text-lg font-serif font-bold text-white flex items-center space-x-2">
              <Building className="w-5 h-5 text-magenta-400" />
              <span>Global Escort Villa Chapters</span>
            </h3>

            <div className="space-y-4">
              {offices.map((office, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{office.city} Office</span>
                    <span className="text-[10px] text-magenta-300 uppercase font-semibold">Chapter HQ</span>
                  </div>
                  <p className="text-xs text-neutral-300">{office.address}</p>
                  <p className="text-[11px] text-neutral-400 pt-1">{office.phone}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Luxury Interactive Focused Map */}
          <ConciergeMap
            selectedCity={targetCity}
            onCitySelect={(city) => setTargetCity(city)}
          />

        </div>

      </div>

    </div>
  );
}
