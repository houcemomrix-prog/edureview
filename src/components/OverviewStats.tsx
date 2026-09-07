import React from 'react';
import { Clock, ClipboardList, CheckCircle2, RotateCw, Percent } from 'lucide-react';
import { Assessment, AssessmentStatus } from '../types';
import { Language } from '../lib/translations';

interface OverviewStatsProps {
  assessments: Assessment[];
  language?: Language;
  selectedStatus?: string;
  onStatusClick?: (status: AssessmentStatus) => void;
  userRoleType?: string;
}

export function OverviewStats({ 
  assessments, 
  language = 'en',
  selectedStatus,
  onStatusClick,
  userRoleType
}: OverviewStatsProps) {
  const pending = assessments.filter((a) => a.status === 'Pending').length;
  const progress = assessments.filter((a) => a.status === 'In Progress').length;
  const approved = assessments.filter((a) => a.status === 'Approved').length;
  const revisions = assessments.filter((a) => a.status === 'Revision Request').length;
  const gradeRevisions = assessments.filter((a) => a.status === 'Grade Revision').length;

  const currentLabels = {
    en: {
      units: 'Files',
      progress: 'Under Audit',
      approved: 'Conforming Forms',
      revisions: 'Non-compliant',
      gradeRevisions: 'Grade Revisions',
      pending: 'Pending Inspection',
    },
    ar: {
      units: 'ملفات',
      progress: 'تحت التدقيق',
      approved: 'استمارات مطابقة',
      revisions: 'استمارات غير مطابقة',
      gradeRevisions: 'تعديل درجات',
      pending: 'في انتظار الفحص',
    }
  }[language] || {
    units: 'Files',
    progress: 'Under Audit',
    approved: 'Conforming Forms',
    revisions: 'Non-compliant',
    gradeRevisions: 'Grade Revisions',
    pending: 'Pending Inspection',
  };

  const statCards = [
    {
      status: 'In Progress' as AssessmentStatus,
      label: currentLabels.progress,
      count: progress,
      icon: ClipboardList,
      iconBg: 'bg-blue-50 text-blue-700',
      activeClass: 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/30',
      dotColor: 'bg-blue-500',
    },
    {
      status: 'Approved' as AssessmentStatus,
      label: currentLabels.approved,
      count: approved,
      icon: CheckCircle2,
      iconBg: 'bg-emerald-50 text-emerald-700',
      activeClass: 'border-emerald-600 ring-2 ring-emerald-500/20 bg-emerald-50/30',
      dotColor: 'bg-emerald-500',
    },
    {
      status: 'Revision Request' as AssessmentStatus,
      label: currentLabels.revisions,
      count: revisions,
      icon: RotateCw,
      iconBg: 'bg-rose-50 text-rose-700',
      activeClass: 'border-rose-600 ring-2 ring-rose-500/20 bg-rose-50/30',
      dotColor: 'bg-rose-500',
    },
    {
      status: 'Grade Revision' as AssessmentStatus,
      label: currentLabels.gradeRevisions,
      count: gradeRevisions,
      icon: Percent,
      iconBg: 'bg-indigo-50 text-indigo-700',
      activeClass: 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/30',
      dotColor: 'bg-indigo-500',
    },
    {
      status: 'Pending' as AssessmentStatus,
      label: currentLabels.pending,
      count: pending,
      icon: Clock,
      iconBg: 'bg-amber-50 text-amber-700',
      activeClass: 'border-amber-600 ring-2 ring-amber-500/20 bg-amber-50/30',
      dotColor: 'bg-amber-500',
    },
  ];

  const filteredCards = userRoleType === 'teacher'
    ? statCards.filter(card => card.status !== 'In Progress' && card.status !== 'Approved' && card.status !== 'Revision Request')
    : statCards;

  return (
    <div className={`grid gap-2.5 sm:gap-3.5 w-full ${
      userRoleType === 'teacher'
        ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto'
        : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'
    }`}>
      {filteredCards.map((card, i) => {
        const Icon = card.icon;
        const isSelected = selectedStatus === card.status;
        const isClickable = !!onStatusClick;

        return (
          <button
            key={i}
            type="button"
            disabled={!isClickable}
            onClick={() => onStatusClick?.(card.status)}
            className={`rounded-2xl p-3.5 sm:p-4 transition-all duration-200 flex flex-col justify-between items-start text-right relative overflow-hidden outline-hidden ${
              isClickable 
                ? 'cursor-pointer hover:shadow-xs hover:border-slate-300' 
                : 'cursor-default'
            } ${
              isSelected 
                ? `${card.activeClass} shadow-xs` 
                : 'bg-white border border-slate-200/80 hover:bg-slate-50/60'
            }`}
          >
            {/* Top row: Icon and status dot */}
            <div className="flex items-center justify-between w-full mb-2">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${card.iconBg}`}>
                <Icon className="w-4 h-4 stroke-[2.2]" />
              </div>
              <span className={`w-2 h-2 rounded-full ${card.dotColor}`} />
            </div>

            {/* Core figures and label */}
            <div className="space-y-1 w-full text-right">
              <div className="flex items-baseline gap-1.5 justify-start">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-none font-sans">
                  {card.count}
                </span>
                <span className="text-[10px] font-medium text-slate-400">
                  {currentLabels.units}
                </span>
              </div>
              <h4 className="text-xs sm:text-xs font-bold text-slate-700 leading-snug">
                {card.label}
              </h4>
            </div>
          </button>
        );
      })}
    </div>
  );
}
