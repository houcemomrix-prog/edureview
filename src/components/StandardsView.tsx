import React from 'react';
import { Language } from '../lib/translations';
import { 
  Download, 
  FileText, 
  BookOpenCheck,
  ExternalLink,
  Scale,
  Shield
} from 'lucide-react';

interface StandardsViewProps {
  language: Language;
}

export function StandardsView({ language }: StandardsViewProps) {
  return (
    <div className="space-y-6" id="quality-standards-portal">
      {/* CLASSIFICATION EXPLANATION SECTION (أقسام وأنواع الفحص والتدقيق الوزاري) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm space-y-5 text-right font-sans">
        <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-right rtl:flex-row-reverse">
          <div className="space-y-0.5">
            <h3 className="text-sm font-black text-[#051C3F]">
              {language === 'ar' ? '🔍 الهيكل التنظيمي لعمليات الفحص والتدقيق' : '🔍 Organizational Moderation Framework'}
            </h3>
            <p className="text-[10px] text-slate-400 font-bold">
              {language === 'ar' ? 'تحديد مسارات المطابقة والتعديل الفني بناءً على المرحلة الصفية' : 'Specific verification pathways according to academic grade level classifications'}
            </p>
          </div>
          <span className="self-start sm:self-center px-2.5 py-0.5 rounded-full bg-[#051C3F]/5 text-[#051C3F] font-mono text-[9px] font-extrabold tracking-wide">
            {language === 'ar' ? 'القرار الوزاري رقم 32 لعام 2025' : 'MINISTRY DECREE NO. 32/2025'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Continuous Moderation Card (Grades 1-11) */}
          <div className="bg-[#f0fdfa]/60 rounded-2xl p-5 border border-[#0d9488]/15 space-y-3 flex flex-col justify-between">
            <div className="space-y-2 text-right">
              <div className="flex items-center gap-2 justify-start rtl:flex-row-reverse">
                <div className="p-2 bg-[#ccfbf1] text-[#0f766e] rounded-xl shrink-0">
                  <Scale className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-[#115e59]">
                    {language === 'ar' ? 'الفحص والتدقيق المستمر' : 'Continuous Moderation & Auditing'}
                  </h4>
                  <p className="text-[9.5px] text-[#0d9488] font-extrabold">
                    {language === 'ar' ? 'للصفوف الدراسية من (1) إلى (11)' : 'Targeting Grade Levels (1) to (11)'}
                  </p>
                </div>
              </div>
              <p className="text-[10.5px] text-slate-600 leading-relaxed pt-1.5">
                {language === 'ar' ? 'نظام مراجعة تراكمية دورية على مدار الفصل الدراسي يرتكز على مطابقة وتأمين مخرجات وأدوات التقويم المدرسي (الاختبارات، الواجبات المنزلية، التقديمات الصفية) للتثبت من الالتزام بالمعايير وحصص التقييم المعتمدة.' : 'Periodic cumulative review framework targeting secondary continuous evaluation metrics (tests, assignments, oral sessions) to ensure full matches with certified standards.'}
              </p>
            </div>
            
            <div className="bg-white/80 rounded-xl p-3 border border-teal-100/40 text-[9.5px] text-slate-500 font-medium space-y-1 mt-2">
              <div className="flex items-center gap-1.5 justify-start rtl:flex-row-reverse">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488]"></span>
                <span>{language === 'ar' ? 'العينة المستهدفة: سحب فحص عشوائي توازني لملفات ودفاتر الصف.' : 'Audit Spec: Balanced random portfolio sampling across class units.'}</span>
              </div>
              <div className="flex items-center gap-1.5 justify-start rtl:flex-row-reverse">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488]"></span>
                <span>{language === 'ar' ? 'آلية التعديل: إقرار الملاحظات بالتسجيل الثنائي مع الموجه المساعد.' : 'Action Flow: Twin verification with assigned co-moderators.'}</span>
              </div>
            </div>
          </div>

          {/* Final Moderation Card (Grade 12) */}
          <div className="bg-[#f4f3ff]/60 rounded-2xl p-5 border border-[#6366f1]/15 space-y-3 flex flex-col justify-between">
            <div className="space-y-2 text-right">
              <div className="flex items-center gap-2 justify-start rtl:flex-row-reverse">
                <div className="p-2 bg-[#e0e7ff] text-[#4338ca] rounded-xl shrink-0">
                  <Shield className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-[#1e1b4b]">
                    {language === 'ar' ? 'الفحص والتدقيق النهائي' : 'Final Moderation & Auditing'}
                  </h4>
                  <p className="text-[9.5px] text-[#4f46e5] font-extrabold">
                    {language === 'ar' ? 'لصفوف دبلوم التعليم العام (الصف 12)' : 'Targeting General Education Diploma (Grade 12)'}
                  </p>
                </div>
              </div>
              <p className="text-[10.5px] text-slate-600 leading-relaxed pt-1.5">
                {language === 'ar' ? 'نظام فحص مركزي صارم قبل مرحلة لجان الامتحانات الوطنية وتأكيد النتائج. تشرف عليه لجان وزارية مبعوثة من المديريات العامة للتعليم للتحقق الشامل من مطابقة العينات، رصد الأخطاء الفاحصة وجبر علامات دبلوم العام.' : 'Strict central validation process prior to national board exams. Directed by delegated Ministry committees to verify student file authenticity to back Diploma accreditation.'}
              </p>
            </div>

            <div className="bg-white/80 rounded-xl p-3 border border-indigo-100/40 text-[9.5px] text-slate-500 font-medium space-y-1 mt-2">
              <div className="flex items-center gap-1.5 justify-start rtl:flex-row-reverse">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6366f1]"></span>
                <span>{language === 'ar' ? 'العينة المستهدفة: 6 طلاب (2 ممتاز، 2 متوسط، 2 ضعيف) تضاعف لـ 12 عند المخالفة.' : 'Audit Spec: 6 student files (2 high, 2 mid, 2 low) rising to 12 if issues occur.'}</span>
              </div>
              <div className="flex items-center gap-1.5 justify-start rtl:flex-row-reverse">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6366f1]"></span>
                <span>{language === 'ar' ? 'آلية التعديل: إقرار إلزامي بالأدلة وتعديل بجمع الدرجات أو جبر كسر كلي.' : 'Action Flow: Direct score correction ledger logged to Regional Board.'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SUPPORT FILES SECTION (ملفات الدعم) */}
      <div className="bg-[#FAF9F5] rounded-3xl p-6 border border-[#051C3F]/10 shadow-xs space-y-4 text-right">
        <div className="flex items-center gap-2 border-b border-slate-200/60 pb-3 justify-start rtl:flex-row-reverse">
          <div className="p-2 rounded-xl bg-[#051C3F]/5 text-[#051C3F]">
            <BookOpenCheck className="w-5 h-5 text-slate-800" />
          </div>
          <div className="text-right">
            <h3 className="text-sm font-black text-slate-900">
              {language === 'ar' ? 'ملفات الدعم' : 'Support Files & Resource Documents'}
            </h3>
            <p className="text-[10px] text-slate-500 font-bold font-mono">
              {language === 'ar' ? 'الوثائق والأدلة الرسمية المعتمدة' : 'Official verification files and guidelines list'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* File 1: ضوابط الفحص و التدقيق */}
          <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 hover:border-emerald-600/30 transition-all group shadow-2xs rtl:flex-row-reverse">
            <div className="flex items-center gap-3 rtl:flex-row-reverse">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-105 transition-transform shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="space-y-0.5 text-right">
                <span className="text-xs font-black text-slate-800 block">
                  {language === 'ar' ? 'ضوابط الفحص و التدقيق' : 'Examination and Verification Regulations'}
                </span>
                <span className="text-[10px] text-slate-400 font-bold">
                  {language === 'ar' ? 'مرفق PDF رسمي (نوفمبر 2025)' : 'Official PDF documentation (Nov 2025)'}
                </span>
              </div>
            </div>
            <a
              href="/api/download-guidelines-pdf"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-[11px] flex items-center gap-1.5 transition-all shrink-0 cursor-pointer shadow-sm hover:shadow-md"
              download="ضوابط_الفحص_والتدقيق_النهائي_عمان_2025.pdf"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'تحميل الملف' : 'Download'}</span>
            </a>
          </div>

          {/* File 2: وثائق تقويم مواد العلوم الانسانية */}
          <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 hover:border-blue-600/30 transition-all group shadow-2xs rtl:flex-row-reverse">
            <div className="flex items-center gap-3 rtl:flex-row-reverse">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-105 transition-transform shrink-0">
                <ExternalLink className="w-5 h-5" />
              </div>
              <div className="space-y-0.5 text-right">
                <span className="text-xs font-black text-slate-800 block">
                  {language === 'ar' ? 'وثائق تقويم مواد العلوم الانسانية' : 'Humanities Evaluation Documents'}
                </span>
                <span className="text-[10px] text-slate-400 font-bold">
                  {language === 'ar' ? 'مجلد خارجي تفاعلي (Google Drive)' : 'External Shared Folder (Google Drive)'}
                </span>
              </div>
            </div>
            <a
              href="https://drive.google.com/drive/folders/1CbCFUTtNlN2HRaio9pZS8TgMb_zovFhL?usp=drive_link"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-[11px] flex items-center gap-1.5 transition-all shrink-0 cursor-pointer shadow-sm hover:shadow-md"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'فتح المجلد' : 'Open Link'}</span>
            </a>
          </div>

          {/* File 3: وثائق تقويم مواد العلوم التطبيقية */}
          <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 hover:border-violet-600/30 transition-all group shadow-2xs rtl:flex-row-reverse">
            <div className="flex items-center gap-3 rtl:flex-row-reverse">
              <div className="p-3 bg-violet-50 text-violet-600 rounded-xl group-hover:scale-105 transition-transform shrink-0">
                <ExternalLink className="w-5 h-5 text-violet-600" />
              </div>
              <div className="space-y-0.5 text-right">
                <span className="text-xs font-black text-slate-800 block">
                  {language === 'ar' ? 'وثائق تقويم مواد العلوم التطبيقية' : 'Applied Sciences Evaluation Documents'}
                </span>
                <span className="text-[10px] text-slate-400 font-bold">
                  {language === 'ar' ? 'مجلد وثائق تقويم العلوم التطبيقية المعتمدة (Google Drive)' : 'Certified Applied Sciences assessment documents (Google Drive)'}
                </span>
              </div>
            </div>
            <a
              href="https://drive.google.com/drive/folders/1h0M8lV3TUM8Zm_LpvjHX7QALQ9t7J70P?usp=drive_link"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl text-[11px] flex items-center gap-1.5 transition-all shrink-0 cursor-pointer shadow-sm hover:shadow-md"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'فتح المجلد' : 'Open Link'}</span>
            </a>
          </div>

          {/* File 4: وثائق تقويم مواد المهارات الفردية */}
          <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 hover:border-amber-600/30 transition-all group shadow-2xs rtl:flex-row-reverse">
            <div className="flex items-center gap-3 rtl:flex-row-reverse">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl group-hover:scale-105 transition-transform shrink-0">
                <ExternalLink className="w-5 h-5 text-amber-600" />
              </div>
              <div className="space-y-0.5 text-right">
                <span className="text-xs font-black text-slate-800 block">
                  {language === 'ar' ? 'وثائق تقويم مواد المهارات الفردية' : 'Individual Skills Evaluation Documents'}
                </span>
                <span className="text-[10px] text-slate-400 font-bold">
                  {language === 'ar' ? 'مجلد وثائق تقويم المهارات الفردية المعتمدة (Google Drive)' : 'Certified Individual Skills assessment documents (Google Drive)'}
                </span>
              </div>
            </div>
            <a
              href="https://drive.google.com/drive/folders/11fITMWHadh-HqL74tY7lSnETMfT8DH_E"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-[11px] flex items-center gap-1.5 transition-all shrink-0 cursor-pointer shadow-sm hover:shadow-md"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'فتح المجلد' : 'Open Link'}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
