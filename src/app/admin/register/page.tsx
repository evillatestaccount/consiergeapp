'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, ShieldCheck, Mail, Lock, User, Briefcase, CheckCircle2, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agencyOrBio, setAgencyOrBio] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          agencyOrBio,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setSuccessNotice(data.message || 'Account pending SuperAdmin activation.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0B070E] relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/3 -right-32 w-96 h-96 bg-magenta-500/20 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-lg relative z-10 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center space-x-2.5">
            <div className="relative w-10 h-10 flex-shrink-0">
              <Image
                src="/logo.png"
                alt="EscortVilla Logo"
                width={40}
                height={40}
                className="w-full h-full object-contain filter drop-shadow-[0_0_10px_rgba(217,22,128,0.5)]"
              />
            </div>
            <span className="text-2xl font-serif font-bold text-white tracking-wider">
              ESCORT<span className="text-magenta-400">VILLA</span>
            </span>
          </Link>
          <h2 className="text-2xl font-serif font-bold text-white">
            Editor & Escort Agency Application
          </h2>
          <p className="text-xs text-neutral-400">
            Apply to manage verified VIP escort listings across global cities.
          </p>
        </div>

        {/* Container */}
        <div className="p-8 rounded-3xl glass-panel relative border border-white/15 shadow-2xl">
          
          {successNotice ? (
            <div className="text-center py-8 space-y-5">
              <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-xl font-serif font-bold text-white mb-2">
                  Registration Received
                </h3>
                <div className="p-4 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs leading-relaxed max-w-sm mx-auto">
                  Account pending SuperAdmin activation.
                </div>
              </div>

              <p className="text-xs text-neutral-300 max-w-sm mx-auto leading-relaxed">
                An alert has been dispatched to the EscortVilla SuperAdmin Director. You will receive an automated welcome email once your identity and agency credentials are approved.
              </p>

              <div className="pt-4 flex justify-center space-x-3">
                <Link
                  href="/admin/login"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D91680] to-[#E62044] text-xs font-semibold text-white shadow-aura"
                >
                  Return to Portal Sign-In
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              {errorMessage && (
                <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                  {errorMessage}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                  Curator / Agency Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Elena Rostova (or Mayfair Talent Ltd)"
                    className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm text-white placeholder-neutral-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                  Official Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="elena@talentagency.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm text-white placeholder-neutral-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                  Password (min 8 characters) *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm text-white placeholder-neutral-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                  Agency Background / Protocol Experience
                </label>
                <textarea
                  rows={3}
                  value={agencyOrBio}
                  onChange={(e) => setAgencyOrBio(e.target.value)}
                  placeholder="Detail your background in high-end event hosting, VIP diplomacy, or personal host representation..."
                  className="w-full px-4 py-3 rounded-xl glass-input text-sm text-white placeholder-neutral-500 leading-relaxed"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-[11px] text-neutral-400">
                Notice: All new Editor registrations require SuperAdmin activation before listing publishing capabilities are granted.
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D91680] to-[#E62044] hover:from-magenta-600 hover:to-crimson text-white font-semibold text-xs tracking-wider uppercase shadow-aura hover:shadow-aura-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <span>{submitting ? 'Submitting Application...' : 'Submit Editor Registration'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-xs text-neutral-400">
            Already have an active account?{' '}
            <Link href="/admin/login" className="text-magenta-400 hover:underline font-semibold">
              Sign In
            </Link>
          </div>

        </div>

        {/* Back Link */}
        <div className="text-center">
          <Link href="/" className="text-xs text-neutral-400 hover:text-white transition-colors">
            &larr; Return to EscortVilla Public Directory
          </Link>
        </div>

      </div>
    </div>
  );
}
