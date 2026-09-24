import { Currency } from '../types/index.js';

export const SUPPORTED_CURRENCIES: Currency[] = ['INR', 'USD'];
export const BASE_REPORTING_CURRENCY: Currency = 'INR';
export const DEFAULT_USD_INR_RATE = 88;

export const CURRENCY_CONFIG: Record<
  Currency,
  {
    code: Currency;
    symbol: string;
    label: string;
    locale: string;
    flag: string;
  }
> = {
  INR: {
    code: 'INR',
    symbol: '₹',
    label: 'Indian Rupee (INR)',
    locale: 'en-IN',
    flag: '🇮🇳',
  },
  USD: {
    code: 'USD',
    symbol: '$',
    label: 'US Dollar (USD)',
    locale: 'en-US',
    flag: '🇺🇸',
  },
};

/**
 * Get currency symbol (₹ or $)
 */
export const getCurrencySymbol = (currency: Currency = 'INR'): string => {
  return CURRENCY_CONFIG[currency]?.symbol || (currency === 'USD' ? '$' : '₹');
};

/**
 * Calculate INR amount based on exchange rate
 */
export const calculateInrAmount = (
  amount: number,
  currency: Currency = 'INR',
  exchangeRate: number = 1
): number => {
  const val = Number(amount) || 0;
  if (currency === 'INR') return val;
  const rate = Number(exchangeRate) || DEFAULT_USD_INR_RATE;
  return Math.round(val * rate * 100) / 100;
};
