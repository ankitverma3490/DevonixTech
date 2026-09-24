import React from 'react';
import { formatCurrency, formatINR } from '../../utils/formatters.js';

interface INRAmountDisplayProps {
  amount?: number | undefined | null;
  inrAmount?: number | undefined | null;
  originalAmount?: number | undefined | null;
  originalCurrency?: string;
  exchangeRate?: number;
  label?: string;
  className?: string;
  amountClassName?: string;
  compact?: boolean;
  showDecimals?: boolean;
}

export const INRAmountDisplay: React.FC<INRAmountDisplayProps> = ({
  amount,
  inrAmount,
  originalAmount,
  originalCurrency = 'USD',
  exchangeRate,
  label,
  className = '',
  amountClassName = 'text-emerald-400 font-bold',
  compact = false,
  showDecimals = false,
}) => {
  const displayAmount = inrAmount !== undefined ? inrAmount : amount;

  return (
    <div className={`p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs ${className}`}>
      <div>
        <span className="text-slate-400 font-medium">{label || 'Converted INR Reporting Amount'}:</span>
        {originalAmount !== undefined && exchangeRate !== undefined && (
          <span className="text-[11px] text-slate-500 block mt-0.5">
            {formatCurrency(originalAmount, originalCurrency as any)} @ ₹{exchangeRate}/USD
          </span>
        )}
      </div>
      <span className={`font-mono text-base font-extrabold ${amountClassName}`}>
        {formatINR(displayAmount, { compact, showDecimals })}
      </span>
    </div>
  );
};
