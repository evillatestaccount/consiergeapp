'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
  Users,
  MapPin,
  Inbox,
  Layers,
  ExternalLink,
  Plus,
  RefreshCw,
  Mail,
  Phone,
  AlertTriangle,
  Send,
  Eye,
} from 'lucide-react';
import { City, CompanionListing, Inquiry, User } from '@/lib/types';
import { formatPrice } from '@/lib/currency';

export default function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState<'moderation' | 'editors' | 'cities' | 'inquiries'>('moderation');
  
  const [stats, setStats] = useState<any>(null);
  const [listings, setListings] = useState<CompanionListing[]>([]);
  const [editors, setEditors] = useState<User[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New City Modal
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [newCityName, setNewCityName] = useState('');
  const [newCitySlug, setNewCitySlug] = useState('');
  const [newCityCountry, setNewCityCountry] = useState('');
  const [newCityImage, setNewCityImage] = useState('');
  const [citySubmitting, setCitySubmitting] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsCityModalOpen(false);
      }
    }
    if (isCityModalOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isCityModalOpen]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      const [statsRes, listingsRes, editorsRes, citiesRes, inquiriesRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/listings?status=ALL'),
        fetch('/api/admin/editors'),
        fetch('/api/cities'),
        fetch('/api/inquiries'),
      ]);

      const [statsData, listingsData, editorsData, citiesData, inquiriesData] = await Promise.all([
        statsRes.json(),
        listingsRes.json(),
        editorsRes.json(),
        citiesRes.json(),
        inquiriesRes.json(),
      ]);

      if (statsData.success) setStats(statsData.stats);
      if (listingsData.success) setListings(listingsData.listings);
      if (editorsData.success) setEditors(editorsData.users);
      if (citiesData.success) setCities(citiesData.cities);
      if (inquiriesData.success) setInquiries(inquiriesData.inquiries);
    } catch (err) {
      console.error('SuperAdmin load error:', err);
    } finally {
      setLoading(false);
    }
  };

  // 1. APPROVE LISTING (Sets PUBLISHED & triggers ISR)
  const handleApproveListing = async (listing: CompanionListing) => {
    try {
      const res = await fetch(`/api/listings/${listing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PUBLISHED', verificationBadge: true }),
      });
      const data = await res.json();
      if (data.success) {
        // Also call revalidation endpoint explicitly to test on-demand ISR
        await fetch(`/api/revalidate?path=/companions-in-${listing.citySlug}`, { method: 'POST' });
        showToast(`Approved "${listing.fullName}". Published & On-Demand ISR Revalidated.`);
        loadAll();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 2. REJECT / DRAFT LISTING
  const handleRejectListing = async (id: string) => {
    try {
      const res = await fetch(`/api/listings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'DRAFT', moderatorComment: 'Requires protocol revisions.' }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Listing returned to Draft for editor revisions.');
        loadAll();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 3. APPROVE EDITOR (Sets ACTIVE & triggers welcome email via Nodemailer)
  const handleApproveEditor = async (editor: User) => {
    try {
      const res = await fetch(`/api/admin/editors/${editor.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ACTIVE' }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Editor "${editor.name}" approved! Automated welcome email dispatched.`);
        loadAll();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 4. SUSPEND EDITOR
  const handleSuspendEditor = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    try {
      const res = await fetch(`/api/admin/editors/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Editor status updated to ${nextStatus}.`);
        loadAll();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 5. UPDATE INQUIRY STATUS
  const handleUpdateInquiry = async (id: string, status: 'CONTACTED' | 'RESOLVED') => {
    try {
      const res = await fetch(`/api/inquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Inquiry marked as ${status}.`);
        loadAll();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 6. CREATE NEW CITY
  const handleCreateCity = async (e: React.FormEvent) => {
    e.preventDefault();
    setCitySubmitting(true);
    try {
      const res = await fetch('/api/cities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCityName,
          slug: newCitySlug.toLowerCase().trim(),
          stateOrCountry: newCityCountry,
          heroImage: newCityImage || 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=1600&q=80',
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`City "${newCityName}" registered! Static route enabled.`);
        setIsCityModalOpen(false);
        setNewCityName('');
        setNewCitySlug('');
        setNewCityCountry('');
        setNewCityImage('');
        loadAll();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCitySubmitting(false);
    }
  };

  const pendingListings = listings.filter((l) => l.status === 'PENDING_REVIEW');
  const pendingEditors = editors.filter((e) => e.status === 'PENDING_APPROVAL');

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#D91680] to-[#E62044] text-white text-xs font-semibold shadow-2xl flex items-center space-x-2 animate-bounce">
          <Sparkles className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-magenta-500/15 border border-magenta-500/30 text-magenta-300 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>SuperAdmin Executive Suite</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
            Directory Governance & Moderation
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Review pending companion profiles, moderate editor agencies, manage static city hubs, and process VIP concierge inquiries.
          </p>
        </div>

        <button
          onClick={loadAll}
          className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-neutral-300 flex items-center space-x-2 self-start sm:self-auto transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sync Data</span>
        </button>
      </div>

      {/* High-Level Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-card">
          <div className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Listings Queue</span>
          </div>
          <div className="text-2xl font-bold text-white mt-1">{pendingListings.length}</div>
          <div className="text-[10px] text-neutral-400 mt-1">Awaiting moderation</div>
        </div>

        <div className="p-5 rounded-2xl glass-card">
          <div className="text-[11px] font-semibold text-magenta-300 uppercase tracking-wider flex items-center space-x-1.5">
            <Users className="w-3.5 h-3.5" />
            <span>Pending Editors</span>
          </div>
          <div className="text-2xl font-bold text-white mt-1">{pendingEditors.length}</div>
          <div className="text-[10px] text-neutral-400 mt-1">Awaiting activation</div>
        </div>

        <div className="p-5 rounded-2xl glass-card">
          <div className="text-[11px] font-semibold text-neutral-300 uppercase tracking-wider flex items-center space-x-1.5">
            <MapPin className="w-3.5 h-3.5 text-magenta-400" />
            <span>Active City Hubs</span>
          </div>
          <div className="text-2xl font-bold text-white mt-1">{cities.length}</div>
          <div className="text-[10px] text-neutral-400 mt-1">SSG pre-rendered slugs</div>
        </div>

        <div className="p-5 rounded-2xl glass-card">
          <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
            <Inbox className="w-3.5 h-3.5" />
            <span>VIP Inquiries</span>
          </div>
          <div className="text-2xl font-bold text-white mt-1">{inquiries.length}</div>
          <div className="text-[10px] text-neutral-400 mt-1">
            {inquiries.filter((i) => i.status === 'NEW').length} new booking requests
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex border-b border-white/10 space-x-6 text-sm">
        <button
          onClick={() => setActiveTab('moderation')}
          className={`pb-3 font-semibold relative transition-colors ${
            activeTab === 'moderation' ? 'text-magenta-400' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <span>Moderation Queue</span>
          {pendingListings.length > 0 && (
            <span className="ml-2 px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40">
              {pendingListings.length}
            </span>
          )}
          {activeTab === 'moderation' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#D91680] to-[#E62044]" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('editors')}
          className={`pb-3 font-semibold relative transition-colors ${
            activeTab === 'editors' ? 'text-magenta-400' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <span>Editor Agency Management</span>
          {pendingEditors.length > 0 && (
            <span className="ml-2 px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40">
              {pendingEditors.length}
            </span>
          )}
          {activeTab === 'editors' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#D91680] to-[#E62044]" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('cities')}
          className={`pb-3 font-semibold relative transition-colors ${
            activeTab === 'cities' ? 'text-magenta-400' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <span>City Hub Management</span>
          {activeTab === 'cities' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#D91680] to-[#E62044]" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('inquiries')}
          className={`pb-3 font-semibold relative transition-colors ${
            activeTab === 'inquiries' ? 'text-magenta-400' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <span>Concierge Inbox</span>
          {inquiries.filter((i) => i.status === 'NEW').length > 0 && (
            <span className="ml-2 px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              {inquiries.filter((i) => i.status === 'NEW').length}
            </span>
          )}
          {activeTab === 'inquiries' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#D91680] to-[#E62044]" />
          )}
        </button>
      </div>

      {/* TAB 1: LISTING MODERATION QUEUE */}
      {activeTab === 'moderation' && (
        <div className="space-y-6">
          <div className="rounded-2xl glass-panel overflow-hidden border border-white/10">
            <div className="p-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                Pending & Published Companions
              </span>
              <span className="text-xs text-neutral-400">{listings.length} total entries</span>
            </div>

            <div className="divide-y divide-white/5">
              {listings.map((item) => (
                <div key={item.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/5 transition-colors">
                  <div className="flex items-start space-x-4">
                    <div className="relative w-14 h-16 rounded-xl overflow-hidden bg-white/5 flex-shrink-0">
                      <Image
                        src={item.images[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                        alt={item.fullName}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-white">{item.fullName}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            item.status === 'PUBLISHED'
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : item.status === 'PENDING_REVIEW'
                              ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                              : 'bg-neutral-500/15 text-neutral-300 border-neutral-500/30'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-300 mt-0.5 line-clamp-1">{item.headline}</p>
                      <div className="flex items-center space-x-4 mt-2 text-[11px] text-neutral-400">
                        <span>City: <strong className="text-white capitalize">{item.city?.name || item.citySlug}</strong></span>
                        <span>Rate: <strong className="text-white">{formatPrice(item.hourlyRate, item.currency)}/hr</strong></span>
                        <span>Curator: <strong className="text-neutral-300">{item.editor?.name || 'Staff Editor'}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 self-end md:self-auto">
                    {item.status === 'PUBLISHED' && (
                      <Link
                        href={`/profile/${item.id}`}
                        target="_blank"
                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-neutral-300 flex items-center space-x-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View</span>
                      </Link>
                    )}

                    {item.status === 'PENDING_REVIEW' && (
                      <>
                        <button
                          onClick={() => handleRejectListing(item.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-rose-500/20 hover:text-rose-300 text-xs text-neutral-300 transition-colors"
                        >
                          Request Revision
                        </button>
                        <button
                          onClick={() => handleApproveListing(item)}
                          className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#D91680] to-[#E62044] hover:from-magenta-600 hover:to-crimson text-white text-xs font-semibold shadow-aura flex items-center space-x-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Approve & Publish (ISR)</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EDITOR MANAGEMENT */}
      {activeTab === 'editors' && (
        <div className="rounded-2xl glass-panel overflow-hidden border border-white/10">
          <div className="p-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
              Registered Agency Editors
            </span>
            <span className="text-xs text-neutral-400">{editors.length} editors registered</span>
          </div>

          <div className="divide-y divide-white/5">
            {editors.map((editor) => {
              const statusConfig = {
                ACTIVE: { label: 'Active Curator', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
                PENDING_APPROVAL: { label: 'Pending Approval', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
                SUSPENDED: { label: 'Suspended', color: 'bg-rose-500/15 text-rose-400 border-rose-500/30' },
              }[editor.status || 'PENDING_APPROVAL'];

              return (
                <div key={editor.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/5 transition-colors">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-white">{editor.name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-1">{editor.email}</p>
                    <div className="text-[10px] text-neutral-500 mt-1">Role: {editor.role}</div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {editor.status === 'PENDING_APPROVAL' && (
                      <button
                        onClick={() => handleApproveEditor(editor)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Approve & Dispatch Welcome Email</span>
                      </button>
                    )}

                    {editor.status !== 'PENDING_APPROVAL' && (
                      <button
                        onClick={() => handleSuspendEditor(editor.id, editor.status)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                          editor.status === 'ACTIVE'
                            ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/30'
                            : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        }`}
                      >
                        {editor.status === 'ACTIVE' ? 'Suspend Editor' : 'Reactivate Editor'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: CITY MANAGEMENT */}
      {activeTab === 'cities' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-xs text-neutral-400">
              Cities configured here are automatically pre-rendered at build time with full SEO schemas and ISR webhooks.
            </p>
            <button
              onClick={() => setIsCityModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D91680] to-[#E62044] text-white text-xs font-semibold flex items-center space-x-1.5 shadow-aura"
            >
              <Plus className="w-4 h-4" />
              <span>Add Supported City</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {cities.map((city) => {
              const count = listings.filter((l) => l.citySlug === city.slug).length;
              return (
                <div key={city.id} className="rounded-2xl glass-card overflow-hidden group">
                  <div className="relative h-36 w-full">
                    <Image src={city.heroImage} alt={city.name} fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B070E] via-transparent" />
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold bg-black/70 text-white uppercase">
                      /{city.slug}
                    </span>
                  </div>
                  <div className="p-4">
                    <div className="text-base font-serif font-bold text-white">{city.name}</div>
                    <div className="text-xs text-neutral-400">{city.stateOrCountry}</div>
                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                      <span className="text-neutral-400">{count} Companions</span>
                      <Link
                        href={`/companions-in-${city.slug}`}
                        target="_blank"
                        className="text-magenta-400 hover:text-magenta-300 flex items-center space-x-1"
                      >
                        <span>View Hub</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: INQUIRIES INBOX */}
      {activeTab === 'inquiries' && (
        <div className="rounded-2xl glass-panel overflow-hidden border border-white/10">
          <div className="p-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
              VIP Client Bookings & Inquiries
            </span>
            <span className="text-xs text-neutral-400">{inquiries.length} total messages</span>
          </div>

          <div className="divide-y divide-white/5">
            {inquiries.map((inq) => {
              const statusBadge = {
                NEW: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
                CONTACTED: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
                RESOLVED: 'bg-neutral-500/15 text-neutral-300 border-neutral-500/30',
              }[inq.status || 'NEW'];

              return (
                <div key={inq.id} className="p-6 space-y-4 hover:bg-white/5 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-3">
                      <span className="text-base font-bold text-white">{inq.name}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusBadge}`}>
                        {inq.status}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-xs">
                      <span className="text-neutral-400">Target City: <strong className="text-white">{inq.targetCity}</strong></span>
                      <span className="text-neutral-600">|</span>
                      <span className="text-neutral-400">
                        Date: <strong className="text-white">{new Date(inq.eventDate).toLocaleDateString()}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-300">
                    <div className="flex items-center space-x-1.5">
                      <Mail className="w-3.5 h-3.5 text-magenta-400" />
                      <a href={`mailto:${inq.email}`} className="hover:underline">{inq.email}</a>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Phone className="w-3.5 h-3.5 text-magenta-400" />
                      <a href={`tel:${inq.phone}`} className="hover:underline">{inq.phone}</a>
                    </div>
                    {inq.listing && (
                      <div className="flex items-center space-x-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-magenta-400" />
                        <span>Requested Host: <strong className="text-white">{inq.listing.fullName}</strong></span>
                      </div>
                    )}
                  </div>

                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-neutral-300 leading-relaxed">
                    {inq.message}
                  </div>

                  <div className="flex items-center justify-end space-x-2 pt-2">
                    {inq.status === 'NEW' && (
                      <button
                        onClick={() => handleUpdateInquiry(inq.id, 'CONTACTED')}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold"
                      >
                        Mark Contacted
                      </button>
                    )}
                    {inq.status !== 'RESOLVED' && (
                      <button
                        onClick={() => handleUpdateInquiry(inq.id, 'RESOLVED')}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold"
                      >
                        Mark Resolved
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ADD CITY MODAL */}
      {isCityModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsCityModalOpen(false);
          }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4"
        >
          <div className="relative w-full max-w-md bg-[#140815] border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <h3 className="text-lg font-serif font-bold text-white mb-4">
              Register New Supported City
            </h3>
            <form onSubmit={handleCreateCity} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-300 uppercase">City Name *</label>
                <input
                  type="text"
                  required
                  value={newCityName}
                  onChange={(e) => {
                    setNewCityName(e.target.value);
                    if (!newCitySlug) {
                      setNewCitySlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                    }
                  }}
                  placeholder="e.g. Dubai, Singapore, Paris"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-300 uppercase">URL Slug *</label>
                <input
                  type="text"
                  required
                  value={newCitySlug}
                  onChange={(e) => setNewCitySlug(e.target.value)}
                  placeholder="e.g. dubai"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-300 uppercase">Country or Region *</label>
                <input
                  type="text"
                  required
                  value={newCityCountry}
                  onChange={(e) => setNewCityCountry(e.target.value)}
                  placeholder="e.g. United Arab Emirates"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-300 uppercase">Hero Image URL</label>
                <input
                  type="url"
                  value={newCityImage}
                  onChange={(e) => setNewCityImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-white"
                />
              </div>

              <div className="pt-4 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCityModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-neutral-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={citySubmitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#D91680] to-[#E62044] text-white text-xs font-semibold uppercase shadow-aura"
                >
                  {citySubmitting ? 'Registering...' : 'Register City'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
