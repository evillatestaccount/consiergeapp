/**
 * WhatsApp integration helpers for EscortVilla.
 * Formats international wa.me links with tailored VIP booking messages.
 */

export interface WhatsAppListingTarget {
  fullName: string;
  whatsapp?: string | null;
  citySlug?: string;
  cityName?: string;
  city?: { name: string };
  hourlyRate?: number;
  currency?: string;
}

/**
 * Returns digits-only international phone number for WhatsApp link.
 * Falls back to city concierge WhatsApp if not specified.
 */
export function getWhatsAppNumber(listing: {
  whatsapp?: string | null;
  citySlug?: string;
}): string {
  if (listing.whatsapp && listing.whatsapp.trim()) {
    // Strip everything except digits
    const cleaned = listing.whatsapp.replace(/\D/g, '');
    if (cleaned.length >= 8) {
      return cleaned;
    }
  }

  // City-specific fallback concierge desk numbers (international digits only)
  const slug = (listing.citySlug || '').toLowerCase().replace(/^companions-in-/, '');
  switch (slug) {
    case 'delhi':
      return '919876543210'; // Delhi VIP Concierge
    case 'mumbai':
      return '919876543212'; // Mumbai VIP Concierge
    case 'london':
      return '447911123456'; // London Mayfair Concierge
    case 'new-york':
      return '12125550199'; // New York Manhattan Concierge
    default:
      return '447911123456'; // Global Headquarters Concierge
  }
}

/**
 * Creates pre-formatted inquiry text tailored to the escort and city.
 */
export function formatWhatsAppMessage(listing: WhatsAppListingTarget): string {
  const city =
    listing.city?.name ||
    listing.cityName ||
    (listing.citySlug ? listing.citySlug.replace('-', ' ') : 'your city');
  const capitalizedCity = city.charAt(0).toUpperCase() + city.slice(1);

  return `Hi there, I am interested in booking VIP escort services with ${listing.fullName} in ${capitalizedCity} via EscortVilla. Please share current availability and booking rates.`;
}

/**
 * Generates the complete wa.me URL with pre-formatted encoded message.
 * Example output:
 * https://wa.me/919876543210?text=Hi%20there%2C%20I%20am%20interested...
 */
export function getWhatsAppUrl(listing: WhatsAppListingTarget): string {
  const number = getWhatsAppNumber(listing);
  const message = formatWhatsAppMessage(listing);
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
