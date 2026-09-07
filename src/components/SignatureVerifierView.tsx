import React, { useState } from 'react';
import { 
  Search, 
  ShieldCheck, 
  FileCheck, 
  Clock, 
  User, 
  School, 
  Hash, 
  AlertCircle,
  QrCode,
  Fingerprint,
  Calendar,
  Layers,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { ArchivedForm } from '../types';
import { Language } from '../lib/translations';

interface SignatureVerifierViewProps {
  archivedForms: ArchivedForm[];
  language: Language;
}

export function SignatureVerifierView({ archivedForms, language }: SignatureVerifierViewProps) {
  const [searchSerial, setSearchSerial] = useState('');
  const [selectedVerifiable, setSelectedVerifiable] = useState<ArchivedForm | null>(null);

  // Filter signed forms that have signatureQrData
  const signedForms = archivedForms.filter(f => f.isSigned && f.signatureQrData);

  // Exact or Fuzzy/Concatenated search logic
  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    let queryNorm = searchSerial.trim().toUpperCase();
    if (!queryNorm) return;

    // Forcefully remove ISO dates YYYY-MM-DD from the search query to handle double-line copying
    queryNorm = queryNorm.replace(/\d{4}-\d{2}-\d{2}/g, '').trim();
    
    // Strip all whitespaces
    const queryClean = queryNorm.replace(/\s/g, '');

    // Find the matching signed form using robust fuzzy/substring matching
    const match = signedForms.find(f => {
      const dbCode = (f.signatureQrData || '').trim().toUpperCase();
      const dbCodeClean = dbCode.replace(/\s/g, '');

      if (!dbCodeClean) return false;

      // Match conditions:
      // 1. Exact match (case insensitive, space-stripped)
      // 2. User paste contains the database signature code as a substring (e.g. pasted OM-SIG-J8NJ4H3B2026-06-09)
      // 3. User typed a portion of the code (e.g., J8NJ4H3B)
      return (
        dbCodeClean === queryClean ||
        (dbCodeClean.length >= 5 && queryClean.includes(dbCodeClean)) ||
        (queryClean.length >= 5 && dbCodeClean.includes(queryClean)) ||
        queryNorm.includes(dbCode) ||
        dbCode.includes(queryNorm)
      );
    });

    if (match) {
      setSelectedVerifiable(match);
    } else {
      setSelectedVerifiable(null);
    }
  };

  const handleSelectFormDirectly = (form: ArchivedForm) => {
    setSearchSerial(form.signatureQrData || '');
    setSelectedVerifiable(form);
  };

  return (
    <div className="space-y-6 text-right font-sans" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Hero Banner header */}
      <div className="bg-linear-to-r from-slate-905 to-[#051C3F] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden text-right">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-500/5 rounded-full blur-2xl -ml-10 -mb-10"></div>
        
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2 text-right">
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[10.5px] font-black rounded-full uppercase tracking-wider inline-flex items-center gap-1">
              <Fingerprint className="w-3.5 h-3.5" />
              {language === 'ar' ? 'البوابة الوطنية الفيدرالية للتحقق' : 'National Verification Gateway'}
            </span>
            <h2 className="text-xl sm:text-2xl font-black font-heading tracking-tight text-white leading-tight">
              {language === 'ar' ? 'أداة التثبت والتحقق الفوري من التواقيع الرقمية' : 'Audit Signature Resolver Terminal'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl font-medium leading-relaxed font-sans">
              {language === 'ar' 
                ? 'نظام التحقق الإلكتروني للتحقق من هوية أصحاب المصلحة الذين وقعوا وصادقوا على استمارات التقييم والتدقيق المستمر لمدارس سلطنة عمان.'
                : 'Central verification engine to query and authenticate the digital stamp and signature code of Ministry officials.'}
            </p>
          </div>
        </div>
      </div>

      {/* Grid containing Resolver tool and live signed archives */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Resolver Query Panel (col-span-12 or col-span-7) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Query Box component */}
          <div className="bg-white rounded-3xl border border-slate-200/50 p-5 sm:p-6 shadow-sm space-y-5">
            <div className="space-y-1 text-right">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base font-heading">
                {language === 'ar' ? 'فحص ومطابقة الرمز التسلسلي للتوقيع' : 'Lookup Signature Serial'}
              </h3>
              <p className="text-[11.5px] text-slate-400 font-sans leading-relaxed">
                {language === 'ar' 
                  ? 'أدخل الرمز التسلسلي المطبوع على الاستمارة المعتمدة (مثال: OM-SIG-XXXXXX) للتحقق من هوية مدير المدرسة الذي اعتمد المستند.' 
                  : 'Key in the alphanumeric verification reference directly to pull metadata of the authorizing school authority.'}
              </p>
            </div>

            <form onSubmit={handleVerify} className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder={language === 'ar' ? 'أدخل الرمز التسلسلي هنا (مثال: OM-SIG-A8B9C2)' : 'e.g. OM-SIG-F2B3E6A'}
                  value={searchSerial}
                  onChange={(e) => setSearchSerial(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#821315] focus:ring-1 focus:ring-[#821315]/10 outline-hidden transition-all text-xs font-mono font-bold uppercase tracking-wider text-right"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <Search className="w-4 h-4" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-slate-900 hover:bg-black text-white text-xs font-black rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{language === 'ar' ? 'تحقق ومطابقة الهوية الآن' : 'Verify & Extract Digital Identity'}</span>
              </button>
            </form>

            {/* Verification Result Display */}
            <div className="pt-2">
              {!searchSerial.trim() ? (
                <div className="text-center py-10 border border-dashed border-slate-150 rounded-2xl bg-slate-50/20 flex flex-col items-center justify-center space-y-2">
                  <QrCode className="w-10 h-10 text-slate-300 animate-pulse" />
                  <span className="text-[11px] text-slate-400 font-sans">
                    {language === 'ar' ? 'في انتظار إدخال الرمز التسلسلي للتثبت...' : 'Awaiting alphanumeric signature key...'}
                  </span>
                </div>
              ) : selectedVerifiable ? (
                // Verified successfully display card
                <div className="bg-emerald-50/10 border border-emerald-300 p-5 rounded-2xl space-y-4 animate-in zoom-in-95 duration-150 text-right">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-3 py-1 rounded-full text-[9px] font-black bg-emerald-100/50 border border-emerald-300 text-emerald-800 uppercase tracking-widest leading-none font-sans flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 animate-bounce" />
                      {language === 'ar' ? 'توقيع معتمد وموثق' : 'Authenticity Verified'}
                    </span>
                    <span className="font-mono text-[9.5px] text-slate-500 font-bold">
                      {selectedVerifiable.signatureQrData}
                    </span>
                  </div>

                  <div className="border-t border-emerald-300/30 pt-3.5 space-y-4">
                    
                    {/* Signed Representative Identity details */}
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-emerald-100/40 rounded-xl text-emerald-800 shrink-0">
                        <User className="w-5 h-5" />
                      </div>
                      <div className="space-y-0.5 text-right w-full">
                        <span className="text-[10px] text-slate-400 font-black tracking-wide block">
                          {language === 'ar' ? 'صاحب التوقيع والاعتماد (مدير المدرسة):' : 'Authorizing Official Signature Name:'}
                        </span>
                        <strong className="text-slate-800 font-black text-sm block">
                          أ. {selectedVerifiable.signedByPrincipalName || selectedVerifiable.principalName}
                        </strong>
                        <span className="text-[10px] text-slate-500 block">
                          {language === 'ar' ? 'التصنيف الوظيفي: مدير معتمد ومخوّل من نظام البوابة' : 'Role: School Principal / Licensed System Representative'}
                        </span>
                      </div>
                    </div>

                    {/* School and document details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/70 border border-emerald-200/50 p-3.5 rounded-xl text-right">
                      <div className="space-y-0.5">
                        <span className="text-[9.5px] text-slate-400 font-bold block">{language === 'ar' ? 'المؤسسة التعليمية:' : 'School Organization:'}</span>
                        <span className="text-[11.5px] text-slate-800 font-extrabold flex items-center gap-1 justify-end">
                          <strong>{selectedVerifiable.schoolName}</strong>
                          <School className="w-3 h-3 text-emerald-700" />
                        </span>
                      </div>
                      <div className="space-y-0.5 text-right">
                        <span className="text-[9.5px] text-slate-400 font-bold block">{language === 'ar' ? 'المادة والتقييم:' : 'Subject & Assessment:'}</span>
                        <span className="text-[11.5px] text-slate-800 font-extrabold flex items-center gap-1 justify-end">
                          <strong>{selectedVerifiable.assessmentTitle || selectedVerifiable.subjectName}</strong>
                          <Layers className="w-3 h-3 text-emerald-700" />
                        </span>
                      </div>
                      <div className="space-y-0.5 text-right">
                        <span className="text-[9.5px] text-slate-400 font-bold block">{language === 'ar' ? 'تاريخ ووقت التوقيع بالبوابة:' : 'Timestamp of Authorization:'}</span>
                        <span className="text-[11.5px] text-slate-800 font-mono font-bold flex items-center gap-1 justify-end">
                          <span>{selectedVerifiable.signedAt ? new Date(selectedVerifiable.signedAt).toLocaleString() : new Date(selectedVerifiable.createdAt).toLocaleString()}</span>
                          <Calendar className="w-3 h-3 text-emerald-700" />
                        </span>
                      </div>
                      <div className="space-y-0.5 text-right">
                        <span className="text-[9.5px] text-slate-400 font-bold block">{language === 'ar' ? 'العام الدراسي والصف:' : 'Academic Session / Grade:'}</span>
                        <span className="text-[11.5px] text-slate-800 font-bold block">
                          {selectedVerifiable.academicYear} - {selectedVerifiable.grade}
                        </span>
                      </div>
                    </div>

                    {/* Stamping details */}
                    <div className="bg-emerald-500/5 p-3 rounded-xl border border-emerald-200/30 flex items-center justify-between gap-2">
                      <div className="text-right">
                        <span className="text-[9px] text-[#821315] font-black block">{language === 'ar' ? 'التحقق الأمني العماني:' : 'Omani Security Stamp:'}</span>
                        <p className="text-[10px] text-slate-600 font-semibold">{selectedVerifiable.signatureStampUrl || 'Stamping verified electronically'}</p>
                      </div>
                      <span className="p-1.5 bg-emerald-50 text-emerald-800 rounded-lg">
                        <FileCheck className="w-4 h-4 animate-pulse" />
                      </span>
                    </div>

                  </div>
                </div>
              ) : (
                // Code not matching/found alert
                <div className="bg-red-50/50 border border-red-200 p-5 rounded-2xl space-y-2 animate-in zoom-in-95 duration-150 text-right">
                  <div className="flex items-center gap-2 text-red-800 font-bold text-xs">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span>{language === 'ar' ? 'فشل التثبت: الرمز غير صحيح أو غير مسجل' : 'Invalid Signature Serial'}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed max-w-sm">
                    {language === 'ar' 
                      ? `لم يتم العثور على معاملة مطابقة للرمز "${searchSerial.trim().toUpperCase()}". يرجى التحقق من صياغة الحروف والأرقام ومحاولة المطابقة مجدداً.`
                      : `The signature ledger database produced no records matching "${searchSerial.trim()}". Check the formatting and repeat search.`}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Log list of Signed archives (col-span-12 or col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/50 p-5 shadow-sm space-y-4">
            <div className="space-y-1 text-right">
              <div className="flex items-center gap-1.5 justify-start">
                <span className="p-1 bg-amber-50 rounded-lg text-amber-700">
                  <Sparkles className="w-4 h-4 stroke-[1.5]" />
                </span>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base font-heading">
                  {language === 'ar' ? 'سجل المعاملات الموقعة المتاحة' : 'Signed Ledger Transactions'}
                </h3>
              </div>
              <p className="text-[11.5px] text-slate-400 font-sans leading-relaxed">
                {language === 'ar' 
                  ? 'قائمة بجميع استمارات التقييم المعتمدة حالياً بالرمز التسلسلي. انقر على أي معاملة لتعبئة الرمز التلقائي والتحقق فورا.' 
                  : 'A list of registered signed forms you can test check. Click any record to automatically inspect signature credentials.'}
              </p>
            </div>

            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {signedForms.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-slate-150 rounded-2xl text-slate-400 text-[11px] font-sans">
                  {language === 'ar' ? 'لا توجود استمارات موقّعة حالياً للأرشفة.' : 'No signed records reported in ledger logs yet.'}
                </div>
              ) : (
                signedForms.map((form, index) => {
                  const isSelected = selectedVerifiable?.id === form.id;
                  return (
                    <div
                      key={`signed-form-${form.id}-${index}`}
                      onClick={() => handleSelectFormDirectly(form)}
                      className={`p-3 border rounded-2xl text-right transition-all cursor-pointer space-y-2 relative hover:scale-[1.005] ${
                        isSelected 
                          ? 'border-[#821315] bg-[#821315]/5 shadow-xs' 
                          : 'border-slate-100 bg-slate-50/20 hover:border-slate-300 hover:bg-slate-55'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-amber-50 text-amber-800 font-mono tracking-wide">
                          {form.signatureQrData}
                        </span>
                        <div className="flex items-center gap-1 text-[9px] text-slate-400">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {form.signedAt ? form.signedAt.split('T')[0] : form.createdAt.split('T')[0]}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-0.5">
                        <h4 className="font-bold text-slate-800 text-[11px] truncate leading-tight font-heading">
                          {form.assessmentTitle || form.subjectName}
                        </h4>
                        <div className="text-[10px] text-slate-500 font-sans flex items-center gap-1 justify-end">
                          <strong className="text-slate-600 font-bold">{form.schoolName}</strong>
                          <span className="text-slate-400">|</span>
                          <span>{language === 'ar' ? 'المدير المعمد: أ. ' : 'Principal: '}</span>
                          <span className="text-[#84191b] font-bold">{form.signedByPrincipalName || form.principalName}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
