import React from 'react';
import { Flame, AlertCircle, ArrowDown, AlertOctagon } from 'lucide-react';
import type { Priority } from '../types';

interface PriorityBadgeProps {
  priority: Priority;
  size?: 'sm' | 'md';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'text-[10px] px-2 py-0.5 gap-1' : 'text-xs px-2.5 py-1 gap-1.5';

  switch (priority) {
    case 'Critical':
      return (
        <span
          className={`inline-flex items-center font-extrabold rounded-full bg-rose-600 text-white ${sizeClasses}`}
        >
          <AlertOctagon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          <span>Critical</span>
        </span>
      );
    case 'High':
      return (
        <span
          className={`inline-flex items-center font-bold rounded-full bg-rose-50 text-rose-700 border border-rose-200/80 ${sizeClasses}`}
        >
          <Flame className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          <span>High</span>
        </span>
      );
    case 'Medium':
      return (
        <span
          className={`inline-flex items-center font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 ${sizeClasses}`}
        >
          <AlertCircle className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          <span>Medium</span>
        </span>
      );
    case 'Low':
      return (
        <span
          className={`inline-flex items-center font-medium rounded-full bg-slate-100 text-slate-600 border border-slate-200 ${sizeClasses}`}
        >
          <ArrowDown className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          <span>Low</span>
        </span>
      );
  }
};
