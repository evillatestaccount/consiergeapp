'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { AlertTriangle, ShieldAlert, ArrowRight, XCircle } from 'lucide-react';

const STORAGE_KEY = 'escortvilla_age_verified';

export default function AgeVerificationModal() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isVerified, setIsVerified] = useState<boolean>(true); // start true to prevent SSR flicker

  useEffect(() => {
    // Check if user has previously verified their age
    try {
      const verified = localStorage.getItem(STORAGE_KEY);
      if (verified === 'true') {
        setIsVerified(true);
      } else {
        setIsVerified(false);
        // Show modal natively
        if (dialogRef.current && !dialogRef.current.open) {
          dialogRef.current.showModal();
        }
      }
    } catch {
      // In case localStorage is blocked in private browsing
      setIsVerified(false);
      if (dialogRef.current && !dialogRef.current.open) {
        dialogRef.current.showModal();
      }
    }
  }, []);

  const handleConfirmAge = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // ignore storage write errors
    }
    setIsVerified(true);
    if (dialogRef.current) {
      dialogRef.current.close();
    }
  };

  const handleDeclineAge = () => {
    // Safe redirect away from adult-oriented website
    window.location.href = 'https://www.google.com';
  };

  if (isVerified) {
    return null;
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="age-dialog-title"
      aria-describedby="age-dialog-desc"
      className="p-0 bg-transparent text-white border-0 outline-none max-w-lg w-[92vw] m-auto backdrop:bg-[#070308]/90 backdrop:backdrop-blur-xl fixed inset-0 z-[9999]"
      onCancel={(e) => {
        // Prevent dismissal with Esc key without explicit age confirmation
        e.preventDefault();
      }}
    >
      <div className="relative rounded-3xl bg-gradient-to-b from-[#1E0B20] via-[#120715] to-[#0A040B] border border-rose-500/40 p-6 sm:p-8 shadow-[0_0_60px_rgba(225,29,72,0.35)] overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center">
          {/* Logo & 18+ Warning Badge */}
          <div className="flex items-center justify-center space-x-3 mb-5">
            <div className="relative w-10 h-10 flex-shrink-0">
              <Image
                src="/logo.png"
                alt="EscortVilla Logo"
                width={40}
                height={40}
                className="w-full h-full object-contain filter drop-shadow-[0_0_10px_rgba(217,22,128,0.7)]"
              />
            </div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/50 text-rose-300 font-bold text-xs uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>18+ Adults Only Notice</span>
            </div>
          </div>

          {/* Heading */}
          <h2 id="age-dialog-title" className="text-2xl sm:text-3xl font-serif font-bold text-white mb-3">
            Age Verification Warning
          </h2>

          {/* Description */}
          <div id="age-dialog-desc" className="space-y-3 text-xs sm:text-sm text-neutral-300 leading-relaxed mb-8">
            <p className="bg-rose-950/30 border border-rose-500/20 rounded-xl p-3 text-rose-200 text-xs font-medium">
              ⚠️ <strong>Warning:</strong> This website contains adult-oriented content, VIP escort services, and private directory listings intended exclusively for legal adults.
            </p>
            <p>
              You must be at least <strong>18 years of age</strong> (or the age of legal majority in your country or jurisdiction) to enter and view this site.
            </p>
            <p className="text-[11px] text-neutral-400">
              By clicking &ldquo;I am 18 or Older&rdquo;, you certify under penalty of perjury that you are of legal age and consent to viewing adult-oriented material.
            </p>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={handleConfirmAge}
              autoFocus
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#D91680] via-[#E62044] to-[#F43F5E] hover:from-[#e8198a] hover:to-[#fb7185] text-white text-xs sm:text-sm font-bold uppercase tracking-wider shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 transition-all flex items-center justify-center space-x-2"
            >
              <span>I am 18 or Older</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleDeclineAge}
              className="w-full py-3.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-neutral-300 hover:text-white text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all flex items-center justify-center space-x-2"
            >
              <XCircle className="w-4 h-4 text-neutral-400" />
              <span>I am Under 18 (Exit)</span>
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}
