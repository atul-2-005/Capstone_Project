import React from 'react';

export default function StatusBadge({ status }) {
  if (!status) return null;

  const s = status.toUpperCase();

  let dotColor = 'bg-slate-400';
  let badgeStyle = 'bg-slate-50 text-slate-700 border-slate-200/80';

  if (s === 'RESOLVED' || s === 'CONFIRMED' || s === 'AVAILABLE' || s === 'ACTIVE') {
    dotColor = 'bg-emerald-500';
    badgeStyle = 'bg-emerald-50/80 text-emerald-800 border-emerald-200/60';
  } else if (s === 'IN_PROGRESS') {
    dotColor = 'bg-indigo-500 animate-pulse';
    badgeStyle = 'bg-indigo-50/80 text-indigo-800 border-indigo-200/60';
  } else if (s === 'ASSIGNED') {
    dotColor = 'bg-sky-500';
    badgeStyle = 'bg-sky-50/80 text-sky-800 border-sky-200/60';
  } else if (s === 'SUBMITTED' || s === 'PENDING_APPROVAL' || s === 'REPORTED') {
    dotColor = 'bg-amber-500';
    badgeStyle = 'bg-amber-50/80 text-amber-800 border-amber-200/60';
  } else if (s === 'REJECTED' || s === 'CANCELLED' || s === 'INACTIVE' || s === 'MAINTENANCE') {
    dotColor = 'bg-rose-500';
    badgeStyle = 'bg-rose-50/80 text-rose-800 border-rose-200/60';
  } else if (s === 'CLOSED' || s === 'CLAIMED') {
    dotColor = 'bg-slate-500';
    badgeStyle = 'bg-slate-100 text-slate-700 border-slate-200';
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${badgeStyle} tracking-tight`}
    >
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dotColor}`} />
      {status.replace(/_/g, ' ')}
    </span>
  );
}
