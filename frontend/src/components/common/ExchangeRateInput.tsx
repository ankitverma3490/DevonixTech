import React from 'react';
import { formatCurrency, formatINR } from '../../utils/formatters.js';

interface ExchangeRateInputProps {
  value?: number;
  exchangeRate?: number;
  onChange?: (rate: number) => void;
  onRateChange?: (rate: number) => void;
  originalAmount?: number;
  label?: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
}

export const ExchangeRateInput: React.FC<ExchangeRateInputProps> = ({
  value,
  exchangeRate,
  onChange,
  onRateChange,
  originalAmount,
  label = 'USD → INR Exchange Rate',
  helperText = 'Enter the transaction exchange rate (stored permanently for reporting)',
  error,
  disabled = false,
}) => {
  const currentRate = value !== undefined ? value : exchangeRate !== undefined ? exchangeRate : 88;
  const handleChange = (rate: number) => {
    if (onChange) onChange(rate);
    if (onRateChange) onRateChange(rate);
  };

  const calculatedInr = originalAmount
    ? Math.round((Number(originalAmount) || 0) * (Number(currentRate) || 0) * 100) / 100
    : null;

  return (
    <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-700/60 space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          {label}
        </label>
        <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
          Transaction Rate
        </span>
      </div>

      <div className="relative rounded-xl shadow-sm">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
          <span className="text-slate-400 font-bold text-sm">₹</span>
        </div>
        <input
          type="number"
          step="0.01"
          min="1"
          disabled={disabled}
          value={currentRate || ''}
          onChange={(e) => handleChange(parseFloat(e.target.value) || 0)}
          placeholder="88.00"
          className={`block w-full rounded-xl bg-slate-950/80 border pl-8 pr-16 py-2 text-sm font-semibold text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
            error ? 'border-rose-500' : 'border-slate-700 focus:border-indigo-500'
          }`}
        />
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5">
          <span className="text-xs font-bold text-slate-400">/ USD</span>
        </div>
      </div>

      {error && <p className="text-xs text-rose-400">{error}</p>}

      {/* Live Calculation Preview Banner */}
      {calculatedInr !== null && (
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-indigo-950/40 border border-indigo-500/20 text-xs">
          <div className="text-slate-400">
            Formula:{' '}
            <span className="text-slate-300 font-mono">
              {formatCurrency(originalAmount, 'USD')}
            </span>{' '}
            × <span className="text-slate-300 font-mono">₹{currentRate}</span>
          </div>
          <div className="text-right">
            <span className="text-slate-400 block text-[10px] uppercase">INR Reporting Value</span>
            <span className="text-sm font-extrabold text-indigo-300 font-mono">
              {formatINR(calculatedInr)}
            </span>
          </div>
        </div>
      )}

      {helperText && !error && <p className="text-[11px] text-slate-400">{helperText}</p>}
    </div>
  );
};
