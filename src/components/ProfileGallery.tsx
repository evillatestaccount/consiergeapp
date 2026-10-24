'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ShieldCheck, Maximize2, X } from 'lucide-react';

interface ProfileGalleryProps {
  images: string[];
  fullName: string;
}

export default function ProfileGallery({ images, fullName }: ProfileGalleryProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setLightboxOpen(false);
      }
    }
    if (lightboxOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [lightboxOpen]);

  const displayImages = images.length > 0 ? images : [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80'
  ];

  return (
    <div className="space-y-4">
      {/* Main Image Frame */}
      <div className="relative aspect-[4/5] rounded-3xl overflow-hidden glass-card group bg-[#150B15]">
        <Image
          src={displayImages[selectedIdx]}
          alt={`${fullName} Portrait`}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#0B070E]/80 via-transparent to-black/20 pointer-events-none" />

        {/* Verification Pill */}
        <div className="absolute top-4 left-4 z-10 flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#0B070E]/80 backdrop-blur-md border border-magenta-500/40 text-xs font-semibold text-magenta-300">
          <ShieldCheck className="w-4 h-4 text-magenta-400" />
          <span>EscortVilla Identity Verified</span>
        </div>

        {/* Expand / Lightbox Button */}
        <button
          onClick={() => setLightboxOpen(true)}
          className="absolute top-4 right-4 z-10 p-2.5 rounded-xl bg-black/60 hover:bg-magenta-600/80 backdrop-blur-md border border-white/20 text-white transition-colors"
          aria-label="View Fullscreen"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Thumbnails Row */}
      {displayImages.length > 1 && (
        <div className="flex items-center space-x-3 overflow-x-auto pb-2 scrollbar-none">
          {displayImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIdx(idx)}
              className={`relative w-20 h-24 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                selectedIdx === idx
                  ? 'border-magenta-500 scale-105 shadow-aura'
                  : 'border-white/20 opacity-60 hover:opacity-100'
              }`}
            >
              <Image
                src={img}
                alt={`${fullName} preview ${idx + 1}`}
                fill
                sizes="80px"
                className="object-cover object-top"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {lightboxOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setLightboxOpen(false);
          }}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 cursor-zoom-out"
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="relative max-w-4xl max-h-[85vh] w-full h-full flex items-center justify-center">
            <Image
              src={displayImages[selectedIdx]}
              alt={fullName}
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
