import React from 'react';
import { CheckCircle, AlertTriangle, Clock, Play, Percent } from 'lucide-react';
import { AssessmentStatus } from '../types';
import { translateStatus, Language } from '../lib/translations';

interface BadgeProps {
  status: AssessmentStatus;
  language?: Language;
}

export function Badge({ status, language = 'en' }: BadgeProps) {
  let bgClass = '';
  let Icon = Clock;

  switch (status) {
    case 'Approved':
      bgClass = 'bg-emerald-50 text-emerald-800 border-emerald-200/60';
      Icon = CheckCircle;
      break;
    case 'Revision Request':
      bgClass = 'bg-rose-50 text-rose-800 border-rose-200/60';
      Icon = AlertTriangle;
      break;
    case 'Grade Revision':
      bgClass = 'bg-indigo-50 text-indigo-800 border-indigo-200/60';
      Icon = Percent;
      break;
    case 'In Progress':
      bgClass = 'bg-sky-50 text-sky-800 border-sky-200/60';
      Icon = Play;
      break;
    case 'Pending':
    default:
      bgClass = 'bg-amber-50 text-amber-800 border-amber-200/60';
      Icon = Clock;
      break;
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold font-sans border tracking-wide uppercase ${bgClass}`}>
      <Icon className="w-3 h-3 flex-shrink-0 stroke-[2.2]" />
      {translateStatus(status, language)}
    </span>
  );
}
