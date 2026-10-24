import React from 'react';

export function WebsiteJsonLd() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://escortvilla.com';

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: 'EscortVilla',
        description: 'Premier VIP escort services and verified luxury escort directory for private dinner dates, VIP travel accompaniment, and exclusive bookings.',
        publisher: {
          '@id': `${siteUrl}/#organization`,
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${siteUrl}/?search={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
        inLanguage: 'en-US',
      },
      {
        '@type': 'Organization',
        '@id': `${siteUrl}/#organization`,
        name: 'EscortVilla',
        url: siteUrl,
        logo: {
          '@type': 'ImageObject',
          url: `${siteUrl}/icon.png`,
          caption: 'EscortVilla',
        },
        description: 'Premier global directory connecting clients with verified VIP escorts, high-class independent escorts, and luxury travel companions worldwide.',
        contactPoint: [
          {
            '@type': 'ContactPoint',
            telephone: '+44-20-7946-0000',
            contactType: 'customer service',
            areaServed: ['GB', 'US', 'IN'],
            availableLanguage: ['English', 'French', 'Hindi'],
          },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function DirectoryJsonLd({
  cityName,
  citySlug,
  listings,
}: {
  cityName: string;
  citySlug: string;
  listings: Array<{ fullName: string; id: string; headline: string; hourlyRate: number }>;
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://escortvilla.com';

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: siteUrl,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: `Escorts in ${cityName}`,
            item: `${siteUrl}/companions-in-${citySlug}`,
          },
        ],
      },
      {
        '@type': 'ItemList',
        name: `Verified Escorts & Escort Services in ${cityName}`,
        description: `Exclusive verified directory of VIP escorts, independent escorts, and luxury companions in ${cityName}.`,
        numberOfItems: listings.length,
        itemListOrder: 'https://schema.org/ItemListOrderDescending',
        itemListElement: listings.map((l, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: l.fullName,
          url: `${siteUrl}/profile/${l.id}`,
          description: l.headline,
        })),
      },
      {
        '@type': 'Place',
        name: cityName,
        hasMap: `https://www.openstreetmap.org/search?query=${encodeURIComponent(cityName)}`,
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function ProfileJsonLd({
  listing,
}: {
  listing: {
    id: string;
    fullName: string;
    headline: string;
    bio: string;
    hourlyRate: number;
    currency: string;
    citySlug: string;
    cityName?: string;
    images: string[];
    languages: string[];
    services?: string[];
  };
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://escortvilla.com';
  const profileUrl = `${siteUrl}/profile/${listing.id}`;
  const cityLabel = listing.cityName || listing.citySlug.replace('-', ' ');

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: siteUrl,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: `Escorts in ${cityLabel}`,
            item: `${siteUrl}/companions-in-${listing.citySlug}`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: listing.fullName,
            item: profileUrl,
          },
        ],
      },
      {
        '@type': 'Person',
        '@id': profileUrl,
        name: listing.fullName,
        jobTitle: listing.headline,
        description: listing.bio,
        image: listing.images[0] || `${siteUrl}/icon.png`,
        url: profileUrl,
        knowsLanguage: listing.languages,
        makesOffer: (listing.services || ['Event Host']).map((svc) => ({
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: svc,
            provider: {
              '@type': 'Person',
              name: listing.fullName,
            },
          },
          price: listing.hourlyRate,
          priceCurrency: listing.currency || 'USD',
          availability: 'https://schema.org/InStock',
        })),
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function ContactJsonLd() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://escortvilla.com';

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: siteUrl,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'VIP Escort Booking & Concierge Desk',
            item: `${siteUrl}/contact`,
          },
        ],
      },
      {
        '@type': 'ContactPage',
        '@id': `${siteUrl}/contact#webpage`,
        url: `${siteUrl}/contact`,
        name: 'VIP Escort Inquiries & Reservations | EscortVilla',
        description: 'Discreet VIP escort booking desk for verified independent escorts, luxury dinner dates, and private travel accompaniment.',
        mainEntity: {
          '@type': 'Organization',
          name: 'EscortVilla Concierge',
          telephone: '+44-20-7946-0000',
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'VIP Escort Bookings',
            telephone: '+44-20-7946-0000',
            email: 'admin@escortvilla.com',
            availableLanguage: ['English', 'French', 'Hindi'],
          },
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
