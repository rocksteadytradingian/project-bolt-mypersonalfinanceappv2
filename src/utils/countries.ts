interface Country {
  name: string;
  currency: string;
  currencySymbol: string;
}

export const countries: Record<string, Country> = {
  'PH': {
    name: 'Philippines',
    currency: 'PHP',
    currencySymbol: '₱'
  },
  'US': {
    name: 'United States',
    currency: 'USD',
    currencySymbol: '$'
  },
  'GB': {
    name: 'United Kingdom',
    currency: 'GBP',
    currencySymbol: '£'
  },
  'EU': {
    name: 'European Union',
    currency: 'EUR',
    currencySymbol: '€'
  },
  'JP': {
    name: 'Japan',
    currency: 'JPY',
    currencySymbol: '¥'
  },
  'AU': {
    name: 'Australia',
    currency: 'AUD',
    currencySymbol: 'A$'
  },
  'CA': {
    name: 'Canada',
    currency: 'CAD',
    currencySymbol: 'C$'
  },
  'SG': {
    name: 'Singapore',
    currency: 'SGD',
    currencySymbol: 'S$'
  },
  'HK': {
    name: 'Hong Kong',
    currency: 'HKD',
    currencySymbol: 'HK$'
  },
  'KR': {
    name: 'South Korea',
    currency: 'KRW',
    currencySymbol: '₩'
  }
};

export type CountryCode = keyof typeof countries;
export type CurrencyCode = typeof countries[CountryCode]['currency'];
