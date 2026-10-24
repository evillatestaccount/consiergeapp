export interface CityCurrencyConfig {
  currency: string;
  symbol: string;
  defaultHourlyRate: number;
  defaultDailyRate: number;
  slider: {
    min: number;
    max: number;
    step: number;
    defaultMax: number;
  };
}

const CITY_CURRENCY_MAP: Record<string, CityCurrencyConfig> = {
  london: {
    currency: 'GBP',
    symbol: '£',
    defaultHourlyRate: 280,
    defaultDailyRate: 1900,
    slider: {
      min: 150,
      max: 600,
      step: 25,
      defaultMax: 500,
    },
  },
  'new-york': {
    currency: 'USD',
    symbol: '$',
    defaultHourlyRate: 400,
    defaultDailyRate: 2800,
    slider: {
      min: 200,
      max: 800,
      step: 25,
      defaultMax: 650,
    },
  },
  delhi: {
    currency: 'INR',
    symbol: '₹',
    defaultHourlyRate: 18000,
    defaultDailyRate: 125000,
    slider: {
      min: 5000,
      max: 40000,
      step: 1000,
      defaultMax: 35000,
    },
  },
  mumbai: {
    currency: 'INR',
    symbol: '₹',
    defaultHourlyRate: 20000,
    defaultDailyRate: 140000,
    slider: {
      min: 5000,
      max: 40000,
      step: 1000,
      defaultMax: 35000,
    },
  },
};

const DEFAULT_CONFIG: CityCurrencyConfig = {
  currency: 'USD',
  symbol: '$',
  defaultHourlyRate: 350,
  defaultDailyRate: 2400,
  slider: {
    min: 150,
    max: 800,
    step: 25,
    defaultMax: 600,
  },
};

/**
 * Returns currency symbol for a currency code.
 */
export function getCurrencySymbol(currency?: string): string {
  if (!currency) return '$';
  const upper = currency.toUpperCase().trim();
  switch (upper) {
    case 'GBP':
      return '£';
    case 'INR':
      return '₹';
    case 'EUR':
      return '€';
    case 'USD':
      return '$';
    case 'AED':
      return 'AED ';
    case 'CHF':
      return 'CHF ';
    case 'SGD':
      return 'S$';
    default:
      return `${upper} `;
  }
}

/**
 * Returns currency configuration and slider presets based on city slug.
 */
export function getCityCurrencyConfig(citySlug?: string): CityCurrencyConfig {
  if (!citySlug) return DEFAULT_CONFIG;
  const normalized = citySlug.toLowerCase().trim().replace(/^companions-in-/, '');
  return CITY_CURRENCY_MAP[normalized] || DEFAULT_CONFIG;
}

/**
 * Formats price with correct localized symbol and comma separation.
 * Examples:
 * - formatPrice(18000, 'INR') => "₹18,000"
 * - formatPrice(280, 'GBP') => "£280"
 * - formatPrice(450, 'USD') => "$450"
 */
export function formatPrice(amount?: number | null, currency: string = 'USD'): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return 'Bespoke';
  }

  const upper = (currency || 'USD').toUpperCase().trim();
  const symbol = getCurrencySymbol(upper);

  let formattedNumber: string;
  try {
    if (upper === 'INR') {
      formattedNumber = amount.toLocaleString('en-IN');
    } else if (upper === 'GBP') {
      formattedNumber = amount.toLocaleString('en-GB');
    } else {
      formattedNumber = amount.toLocaleString('en-US');
    }
  } catch {
    formattedNumber = String(amount);
  }

  return `${symbol}${formattedNumber}`;
}

export const SUPPORTED_CURRENCIES = [
  { code: 'GBP', symbol: '£', label: 'GBP (£) - British Pound' },
  { code: 'INR', symbol: '₹', label: 'INR (₹) - Indian Rupee' },
  { code: 'USD', symbol: '$', label: 'USD ($) - US Dollar' },
  { code: 'EUR', symbol: '€', label: 'EUR (€) - Euro' },
];
