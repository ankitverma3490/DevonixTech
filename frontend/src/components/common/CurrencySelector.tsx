import React from 'react';
import { Currency } from '../../types/index.js';
import { CURRENCY_CONFIG, SUPPORTED_CURRENCIES } from '../../utils/currency.js';

interface CurrencySelectorProps {
  value: Currency;
  onChange: (currency: Currency) => void;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  value,
  onChange,
  label = 'Currency',
  error,
  disabled = false,
  className = '',
}) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="grid grid-cols-2 gap-2">
        {SUPPORTED_CURRENCIES.map((curr) => {
          const config = CURRENCY_CONFIG[curr];
          const isSelected = value === curr;
          return (
            <button
              key={curr}
              type="button"
              disabled={disabled}
              onClick={() => onChange(curr)}
              className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                isSelected
                  ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                  : 'bg-slate-900/60 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:border-slate-600'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <span>{config.flag}</span>
              <span>{config.code}</span>
              <span className="text-xs text-slate-400 font-normal">({config.symbol})</span>
            </button>
          );
        })}
      </div>
      {error && <p className="text-xs text-rose-400">{error}</p>}
    </div>
  );
};
