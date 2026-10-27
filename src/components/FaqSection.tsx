'use client';

import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqSectionProps {
  title?: string;
  subtitle?: string;
  faqs?: FaqItem[];
  cityName?: string;
}

export default function FaqSection({
  title,
  subtitle,
  faqs,
  cityName,
}: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const defaultFaqs: FaqItem[] = cityName
    ? [
        {
          question: `How do I book a verified VIP escort in ${cityName}?`,
          answer: `Browse the verified profiles in ${cityName}, select your preferred companion, and click WhatsApp to start a direct inquiry, or complete the VIP reservation form for bespoke concierge coordination.`,
        },
        {
          question: `Are all escorts in ${cityName} identity-verified?`,
          answer: `Yes. Every profile listed for ${cityName} has completed photo authentication and background verification to ensure 100% genuine representations.`,
        },
        {
          question: `What escort services are available in ${cityName}?`,
          answer: `Companions in ${cityName} offer dinner date accompaniment, business gala presence, VIP travel, private party companionship, and city guide services.`,
        },
        {
          question: `What are the typical rates for VIP escorts in ${cityName}?`,
          answer: `Rates vary by companion, duration, and occasion. Hourly and daily rates are clearly displayed in each profile, with zero hidden fees.`,
        },
        {
          question: `How is confidentiality guaranteed in ${cityName}?`,
          answer: `We prioritize discreet interactions. Your contact information is never disclosed publicly and is protected by encrypted channels.`,
        },
      ]
    : [
        {
          question: 'How do I book a verified VIP escort on EscortVilla?',
          answer:
            'Select your preferred destination city, browse our verified companion profiles, and either connect directly via WhatsApp or submit a private reservation request through our VIP Concierge Desk.',
        },
        {
          question: 'Are all escort profiles on EscortVilla verified?',
          answer:
            'Yes. Every profile undergoes rigorous authenticity verification, including photo validation, identity screening, and rate transparency, ensuring a trustworthy and premium experience.',
        },
        {
          question: 'Which cities are covered by EscortVilla?',
          answer:
            'EscortVilla provides verified VIP escort directories in top global hubs including London, New York, Delhi, and Mumbai, with companion services available for international travel.',
        },
        {
          question: 'How is client privacy and confidentiality protected?',
          answer:
            'All client inquiries, booking communications, and personal details are handled under strict confidentiality protocols. Data is never shared or retained beyond the reservation fulfillment.',
        },
        {
          question: 'Can I book companions for business dinners and VIP travel?',
          answer:
            'Yes. Our companions specialize in executive accompaniment, black-tie galas, private dinners, social events, and international travel accompaniment.',
        },
      ];

  const items = faqs || defaultFaqs;

  return (
    <section className="py-20 bg-[#0B070E] border-t border-white/5 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-magenta-500/10 border border-magenta-500/20 text-magenta-300 text-xs font-medium uppercase tracking-wider mb-4">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-3">
            {title || (cityName ? `VIP Escort Services in ${cityName} FAQ` : 'Frequently Asked Questions')}
          </h2>
          <p className="text-neutral-400 text-sm max-w-xl mx-auto">
            {subtitle || 'Everything you need to know about our verified directory, booking procedures, discretion, and VIP standards.'}
          </p>
        </div>

        <div className="space-y-4">
          {items.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="rounded-xl border border-white/10 bg-[#130B18]/60 backdrop-blur-sm overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between p-5 text-left text-white hover:text-magenta-400 transition-colors"
                >
                  <span className="font-medium text-sm sm:text-base pr-4">{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 flex-shrink-0 text-magenta-400 transition-transform duration-200 ${
                      isOpen ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-neutral-300 text-xs sm:text-sm leading-relaxed border-t border-white/5 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
