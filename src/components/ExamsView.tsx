import React from 'react';
import { FileSpreadsheet } from 'lucide-react';
import { Assessment } from '../types';
import { Language, translateSubject, translateGrade } from '../lib/translations';
import { Badge } from './Badge';

interface ExamsViewProps {
  assessments: Assessment[];
  language: Language;
  onInspect: (item: Assessment) => void;
}

export function ExamsView({ assessments, language, onInspect }: ExamsViewProps) {
  return (
    <div className="bg-white rounded-3xl p-6.5 border border-slate-205/50 shadow-md animate-in fade-in duration-200 text-left font-sans">
      <div className="space-y-1.5 border-b border-slate-100 pb-4">
        <h3 className="text-lg font-extrabold font-heading text-[#0B1E40]">
          {language === 'ar' ? '📂 قائمة المناهج والوظائف الوطنية المعينة' : '📂 Registered National Exams Catalog'}
        </h3>
        <p className="text-xs text-slate-400">
          {language === 'ar' ? 'تتبع مركزي ومطابقة شاملة لجميع مشاريع ومخرجات الامتحانات المرفوعة لوزارة التعليم' : 'Centralized inspection registry for all institutional unified blueprints across Oman districts.'}
        </p>
      </div>

      <div className="overflow-x-auto pt-4">
        <table className="w-full text-xs text-slate-705 text-left rtl:text-right border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[10.5px] font-black uppercase text-slate-400 tracking-wider">
              <th className="py-3 px-4">{language === 'ar' ? 'العنوان المقترح' : 'Proposed Title'}</th>
              <th className="py-3 px-4">{language === 'ar' ? 'المادة الدراسية' : 'Academic Subject'}</th>
              <th className="py-3 px-4">{language === 'ar' ? 'الصف' : 'Grade'}</th>
              <th className="py-3 px-4">{language === 'ar' ? 'المدرسة المعتمدة' : 'Registered Institution'}</th>
              <th className="py-3 px-4">{language === 'ar' ? 'حالة الاعتماد' : 'Verification Status'}</th>
              <th className="py-3 px-4">{language === 'ar' ? 'الإجراءات الأكاديمية' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            {assessments.length === 0 ? (
              <tr key="exams-empty">
                <td colSpan={6} className="text-center py-12 text-slate-400 font-bold">
                  {language === 'ar' ? 'لم يتم العثور على أي ملفات وطنية.' : 'No national items uploaded in active database.'}
                </td>
              </tr>
            ) : (
              assessments.map((item, index) => (
                <tr key={`exam-item-${item.id || index}-${index}`} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-4 font-extrabold font-heading text-[#0B1E40]">{item.title}</td>
                  <td className="py-3.5 px-4 font-bold">{translateSubject(item.subject, language)}</td>
                  <td className="py-3.5 px-4 font-semibold">
                    <div className="space-y-1">
                      <span className="block font-semibold">{translateGrade(item.grade, language)}</span>
                      {item.grade === 'Grade 12' ? (
                        <span className="inline-block px-1.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-150 text-[#3c1e7a] text-[8.5px] font-black tracking-wide leading-none">
                          {language === 'ar' ? 'فحص وتدقيق نهائي' : 'Final Audit'}
                        </span>
                      ) : (
                        <span className="inline-block px-1.5 py-0.5 rounded-md bg-teal-50 border border-teal-150 text-[#0f5445] text-[8.5px] font-black tracking-wide leading-none">
                          {language === 'ar' ? 'فحص وتدقيق مستمر' : 'Continuous Audit'}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-500">{item.schoolName}</td>
                  <td className="py-3.5 px-4">
                    <Badge status={item.status} language={language} />
                  </td>
                  <td className="py-3.5 px-4">
                    <button
                      type="button"
                      onClick={() => onInspect(item)}
                      className="px-3 py-1.5 bg-[#0c2e5c]/10 hover:bg-[#0c2e5c]/25 text-[#051C3F] font-extrabold text-[10px] rounded-lg cursor-pointer transition-colors"
                    >
                      {language === 'ar' ? '🔍 فحص ومراجعة' : '🔍 Inspect Material'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
