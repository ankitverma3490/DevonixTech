import { Currency } from '../types/index.js';
import { CURRENCY_CONFIG } from './currency.js';

/**
 * Formats monetary amounts according to currency specifications
 * Supports both INR (₹ en-IN) and USD ($ en-US)
 */
export const formatCurrency = (
  amount: number | undefined | null,
  currency: Currency = 'INR',
  options: { showDecimals?: boolean; compact?: boolean } = {}
): string => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return currency === 'USD' ? '$0' : '₹0';
  }

  const num = Number(amount);
  const config = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.INR;

  if (options.compact && Math.abs(num) >= 1000) {
    if (currency === 'INR') {
      if (Math.abs(num) >= 10000000) {
        return `₹${(num / 10000000).toFixed(2).replace(/\.00$/, '')} Cr`;
      }
      if (Math.abs(num) >= 100000) {
        return `₹${(num / 100000).toFixed(2).replace(/\.00$/, '')} L`;
      }
      if (Math.abs(num) >= 1000) {
        return `₹${(num / 1000).toFixed(1).replace(/\.0$/, '')} K`;
      }
    } else {
      if (Math.abs(num) >= 1000000) {
        return `$${(num / 1000000).toFixed(2).replace(/\.00$/, '')}M`;
      }
      if (Math.abs(num) >= 1000) {
        return `$${(num / 1000).toFixed(1).replace(/\.0$/, '')}K`;
      }
    }
  }

  const fractionDigits = options.showDecimals ? 2 : 0;

  try {
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.code,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(num);
  } catch {
    const symbol = config.symbol || (currency === 'USD' ? '$' : '₹');
    return `${symbol}${num.toLocaleString()}`;
  }
};

/**
 * Formats amount explicitly in Indian Rupee (₹ Base Reporting Currency)
 */
export const formatINR = (
  amount: number | undefined | null,
  options?: { showDecimals?: boolean; compact?: boolean }
): string => {
  return formatCurrency(amount, 'INR', options);
};

/**
 * Formats amount explicitly in US Dollar ($)
 */
export const formatUSD = (
  amount: number | undefined | null,
  options?: { showDecimals?: boolean; compact?: boolean }
): string => {
  return formatCurrency(amount, 'USD', options);
};

/**
 * Formats exchange rates (e.g. ₹88.00 / USD)
 */
export const formatExchangeRate = (rate: number | undefined | null): string => {
  if (rate === undefined || rate === null || isNaN(rate)) return '₹88.00';
  return `₹${Number(rate).toFixed(2)}`;
};

/**
 * Dual display formatting (e.g. "$5,000 USD (₹4,40,000 INR)")
 */
export const formatMoneyWithOriginal = (
  amount: number | undefined | null,
  currency: Currency = 'INR',
  inrAmount?: number | null
): string => {
  const orig = formatCurrency(amount, currency);
  if (currency === 'INR' || inrAmount === undefined || inrAmount === null) {
    return orig;
  }
  const inrFormatted = formatINR(inrAmount);
  return `${orig} (${inrFormatted})`;
};

export const formatDate = (dateStr: string | Date | undefined | null): string => {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (e) {
    return 'N/A';
  }
};

export const formatPercentage = (val: number | undefined | null): string => {
  if (val === undefined || val === null || isNaN(val)) return '0%';
  return `${Number(val).toFixed(1)}%`;
};

export const getStatusBadgeClass = (status: string): string => {
  const map: Record<string, string> = {
    // Project statuses
    planning: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    on_hold: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    completed: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    cancelled: 'bg-rose-500/10 text-rose-400 border-rose-500/20',

    // Task statuses
    todo: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    in_progress: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    review: 'bg-amber-500/10 text-amber-400 border-amber-500/20',

    // Payment & Milestone statuses
    paid: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    overdue: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    partially_paid: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',

    // User / Client statuses
    inactive: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  };

  return map[status.toLowerCase()] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';
};

export const getPriorityBadgeClass = (priority: string): string => {
  const map: Record<string, string> = {
    low: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
    medium: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    high: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    urgent: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };
  return map[priority.toLowerCase()] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';
};
