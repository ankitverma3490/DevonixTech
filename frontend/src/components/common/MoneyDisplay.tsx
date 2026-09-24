import React from 'react';
import { Currency } from '../../types/index.js';
import { formatCurrency, formatINR } from '../../utils/formatters.js';

interface MoneyDisplayProps {
  amount: number | undefined | null;
  currency?: Currency;
  inrEquivalent?: number | null;
  showOriginalAndInr?: boolean;
  className?: string;
  inrClassName?: string;
  showCurrencyBadge?: boolean;
  compact?: boolean;
  showDecimals?: boolean;
}

export const MoneyDisplay: React.FC<MoneyDisplayProps> = ({
  amount,
  currency = 'INR',
  inrEquivalent,
  showOriginalAndInr = false,
  className = '',
  inrClassName = 'text-xs text-slate-400 font-normal',
  showCurrencyBadge = false,
  compact = false,
  showDecimals = false,
}) => {
  const formattedAmount = formatCurrency(amount, currency, { compact, showDecimals });

  const hasInrConversion =
    currency === 'USD' &&
    inrEquivalent !== undefined &&
    inrEquivalent !== null &&
    (showOriginalAndInr || inrEquivalent !== amount);

  return (
    <span className={`inline-flex items-baseline gap-1.5 flex-wrap ${className}`}>
      <span className="font-semibold">{formattedAmount}</span>
      
      {showCurrencyBadge && (
        <span
          className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
            currency === 'USD'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
          }`}
        >
          {currency}
        </span>
      )}

      {hasInrConversion && (
        <span className={inrClassName}>
          (₹{formatINR(inrEquivalent, { compact, showDecimals }).replace('₹', '')})
        </span>
      )}
    </span>
  );
};
