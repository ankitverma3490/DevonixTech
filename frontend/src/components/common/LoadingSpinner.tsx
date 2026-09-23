import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner: React.FC<{ message?: string; className?: string }> = ({
  message = 'Loading data...',
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-12 gap-3 text-slate-400 ${className}`}>
      <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      <span className="text-xs font-semibold tracking-wider uppercase text-slate-400">{message}</span>
    </div>
  );
};
