import React from 'react';
import { AlertCircle, AlertTriangle, ArrowDown, ArrowUp } from 'lucide-react';

export default function PriorityBadge({ priority }) {
  if (!priority) return null;

  const p = priority.toUpperCase();

  if (p === 'URGENT') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200/80">
        <AlertCircle className="w-3 h-3 mr-1 text-rose-500 animate-pulse" />
        URGENT
      </span>
    );
  }
  if (p === 'HIGH') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80">
        <ArrowUp className="w-3 h-3 mr-1 text-amber-500" />
        HIGH
      </span>
    );
  }
  if (p === 'MEDIUM') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/80">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5" />
        MEDIUM
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
      <ArrowDown className="w-3 h-3 mr-1 text-slate-400" />
      LOW
    </span>
  );
}
