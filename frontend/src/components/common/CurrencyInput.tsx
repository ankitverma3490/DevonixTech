import React from 'react';
import { Currency } from '../../types/index.js';
import { getCurrencySymbol } from '../../utils/currency.js';

interface CurrencyInputProps {
  label?: string;
  value: number | string;
  onChange: (value: number) => void;
  currency?: Currency;
  placeholder?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  min?: number;
  className?: string;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  label,
  value,
  onChange,
  currency = 'INR',
  placeholder = '0.00',
  error,
  helperText,
  disabled = false,
  required = false,
  min = 0,
  className = '',
}) => {
  const symbol = getCurrencySymbol(currency);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    if (rawVal === '') {
      onChange(0);
      return;
    }
    const num = parseFloat(rawVal);
    if (!isNaN(num)) {
      onChange(num);
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
          {label} {required && <span className="text-rose-400">*</span>}
        </label>
      )}
      <div className="relative rounded-xl shadow-sm">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
          <span className="text-slate-400 font-bold text-sm">{symbol}</span>
        </div>
        <input
          type="number"
          min={min}
          step="any"
          value={value === 0 && placeholder ? '' : value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`block w-full rounded-xl bg-slate-900/60 border pl-8 pr-12 py-2.5 text-sm font-medium text-white placeholder:text-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
            error
              ? 'border-rose-500/60 focus:border-rose-500'
              : 'border-slate-700/60 focus:border-indigo-500'
          } ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-800/40' : ''}`}
        />
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5">
          <span className="text-xs font-bold text-slate-400">{currency}</span>
        </div>
      </div>
      {error && <p className="text-xs text-rose-400">{error}</p>}
      {helperText && !error && <p className="text-[11px] text-slate-400">{helperText}</p>}
    </div>
  );
};
