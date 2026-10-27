'use client';

import { ArrowUpRight } from 'lucide-react';
import WhatsAppIcon from '@/components/WhatsAppIcon';
import { event as trackGaEvent } from '@/lib/gtag';

interface WhatsAppDirectButtonProps {
  url: string;
  name: string;
  city?: string;
  className?: string;
}

export default function WhatsAppDirectButton({
  url,
  name,
  city,
  className,
}: WhatsAppDirectButtonProps) {
  const handleClick = () => {
    trackGaEvent({
      action: 'contact_whatsapp',
      category: 'Engagement',
      label: `${name} (${city || 'General'})`,
    });
  };

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={
        className ||
        'w-full py-4 rounded-2xl bg-gradient-to-r from-[#25D366] via-[#1fad53] to-[#128C7E] hover:from-[#22c35e] hover:to-[#0f766a] text-white font-bold text-sm tracking-wider uppercase shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 flex items-center justify-center space-x-2.5 transition-all text-center group'
      }
    >
      <WhatsAppIcon className="w-5 h-5 fill-current" />
      <span>Contact on WhatsApp</span>
      <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
    </a>
  );
}
