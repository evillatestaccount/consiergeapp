'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Sparkles, ShieldCheck, Lock, User, Key, ArrowRight, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Successful login -> redirect to returned url
      router.push(data.redirectUrl || '/admin');
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0B070E] relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-magenta-500/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-900/30 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        
        {/* Header Logo */}
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
          <h2 className="text-xl font-serif font-bold text-white">
            Concierge Management Portal
          </h2>
          <p className="text-xs text-neutral-400">
            Sign in with SuperAdmin or Editor credentials to manage directory listings.
          </p>
        </div>

        {/* Login Form Container */}
        <div className="p-8 rounded-3xl glass-panel relative border border-white/15 shadow-2xl">
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                Official Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@escortvilla.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm text-white placeholder-neutral-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                  Password
                </label>
              </div>
              <div className="relative">
                <Key className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm text-white placeholder-neutral-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D91680] to-[#E62044] hover:from-magenta-600 hover:to-crimson text-white font-semibold text-xs tracking-wider uppercase shadow-aura hover:shadow-aura-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-neutral-400">
            Applying as a new companion or agency curator?{' '}
            <Link href="/admin/register" className="text-magenta-400 hover:underline font-semibold">
              Register as Editor
            </Link>
          </div>
        </div>

        {/* Back to public site */}
        <div className="text-center">
          <Link href="/" className="text-xs text-neutral-400 hover:text-white transition-colors">
            &larr; Return to EscortVilla Public Directory
          </Link>
        </div>

      </div>
    </div>
  );
}
