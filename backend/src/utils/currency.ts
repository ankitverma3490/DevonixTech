export type Currency = 'INR' | 'USD';

export const SUPPORTED_CURRENCIES: Currency[] = ['INR', 'USD'];
export const BASE_REPORTING_CURRENCY: Currency = 'INR';
export const DEFAULT_USD_INR_RATE = 88;

/**
 * Standardizes calculation of INR equivalent value
 */
export const calculateInrAmount = (
  amount: number,
  currency: Currency = 'INR',
  exchangeRate: number = 1
): number => {
  const val = Number(amount) || 0;
  if (currency === 'INR') {
    return val;
  }
  const rate = Number(exchangeRate) || DEFAULT_USD_INR_RATE;
  return Math.round(val * rate * 100) / 100;
};
