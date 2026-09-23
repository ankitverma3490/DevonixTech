export const formatCurrency = (amount: number | undefined | null): string => {
  if (amount === undefined || amount === null || isNaN(amount)) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateStr: string | Date | undefined | null): string => {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString('en-US', {
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
