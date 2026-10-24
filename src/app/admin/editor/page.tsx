'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  FileText,
  Upload,
  X,
  ExternalLink,
  MapPin,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import { City, CompanionListing } from '@/lib/types';
import LuxurySelect from '@/components/LuxurySelect';
import { formatPrice, getCurrencySymbol, getCityCurrencyConfig, SUPPORTED_CURRENCIES } from '@/lib/currency';

export default function EditorDashboard() {
  const [listings, setListings] = useState<CompanionListing[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [cityId, setCityId] = useState('');
  const [citySlug, setCitySlug] = useState('');
  const [services, setServices] = useState<string[]>(['Event Host']);
  const [languages, setLanguages] = useState<string[]>(['English']);
  const [hourlyRate, setHourlyRate] = useState<number>(250);
  const [dailyRate, setDailyRate] = useState<number>(1800);
  const [currency, setCurrency] = useState('USD');
  const [whatsapp, setWhatsapp] = useState('');
  const [availability, setAvailability] = useState('AVAILABLE');
  const [images, setImages] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
      }
    }
    if (isModalOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [listingsRes, citiesRes] = await Promise.all([
        fetch('/api/listings'),
        fetch('/api/cities'),
      ]);

      const listingsData = await listingsRes.json();
      const citiesData = await citiesRes.json();

      if (listingsData.success) setListings(listingsData.listings);
      if (citiesData.success) {
        setCities(citiesData.cities);
        if (citiesData.cities.length > 0 && !cityId) {
          setCityId(citiesData.cities[0].id);
          setCitySlug(citiesData.cities[0].slug);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openNewListingModal = () => {
    setEditingId(null);
    setCurrentStep(1);
    setFullName('');
    setHeadline('');
    setBio('');
    if (cities.length > 0) {
      setCityId(cities[0].id);
      setCitySlug(cities[0].slug);
      const cfg = getCityCurrencyConfig(cities[0].slug);
      setCurrency(cfg.currency);
      setHourlyRate(cfg.defaultHourlyRate);
      setDailyRate(cfg.defaultDailyRate);
    } else {
      setHourlyRate(300);
      setDailyRate(2000);
      setCurrency('USD');
    }
    setServices(['Event Host', 'Dinner Date']);
    setLanguages(['English', 'French']);
    setWhatsapp('');
    setAvailability('AVAILABLE');
    setImages(['https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80']);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (listing: CompanionListing) => {
    setEditingId(listing.id);
    setCurrentStep(1);
    setFullName(listing.fullName);
    setHeadline(listing.headline);
    setBio(listing.bio);
    setCityId(listing.cityId);
    setCitySlug(listing.citySlug);
    setServices(listing.services);
    setLanguages(listing.languages);
    setHourlyRate(listing.hourlyRate);
    setDailyRate(listing.dailyRate);
    setCurrency(listing.currency);
    setWhatsapp(listing.whatsapp || '');
    setAvailability(listing.availability);
    setImages(listing.images);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleCityChange = (selectedId: string) => {
    const found = cities.find(c => c.id === selectedId);
    if (found) {
      setCityId(found.id);
      setCitySlug(found.slug);
      const cfg = getCityCurrencyConfig(found.slug);
      setCurrency(cfg.currency);
      if (!editingId) {
        setHourlyRate(cfg.defaultHourlyRate);
        setDailyRate(cfg.defaultDailyRate);
      }
    }
  };

  const toggleService = (svc: string) => {
    if (services.includes(svc)) {
      if (services.length > 1) setServices(services.filter(s => s !== svc));
    } else {
      setServices([...services, svc]);
    }
  };

  const toggleLanguage = (lang: string) => {
    if (languages.includes(lang)) {
      if (languages.length > 1) setLanguages(languages.filter(l => l !== lang));
    } else {
      setLanguages([...languages, lang]);
    }
  };

  const addImageUrl = () => {
    if (imageUrlInput.trim()) {
      setImages([...images, imageUrlInput.trim()]);
      setImageUrlInput('');
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setImages([...images, data.url]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFormSubmit = async (asDraft = false) => {
    setFormError('');
    setFormSubmitting(true);

    const payload = {
      fullName,
      headline,
      bio,
      cityId,
      citySlug,
      services,
      languages,
      hourlyRate,
      dailyRate,
      currency,
      whatsapp: whatsapp.trim() || undefined,
      availability,
      images,
      status: asDraft ? 'DRAFT' : 'PENDING_REVIEW',
    };

    try {
      const url = editingId ? `/api/listings/${editingId}` : '/api/listings';
      const method = editingId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save listing');
      }

      setIsModalOpen(false);
      setFeedbackToast(
        asDraft
          ? 'Listing saved as Draft.'
          : 'Listing submitted for SuperAdmin Review (PENDING_REVIEW).'
      );
      setTimeout(() => setFeedbackToast(null), 4000);
      loadData();
    } catch (err: any) {
      setFormError(err.message || 'Error saving listing');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    try {
      await fetch(`/api/listings/${id}`, { method: 'DELETE' });
      setFeedbackToast('Listing removed.');
      setTimeout(() => setFeedbackToast(null), 3000);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredListings = listings.filter((l) => {
    const matchesSearch =
      l.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.headline.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const availableServices = [
    'Event Host',
    'Dinner Date',
    'Travel Concierge',
    'Language Partner',
    'Corporate Protocol',
    'Art Fair Escort',
  ];

  const availableLanguages = [
    'English',
    'French',
    'Hindi',
    'German',
    'Spanish',
    'Italian',
    'Mandarin',
    'Russian',
  ];

  return (
    <div className="space-y-8">
      {/* Toast */}
      {feedbackToast && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#D91680] to-[#E62044] text-white text-xs font-semibold shadow-2xl flex items-center space-x-2 animate-bounce">
          <Sparkles className="w-4 h-4" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* Header & New Listing Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
            Curator & Editor Workspace
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Manage your companion portfolio, prepare draft profiles, and submit listings for SuperAdmin verification.
          </p>
        </div>

        <button
          onClick={openNewListingModal}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#D91680] to-[#E62044] hover:from-magenta-600 hover:to-crimson text-white font-semibold text-xs tracking-wider uppercase shadow-aura flex items-center justify-center space-x-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Listing</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-card">
          <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Total Listings</div>
          <div className="text-2xl font-bold text-white mt-1">{listings.length}</div>
        </div>
        <div className="p-5 rounded-2xl glass-card">
          <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Published</span>
          </div>
          <div className="text-2xl font-bold text-white mt-1">
            {listings.filter((l) => l.status === 'PUBLISHED').length}
          </div>
        </div>
        <div className="p-5 rounded-2xl glass-card">
          <div className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Under Review</span>
          </div>
          <div className="text-2xl font-bold text-white mt-1">
            {listings.filter((l) => l.status === 'PENDING_REVIEW').length}
          </div>
        </div>
        <div className="p-5 rounded-2xl glass-card">
          <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center space-x-1.5">
            <FileText className="w-3.5 h-3.5" />
            <span>Drafts</span>
          </div>
          <div className="text-2xl font-bold text-white mt-1">
            {listings.filter((l) => l.status === 'DRAFT').length}
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-4 rounded-2xl glass-card">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by companion name or headline..."
            className="w-full pl-10 pr-4 py-2 rounded-xl glass-input text-xs text-white placeholder-neutral-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs text-neutral-400">Status:</span>
          {['ALL', 'PUBLISHED', 'PENDING_REVIEW', 'DRAFT'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                statusFilter === st
                  ? 'bg-magenta-500/25 text-magenta-300 border border-magenta-500/40'
                  : 'bg-white/5 text-neutral-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Listings Table */}
      <div className="rounded-2xl glass-panel overflow-hidden border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/5 text-neutral-400 uppercase tracking-wider text-[10px] border-b border-white/10">
              <tr>
                <th className="py-4 px-6">Companion</th>
                <th className="py-4 px-6">City Chapter</th>
                <th className="py-4 px-6">Honorarium Rates</th>
                <th className="py-4 px-6">Availability</th>
                <th className="py-4 px-6">Moderation Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredListings.map((listing) => {
                const statusBadge = {
                  PUBLISHED: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
                  PENDING_REVIEW: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
                  DRAFT: 'bg-neutral-500/15 text-neutral-300 border-neutral-500/30',
                  ARCHIVED: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
                }[listing.status || 'DRAFT'];

                return (
                  <tr key={listing.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="relative w-12 h-14 rounded-xl overflow-hidden bg-white/5 flex-shrink-0">
                          <Image
                            src={listing.images[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                            alt={listing.fullName}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-semibold text-white text-sm">{listing.fullName}</div>
                          <div className="text-neutral-400 text-[11px] line-clamp-1 max-w-xs">{listing.headline}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <span className="capitalize px-2.5 py-1 rounded-md bg-white/5 border border-white/10 font-medium text-neutral-200">
                        {listing.city?.name || listing.citySlug}
                      </span>
                    </td>

                    <td className="py-4 px-6 font-mono text-neutral-200">
                      <div>{formatPrice(listing.hourlyRate, listing.currency)} / hr</div>
                      <div className="text-[10px] text-neutral-400">{formatPrice(listing.dailyRate, listing.currency)} / day</div>
                    </td>

                    <td className="py-4 px-6 text-neutral-300 capitalize">
                      {listing.availability.replace('_', ' ').toLowerCase()}
                    </td>

                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusBadge}`}>
                        {listing.status}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {listing.status === 'PUBLISHED' && (
                          <Link
                            href={`/profile/${listing.id}`}
                            target="_blank"
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white"
                            title="View Public Profile"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        )}
                        <button
                          onClick={() => openEditModal(listing)}
                          className="p-2 rounded-lg bg-white/5 hover:bg-magenta-500/20 hover:text-magenta-300 text-neutral-300"
                          title="Edit Listing"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(listing.id)}
                          className="p-2 rounded-lg bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 text-neutral-300"
                          title="Delete Listing"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredListings.length === 0 && (
          <div className="text-center py-16 text-neutral-400">
            No companion listings found matching your filter.
          </div>
        )}
      </div>

      {/* MULTI-STEP ADD / EDIT MODAL */}
      {isModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="relative w-full max-w-2xl bg-[#140815] border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl my-8">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div>
                <h3 className="text-lg font-serif font-bold text-white">
                  {editingId ? 'Edit Companion Listing' : 'Create New Companion Profile'}
                </h3>
                <p className="text-xs text-neutral-400">Step {currentStep} of 4</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper Indicator */}
            <div className="flex items-center justify-between mb-8">
              {[
                { step: 1, label: 'Profile' },
                { step: 2, label: 'City & Scope' },
                { step: 3, label: 'Pricing' },
                { step: 4, label: 'Portraits' },
              ].map((s) => (
                <div key={s.step} className="flex-1 flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      currentStep === s.step
                        ? 'bg-gradient-to-r from-[#D91680] to-[#E62044] text-white shadow-aura'
                        : currentStep > s.step
                        ? 'bg-magenta-500/20 text-magenta-300 border border-magenta-500/40'
                        : 'bg-white/5 text-neutral-500 border border-white/10'
                    }`}
                  >
                    {s.step}
                  </div>
                  <span className="hidden sm:inline-block ml-2 text-xs font-medium text-neutral-300">
                    {s.label}
                  </span>
                  {s.step < 4 && <div className="flex-1 h-0.5 bg-white/10 mx-2" />}
                </div>
              ))}
            </div>

            {formError && (
              <div className="mb-4 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                {formError}
              </div>
            )}

            {/* Step 1: Basic Profile Info and Bio */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Lady Vivienne St. Clair"
                    className="w-full px-4 py-3 rounded-xl glass-input text-xs text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                    Professional Headline *
                  </label>
                  <input
                    type="text"
                    required
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="e.g. Corporate Gala Host & International Protocol Specialist"
                    className="w-full px-4 py-3 rounded-xl glass-input text-xs text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                    Concierge Bio & Background *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Detailed biographical profile highlighting education, conversational specialties, diplomatic decorum, and formal event credentials..."
                    className="w-full px-4 py-3 rounded-xl glass-input text-xs text-white leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* Step 2: City & Event Scope */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                    Assigned City Chapter *
                  </label>
                  <LuxurySelect
                    value={cityId}
                    onChange={handleCityChange}
                    placeholder="Select City Chapter"
                    className="w-full px-4 py-3 rounded-xl glass-input text-xs text-white bg-[#1A0B1A]"
                    options={cities.map((c) => ({
                      value: c.id,
                      label: c.name,
                      sublabel: c.stateOrCountry,
                    }))}
                  />
                </div>

                {/* Services multi-select tags */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                    Accompaniment Services Scope
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableServices.map((svc) => (
                      <button
                        key={svc}
                        type="button"
                        onClick={() => toggleService(svc)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                          services.includes(svc)
                            ? 'bg-magenta-500/25 text-magenta-300 border border-magenta-500/50 shadow-sm'
                            : 'bg-white/5 text-neutral-400 border border-white/10 hover:text-white'
                        }`}
                      >
                        {svc}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Languages multi-select tags */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                    Spoken Languages
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableLanguages.map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => toggleLanguage(lang)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                          languages.includes(lang)
                            ? 'bg-magenta-500/25 text-magenta-300 border border-magenta-500/50 shadow-sm'
                            : 'bg-white/5 text-neutral-400 border border-white/10 hover:text-white'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Rates & Availability */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                    Currency Chapter
                  </label>
                  <LuxurySelect
                    value={currency}
                    onChange={(val) => setCurrency(val)}
                    placeholder="Select Currency"
                    className="w-full px-4 py-3 rounded-xl glass-input text-xs text-white bg-[#1A0B1A]"
                    options={SUPPORTED_CURRENCIES.map((c) => ({
                      value: c.code,
                      label: c.label,
                    }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                      Hourly Honorarium ({getCurrencySymbol(currency)} {currency}) *
                    </label>
                    <input
                      type="number"
                      required
                      min={10}
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl glass-input text-xs text-white font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                      Daily Conclave Rate ({getCurrencySymbol(currency)} {currency}) *
                    </label>
                    <input
                      type="number"
                      required
                      min={50}
                      value={dailyRate}
                      onChange={(e) => setDailyRate(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl glass-input text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                    Direct WhatsApp Number (with country code)
                  </label>
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="+44 7911 123456 or +91 98765 43210"
                    className="w-full px-4 py-3 rounded-xl glass-input text-xs text-white font-mono"
                  />
                  <span className="text-[10px] text-neutral-400 block">
                    Clients will click to open direct WhatsApp chats with this number. If empty, the city concierge desk is used as fallback.
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                    Host Schedule Availability
                  </label>
                  <LuxurySelect
                    value={availability}
                    onChange={(val) => setAvailability(val)}
                    placeholder="Select Availability"
                    className="w-full px-4 py-3 rounded-xl glass-input text-xs text-white bg-[#1A0B1A]"
                    options={[
                      { value: 'AVAILABLE', label: 'Available for Engagements', badge: 'Active' },
                      { value: 'WEEKENDS_ONLY', label: 'Weekends Only', badge: 'Part-time' },
                      { value: 'BOOKED', label: 'Currently Reserved', badge: 'Reserved' },
                    ]}
                  />
                </div>
              </div>
            )}

            {/* Step 4: Photo Gallery & Drag-and-drop / Upload Uploader with instant preview */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                    Upload Portrait or Add Image URL
                  </label>
                  
                  {/* Drag-and-Drop Area */}
                  <label className="border-2 border-dashed border-white/20 hover:border-magenta-500/50 rounded-2xl p-6 text-center block cursor-pointer bg-white/5 transition-colors">
                    <Upload className="w-8 h-8 text-magenta-400 mx-auto mb-2" />
                    <span className="text-xs font-medium text-white block">
                      Click to choose image file or drag and drop
                    </span>
                    <span className="text-[10px] text-neutral-400 block mt-1">
                      PNG, JPG, WebP up to 5MB
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  {/* Direct URL Input */}
                  <div className="flex gap-2 pt-2">
                    <input
                      type="url"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      placeholder="Or paste direct image URL (Unsplash, Cloudinary)..."
                      className="flex-1 px-4 py-2.5 rounded-xl glass-input text-xs text-white placeholder-neutral-500"
                    />
                    <button
                      type="button"
                      onClick={addImageUrl}
                      className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white"
                    >
                      Add URL
                    </button>
                  </div>
                </div>

                {/* Thumbnails preview */}
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
                    Portraits Preview ({images.length})
                  </span>
                  <div className="grid grid-cols-3 gap-3">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative aspect-[3/4] rounded-xl overflow-hidden group bg-white/5 border border-white/10">
                        <Image src={img} alt="Preview" fill className="object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1.5 right-1.5 p-1 rounded-md bg-black/70 hover:bg-rose-600 text-white transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        {idx === 0 && (
                          <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-magenta-500 text-white uppercase">
                            Primary
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Stepper Action Buttons */}
            <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-neutral-300 flex items-center space-x-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center space-x-2">
                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(currentStep + 1)}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D91680] to-[#E62044] text-white text-xs font-semibold shadow-aura flex items-center space-x-1"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      disabled={formSubmitting}
                      onClick={() => handleFormSubmit(true)}
                      className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-neutral-200 text-xs font-medium transition-colors"
                    >
                      Save Draft
                    </button>
                    <button
                      type="button"
                      disabled={formSubmitting}
                      onClick={() => handleFormSubmit(false)}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D91680] to-[#E62044] text-white text-xs font-semibold uppercase tracking-wider shadow-aura transition-all"
                    >
                      {formSubmitting ? 'Submitting...' : 'Submit for Review'}
                    </button>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
