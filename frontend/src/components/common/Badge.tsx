import React from 'react';
import { getStatusBadgeClass, getPriorityBadgeClass } from '../../utils/formatters.js';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'status' | 'priority' | 'custom';
  status?: string;
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'custom',
  status = '',
  className = '',
  size = 'md',
}) => {
  let colorStyles = 'bg-slate-800 text-slate-300 border-slate-700';

  if (variant === 'status' && status) {
    colorStyles = getStatusBadgeClass(status);
  } else if (variant === 'priority' && status) {
    colorStyles = getPriorityBadgeClass(status);
  }

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold capitalize rounded-full border ${colorStyles} ${sizeStyles[size]} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {children}
    </span>
  );
};
