import React from 'react';
import {
  Binary,
  Database,
  Cpu,
  Network,
  Calculator,
  Briefcase,
  BookOpen,
} from 'lucide-react';

interface SubjectIconProps {
  subject: string;
  className?: string;
}

export const SubjectIcon: React.FC<SubjectIconProps> = ({ subject, className = 'w-4 h-4' }) => {
  switch (subject) {
    case 'CS301':
    case 'DSA':
      return <Binary className={className} />;
    case 'CS336':
    case 'DBMS':
      return <Database className={className} />;
    case 'OS':
      return <Cpu className={className} />;
    case 'CS334':
    case 'CN':
      return <Network className={className} />;
    case 'CG303':
    case 'Aptitude':
      return <Calculator className={className} />;
    case 'Placement':
      return <Briefcase className={className} />;
    default:
      return <BookOpen className={className} />;
  }
};
