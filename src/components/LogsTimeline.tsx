import React from 'react';
import { FileUp, Eye, CheckCircle2, RotateCcw, MessageSquare } from 'lucide-react';
import { ActivityLog } from '../types';
import { Language } from '../lib/translations';

interface LogsTimelineProps {
  logs: ActivityLog[];
  language?: Language;
}

export function LogsTimeline({ logs, language = 'en' }: LogsTimelineProps) {
  if (logs.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400 text-xs font-sans">
        {language === 'ar' ? 'لا توجد أنشطة مسجلة حالياً.' : 'No log activities reported yet.'}
      </div>
    );
  }

  // Get action details: icon, background, text colors
  const getActionConfig = (action: string) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('create') || actionLower.includes('upload')) {
      return { Icon: FileUp, bg: 'bg-[#0B2C1A]/10 border-emerald-250', text: 'text-[#0B2C1A]' };
    }
    if (actionLower.includes('claim')) {
      return { Icon: Eye, bg: 'bg-sky-50 border-sky-200', text: 'text-sky-600' };
    }
    if (actionLower.includes('approve')) {
      return { Icon: CheckCircle2, bg: 'bg-emerald-50 border-emerald-250', text: 'text-emerald-700' };
    }
    if (actionLower.includes('revision') || actionLower.includes('request')) {
      return { Icon: RotateCcw, bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700' };
    }
    return { Icon: MessageSquare, bg: 'bg-slate-50 border-slate-200', text: 'text-slate-600' };
  };

  const getActionName = (action: string) => {
    if (language === 'ar') {
      const actionLower = action.toLowerCase();
      if (actionLower.includes('create') || actionLower.includes('upload')) return 'رفع مسودة';
      if (actionLower.includes('claim')) return 'استلام التدقيق';
      if (actionLower.includes('approve')) return 'اعتماد نهائي';
      if (actionLower.includes('revision') || actionLower.includes('request')) return 'طلب تعديل وإرجاع';
      return action;
    }
    return action;
  };

  const getRoleName = (role: string) => {
    if (language === 'ar') {
      if (role === 'admin') return 'مدير البوابة';
      if (role === 'moderator') return 'مشرف المادة';
      if (role === 'school') return 'ممثل المدرسة';
    }
    return role;
  };

  return (
    <div className={`relative space-y-5.5 py-2.5 ${
      language === 'ar' 
        ? 'text-right border-r border-slate-100 mr-4 pr-6 pl-0 ml-0' 
        : 'text-left border-l border-slate-100 ml-4 pl-6'
    }`}>
      {logs.map((log, index) => {
        const { Icon, bg, text } = getActionConfig(log.action);
        const logDate = new Date(log.createdAt);

        return (
          <div key={`log-timeline-${log.id || index}-${index}`} className="relative text-xs">
            {/* Dot marker */}
            <span className={`absolute ${
              language === 'ar' ? '-right-[33px]' : '-left-[33px]'
            } top-0 rounded-lg border w-7 h-7 flex items-center justify-center ${bg} ${text} shadow-xs transition-transform hover:scale-105`}>
              <Icon className="w-4 h-4 stroke-[2.2]" />
            </span>

            {/* Content box */}
            <div className="space-y-1.5 pl-1">
              <div className="flex flex-wrap items-center gap-1.5 font-sans">
                <span className="text-slate-800 font-bold text-xs">{log.userName}</span>
                <span className="text-slate-400 font-medium text-[10.5px]">({getRoleName(log.userRole)})</span>
                <span className="px-1.5 py-0.5 rounded text-[9.5px] uppercase tracking-wide font-extrabold bg-[#0B2C1A]/5 text-[#0B2C1A] border border-[#0B2C1A]/10">
                  {getActionName(log.action)}
                </span>
                <span className={`${language === 'ar' ? 'mr-auto' : 'ml-auto'} text-slate-400 font-mono text-[10px] bg-slate-50 px-2 py-0.5 rounded border border-slate-100`}>
                  {logDate.toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', { hour12: true, month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {log.comment && (
                <div className="bg-slate-50 text-slate-600 rounded-xl p-3 border border-slate-100 italic mt-1 font-sans text-[11.5px] leading-relaxed shadow-inner">
                  "{log.comment}"
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
