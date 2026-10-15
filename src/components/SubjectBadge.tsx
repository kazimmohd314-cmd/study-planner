import React from 'react';
import { SubjectIcon } from './SubjectIcon';

interface SubjectBadgeProps {
  subject: string;
  showIcon?: boolean;
  className?: string;
  size?: 'sm' | 'md';
}

export const SubjectBadge: React.FC<SubjectBadgeProps> = ({
  subject,
  showIcon = true,
  className = '',
  size = 'md',
}) => {
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5 gap-1' : 'text-xs px-2.5 py-1 gap-1.5';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border bg-slate-100 text-slate-700 border-slate-200 ${sizeClasses} ${className}`}
    >
      {showIcon && <SubjectIcon subject={subject} className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
      <span>{subject}</span>
    </span>
  );
};
