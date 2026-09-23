import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  subtitle,
  action,
  glow = false,
}) => {
  return (
    <div
      className={`rounded-2xl bg-slate-900/70 border border-slate-800/90 shadow-xl backdrop-blur-md transition-all duration-200 ${
        glow ? 'border-indigo-500/30 shadow-indigo-500/10 hover:border-indigo-500/50' : 'hover:border-slate-700/80'
      } ${className}`}
    >
      {(title || action) && (
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-800/80">
          <div>
            {typeof title === 'string' ? (
              <h3 className="text-base font-bold text-slate-100 tracking-tight">{title}</h3>
            ) : (
              title
            )}
            {subtitle && <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};
