import React from 'react';
import { X, Sparkles, AlertCircle, CheckCircle, HelpCircle } from 'lucide-react';

interface AIPrecheckResult {
  gradeVerdict: string;
  syllabusMatchScore: number;
  detailedFeedback: string;
  suggestedImprovements: string[];
}

interface AIPrecheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: AIPrecheckResult | null;
  loading: boolean;
  language?: 'en' | 'ar';
}

export function AIPrecheckModal({ isOpen, onClose, result, loading, language = 'en' }: AIPrecheckModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-2xl overflow-hidden max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-radial from-slate-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
              <Sparkles className="w-5 h-5 text-amber-600 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold font-heading text-slate-800 text-base leading-tight">
                {language === 'ar' ? 'تقييم جودة جودة المخطط الدراسي التربوي' : 'Ministry Syllabus Quality Assessment'}
              </h3>
              <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                {language === 'ar' ? 'فحص الامتثال التربوي والمنهجي المدعوم بالذكاء الاصطناعي (Gemini)' : 'Automated pedagogical compliance check powered by Gemini'}
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded-xl p-2 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-full border-4 border-[#D4AF37]/20 border-t-[#0B2C1A] animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-4.5 h-4.5 text-[#D4AF37]" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-slate-800 font-heading">
                  {language === 'ar' ? 'جاري تحليل ومطابقة المنهج الدراسي التربوي...' : 'Analyzing Syllabus Mapping...'}
                </p>
                <p className="text-xs text-slate-400 max-w-sm mt-1 mx-auto leading-relaxed">
                  {language === 'ar' 
                    ? 'جاري فحص مصفوفة المدى والتتابع للدروس، والعدالة التحصيلية والأهداف التعليمية طبقاً للأنظمة والخطط الوزارية العمانية.'
                    : 'Checking curriculum targets, spelling appropriateness, and marking answer alignment against Sultanate of Oman national standards.'}
                </p>
              </div>
            </div>
          ) : result ? (
            <div className="space-y-6 animate-in fade-in">
              {/* Verdict cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Score Circular gauge */}
                <div className="bg-[#0B2C1A]/5 rounded-2xl p-4.5 border border-[#0B2C1A]/10 flex items-center gap-4">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="32" cy="32" r="28" fill="transparent" stroke="#E2E8F0" strokeWidth="6" />
                      <circle 
                        cx="32" cy="32" r="28" fill="transparent" 
                        stroke={result.syllabusMatchScore >= 80 ? '#10B981' : result.syllabusMatchScore >= 50 ? '#D4AF37' : '#EF4444'} 
                        strokeWidth="6" 
                        strokeDasharray={175} 
                        strokeDashoffset={175 - (175 * result.syllabusMatchScore) / 100}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute text-sm font-extrabold text-slate-800 font-heading">{result.syllabusMatchScore}%</span>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-sans">
                      {language === 'ar' ? 'مؤشر مطابقة المنهج' : 'Syllabus Match'}
                    </h4>
                    <p className="text-sm font-bold text-slate-800 font-heading">
                      {language === 'ar' ? 'نقاط التوافق والاتساق' : 'Level Alignment Score'}
                    </p>
                  </div>
                </div>

                {/* Level appropriateness */}
                <div className="bg-[#D4AF37]/5 rounded-2xl p-4.5 border border-[#D4AF37]/10 flex items-center gap-4">
                  <div className="w-13 h-13 rounded-xl bg-white border border-slate-100 shadow-xs flex items-center justify-center">
                    {result.gradeVerdict === 'Appropriate' || result.gradeVerdict === 'ملائم تربوياً' ? (
                      <CheckCircle className="w-6 h-6 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-6 h-6 text-[#D4AF37]" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-sans">
                      {language === 'ar' ? 'الرأي التربوي للمستوى والمحتوى' : 'Grade Target Verdict'}
                    </h4>
                    <p className="text-sm font-bold text-slate-800 font-heading">
                      {result.gradeVerdict === 'Appropriate' ? (language === 'ar' ? 'ملائم تربوياً للمستوى' : 'Appropriate') : result.gradeVerdict}
                    </p>
                  </div>
                </div>
              </div>

              {/* Suggestions items */}
              {result.suggestedImprovements && result.suggestedImprovements.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-[10.5px] font-bold text-slate-400 uppercase tracking-widest block font-sans">
                    {language === 'ar' ? 'أهم التوصيات والتوجيهات الإدارية والتربوية' : 'Key Supervisor Recommendations'}
                  </h4>
                  <ul className="space-y-2">
                    {result.suggestedImprovements.map((imp, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-xs text-slate-700 bg-amber-50/50 p-3 rounded-xl border border-amber-100/60 leading-relaxed text-left">
                        <span className="w-5 h-5 rounded-lg bg-[#D4AF37] text-[#0B2C1A] flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5 shadow-xs">
                          {idx + 1}
                        </span>
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Detailed Breakdown */}
              <div className="space-y-3">
                <h4 className="text-[10.5px] font-bold text-slate-400 uppercase tracking-widest block font-sans">
                  {language === 'ar' ? 'التقييم التربوي التفصيلي بوزارة التعليم' : 'Detailed MOE Pedagogical Evaluation'}
                </h4>
                <div className="bg-slate-50 rounded-2xl p-4.5 border border-slate-100 text-xs text-slate-600 whitespace-pre-wrap leading-relaxed font-sans font-medium text-left">
                  {result.detailedFeedback}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-400 py-12">
              <HelpCircle className="w-12 h-12 mx-auto stroke-1" />
              <p className="text-sm font-bold text-slate-600 font-heading mt-2">
                {language === 'ar' ? 'لا توجد بيانات مراجعة بعد' : 'No verification data'}
              </p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                {language === 'ar' ? 'يرجى إدخال محتوى الأسئلة ونموذج توزيع الدرجات لتشغيل التحليل التلقائي للمنهج.' : 'Please configure questions and marking answers first to run the analysis.'}
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-[#0B2C1A] hover:bg-emerald-950 text-white rounded-xl text-xs font-bold font-sans cursor-pointer shadow-md transition-colors"
          >
            {language === 'ar' ? 'فهمت ومتابعة' : 'Acknowledge & Continue'}
          </button>
        </div>

      </div>
    </div>
  );
}
