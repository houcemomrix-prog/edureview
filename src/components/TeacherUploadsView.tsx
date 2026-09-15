import React, { useState, useRef } from 'react';
import { 
  FileUp, 
  GraduationCap, 
  FileText, 
  ShieldAlert, 
  CheckCircle, 
  Download, 
  Trash2, 
  Sparkles,
  FileCheck2,
  LockKeyhole,
  Plus,
  X
} from 'lucide-react';
import { UserProfile, Assessment } from '../types';
import { Language, translateGrade, translateSubject } from '../lib/translations';

interface TeacherUploadsViewProps {
  userProfile: UserProfile;
  language: Language;
  onUploadAssessment: (payload: {
    title: string;
    type: 'test' | 'quiz' | string;
    grade: string;
    subject: string;
    description: string;
    questions: string;
    keyAnswer: string;
    isPdf?: boolean;
    pdfName?: string;
    pdfSize?: string;
    pdfData?: string;
  }) => Promise<void>;
  actionLoading: boolean;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
  previousAssessments?: Assessment[];
}

const GRADES = [
  'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 
  'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 
  'Grade 11', 'Grade 12'
];

const SUBJECTS = [
  'Arabic Language', 'English Language', 'Mathematics', 
  'Science', 'Physics', 'Chemistry', 'Biology', 
  'Islamic Studies', 'Social Studies', 'Information Technology',
  'Applied Sciences', 'Individual Skills'
];

interface UploadSlot {
  id: string;
  pdfFile: File | null;
  base64: string;
  title: string;
  docType: string;
  description: string;
  isDragOver: boolean;
  uploaded: boolean;
}

export function TeacherUploadsView({
  userProfile,
  language,
  onUploadAssessment,
  actionLoading,
  onSuccess,
  onError,
  previousAssessments = []
}: TeacherUploadsViewProps) {
  const isSubjectTeacher = userProfile.roleType === 'teacher' || (userProfile.role === 'school' && !!userProfile.subject);
  const teacherSubject = userProfile.subject || '';

  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>(
    teacherSubject || userProfile.subject || SUBJECTS[2]
  );

  React.useEffect(() => {
    if (isSubjectTeacher && teacherSubject) {
      setSelectedSubject(teacherSubject);
    }
  }, [isSubjectTeacher, teacherSubject]);
  
  // Dynamic list of file upload slots
  const [slots, setSlots] = useState<UploadSlot[]>([
    {
      id: 'slot-initial-1',
      pdfFile: null,
      base64: '',
      title: '',
      docType: '',
      description: '',
      isDragOver: false,
      uploaded: false
    }
  ]);

  // Track loader per slot upload
  const [loadingSlotId, setLoadingSlotId] = useState<string | null>(null);

  // Helper to format bytes
  const formatBytes = (bytes: number, decimals = 1) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const addUploadSlot = () => {
    const newId = `slot-${Date.now()}`;
    setSlots(prev => [
      ...prev,
      {
        id: newId,
        pdfFile: null,
        base64: '',
        title: '',
        docType: '',
        description: '',
        isDragOver: false,
        uploaded: false
      }
    ]);
    onSuccess(
      language === 'ar' 
        ? 'تم إدراج منشئ رفع ملف جديد أدناه.' 
        : 'New file upload slot added below.'
    );
  };

  const removeUploadSlot = (slotId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (slots.length === 1) {
      // Just reset the single slot
      setSlots([
        {
          id: `slot-${Date.now()}`,
          pdfFile: null,
          base64: '',
          title: '',
          docType: 'test',
          description: '',
          isDragOver: false,
          uploaded: false
        }
      ]);
      return;
    }
    setSlots(prev => prev.filter(s => s.id !== slotId));
  };

  const handleSlotFileChange = (slotId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    processFileForSlot(slotId, file);
  };

  const processFileForSlot = (slotId: string, file: File | undefined) => {
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      const errorMsg = language === 'ar' 
        ? 'خطأ: الملف يجب أن يكون بصيغة PDF فقط.' 
        : 'Error: Only PDF documents are allowed.';
      onError(errorMsg);
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      const errorMsg = language === 'ar'
        ? 'خطأ: حجم الملف يتجاوز 20 ميجابايت.'
        : 'Error: File size exceeds 20MB limit.';
      onError(errorMsg);
      return;
    }

    const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");

    const reader = new FileReader();
    reader.onloadend = () => {
      setSlots(prev => prev.map(s => s.id === slotId ? {
        ...s,
        pdfFile: file,
        base64: reader.result as string,
        title: cleanName
      } : s));
    };
    reader.onerror = () => {
      onError(language === 'ar' ? 'فشل قراءة الملف الرقمي.' : 'Failed to read file.');
    };
    reader.readAsDataURL(file);
  };

  const handleSlotDragOver = (slotId: string, e: React.DragEvent) => {
    e.preventDefault();
    if (selectedGrade) {
      setSlots(prev => prev.map(s => s.id === slotId ? { ...s, isDragOver: true } : s));
    }
  };

  const handleSlotDragLeave = (slotId: string) => {
    setSlots(prev => prev.map(s => s.id === slotId ? { ...s, isDragOver: false } : s));
  };

  const handleSlotDrop = (slotId: string, e: React.DragEvent) => {
    e.preventDefault();
    setSlots(prev => prev.map(s => s.id === slotId ? { ...s, isDragOver: false } : s));
    if (!selectedGrade) return;
    const file = e.dataTransfer.files?.[0];
    processFileForSlot(slotId, file);
  };

  const triggerFileBrowser = (slotId: string) => {
    if (!selectedGrade) {
      onError(language === 'ar' ? 'يرجى اختيار الصف الدراسي أولاً لفتح الرفع.' : 'Please select grade level first to unlock file uploads.');
      return;
    }
    document.getElementById(`file-input-${slotId}`)?.click();
  };

  const removeFileFromSlot = (slotId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSlots(prev => prev.map(s => s.id === slotId ? {
      ...s,
      pdfFile: null,
      base64: '',
      title: '',
      uploaded: false
    } : s));
    const inputEl = document.getElementById(`file-input-${slotId}`) as HTMLInputElement;
    if (inputEl) inputEl.value = '';
  };

  const handleUploadSlot = async (slotId: string) => {
    if (!selectedGrade) {
      onError(language === 'ar' ? 'يرجى اختيار الصف الدراسي.' : 'Please choose a grade level.');
      return;
    }

    const slot = slots.find(s => s.id === slotId);
    if (!slot || !slot.pdfFile) {
      onError(language === 'ar' ? 'يرجى إرفاق ملف أولاً.' : 'Please select an assessment file first.');
      return;
    }

    if (!slot.title.trim()) {
      onError(language === 'ar' ? 'يرجى كتابة عنوان الوثيقة.' : 'Document Title is required.');
      return;
    }

    if (!slot.docType || !slot.docType.trim()) {
      onError(
        language === 'ar' 
          ? 'يرجى كتابة وتحديد صيغة ونمط التقييم الأكاديمي (معلومة مطلوبة وإلزامية وليست اختيارية).' 
          : 'Academic assessment format/style is required and cannot be left blank.'
      );
      return;
    }

    setLoadingSlotId(slotId);
    try {
      const finalSubject = (isSubjectTeacher && teacherSubject) ? teacherSubject : selectedSubject;
      const payload = {
        title: slot.title.trim(),
        type: slot.docType.trim(),
        grade: selectedGrade,
        subject: finalSubject,
        description: slot.description.trim() || (language === 'ar' ? 'ملف تقييم مستمر مرفوع مسبقاً.' : 'Continuous assessment PDF uploaded by teacher.'),
        questions: language === 'ar' 
          ? `[ملف PDF مرفق]\nاسم الملف: ${slot.pdfFile.name}\nتم الرفع كملف PDF تفاعلي.`
          : `[Associated PDF Document]\nFilename: ${slot.pdfFile.name}\nUploaded as an interactive PDF module.`,
        keyAnswer: language === 'ar'
          ? `[ملف PDF مرفق]\nيرجى تنزيل الملف لمراجعة نموذج توزيع الدرجات المضمن.`
          : `[Associated PDF Document]\nPlease download to review embedded marking scheme guidelines.`,
        isPdf: true,
        pdfName: slot.pdfFile.name,
        pdfSize: formatBytes(slot.pdfFile.size),
        pdfData: slot.base64
      };

      await onUploadAssessment(payload);

      setSlots(prev => prev.map(s => s.id === slotId ? { ...s, uploaded: true } : s));
      onSuccess(
        language === 'ar' 
          ? `تم رفع ملف "${slot.title}" بنجاح للوزارة!` 
          : `Document "${slot.title}" successfully uploaded and registered!`
      );
    } catch (err: any) {
      onError(err.message || 'Failed to submit file to the portal.');
    } finally {
      setLoadingSlotId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 border border-slate-200 shadow-md space-y-4 sm:space-y-6" id="teacher-upload-hub">
      
      {/* Header section with badge */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 sm:pb-4">
        <div className="flex items-center gap-2.5 sm:gap-3 rtl:flex-row-reverse">
          <div className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-emerald-600/10 text-emerald-700 shrink-0">
            <FileUp className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="text-right rtl:text-right ltr:text-left">
            <span className="text-[9px] sm:text-[10px] bg-slate-100 text-slate-800 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
              {language === 'ar' ? 'بوابة المعلم المعتمدة' : 'Accredited Teacher Gateway'}
            </span>
            <h3 className="font-extrabold font-heading text-[#051C3F] text-sm sm:text-lg mt-0.5 sm:mt-1">
              {language === 'ar' ? 'بوابة رفع مستندات وتقييمات المادة' : 'Teacher Exam & Lesson Document Portal'}
            </h3>
          </div>
        </div>
        <div className="text-right text-[11px] text-slate-400 font-mono hidden sm:block">
          {new Date().toLocaleDateString(language === 'ar' ? 'ar-OM' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* STEP 1: Grade Selection */}
      <div className="space-y-2 bg-[#FAF9F5] p-4 rounded-2xl border border-slate-250/20">
        <label className="text-xs font-black text-[#051C3F] flex items-center gap-2 rtl:flex-row-reverse">
          <GraduationCap className="w-4 h-4 text-emerald-600" />
          <span>{language === 'ar' ? 'الخطوة الأولى: اختر الصف الدراسي المستهدف' : 'Step 1: Choose Target Student Grade Level'}</span>
        </label>
        <p className="text-[11px] text-slate-400 leading-snug rtl:text-right ltr:text-left">
          {language === 'ar' 
            ? 'يرجى اختيار الصف الدراسي لتفعيل بوابات المعالجة ورفع ملفات الـ PDF اختصاصك.' 
            : 'Select the grade level to unlock processing portals and initiate PDF document uploads.'}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
          <div>
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block font-sans mb-1 rtl:text-right ltr:text-left">
              {language === 'ar' ? 'الصف الدراسي المستهدف' : 'Target Grade Level'}
            </label>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-xs font-extrabold text-[#051C3F] focus:outline-none focus:border-emerald-600 bg-white cursor-pointer shadow-xs"
            >
              <option key="upload-grade-default" value="">
                {language === 'ar' ? '-- اختر الصف الدراسي للمادة --' : '-- Choose Grade Level --'}
              </option>
              {GRADES.map((g, index) => (
                <option key={`upload-grade-${g}-${index}`} value={g}>
                  {translateGrade(g, language)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block font-sans rtl:text-right ltr:text-left">
                {language === 'ar' ? 'المادة الدراسية' : 'Curriculum Subject'}
              </label>
              {isSubjectTeacher && teacherSubject && (
                <span className="text-[9.5px] font-extrabold text-amber-700 bg-amber-100/90 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                  <LockKeyhole className="w-3 h-3 text-amber-600 shrink-0" />
                  <span>{language === 'ar' ? 'مادة المعلم المعتمدة' : 'Assigned Specialty'}</span>
                </span>
              )}
            </div>

            <div className="relative">
              <select
                value={isSubjectTeacher && teacherSubject ? teacherSubject : selectedSubject}
                disabled={isSubjectTeacher && !!teacherSubject}
                onChange={(e) => {
                  if (!isSubjectTeacher || !teacherSubject) {
                    setSelectedSubject(e.target.value);
                  }
                }}
                className={`w-full px-4 py-3 border rounded-xl text-xs font-extrabold shadow-xs transition-all ${
                  isSubjectTeacher && teacherSubject
                    ? 'bg-slate-100/90 border-slate-300 text-slate-700 cursor-not-allowed opacity-95'
                    : 'bg-white border-slate-200 text-[#051C3F] focus:outline-none focus:border-emerald-600 cursor-pointer'
                }`}
              >
                {isSubjectTeacher && teacherSubject ? (
                  <option key={`upload-teacher-subj-${teacherSubject}`} value={teacherSubject}>
                    {translateSubject(teacherSubject, language)}
                  </option>
                ) : (
                  SUBJECTS.map((s, index) => (
                    <option key={`upload-subj-${s}-${index}`} value={s}>
                      {translateSubject(s, language)}
                    </option>
                  ))
                )}
              </select>
            </div>

            {isSubjectTeacher && teacherSubject && (
              <p className="text-[10.5px] text-amber-800 font-semibold rtl:text-right ltr:text-left flex items-center gap-1.5 mt-1.5 px-0.5">
                <span className="shrink-0">🔒</span>
                <span>
                  {language === 'ar'
                    ? `المادة مقيدة بتخصصك الأكاديمي (${translateSubject(teacherSubject, language)})، ولا يمكن رفع ملفات لمادة أخرى.`
                    : `Subject is locked to your academic specialty (${translateSubject(teacherSubject, language)}) - you cannot upload for other subjects.`}
                </span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* STEP 2: Multi File Upload Workspace */}
      <div className={`space-y-6 transition-all duration-300 ${selectedGrade ? 'opacity-100 pointer-events-auto' : 'opacity-[0.45] pointer-events-none select-none relative'}`}>
        
        {/* Locked Overlay if Grade is Empty */}
        {!selectedGrade && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-transparent z-15 backdrop-brightness-95/10 rounded-2xl p-4 text-center">
            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-700 shadow-md mb-2">
              <LockKeyhole className="w-5 h-5 animate-bounce" />
            </div>
            <p className="text-xs font-black text-[#051C3F] bg-white px-4 py-1.5 rounded-full shadow-md border border-slate-100">
              {language === 'ar' ? 'يرجى اختيار الصف الدراسي أولاً لتفعيل الرفع والتدقيق' : 'Select a Grade above to Unlock Portals'}
            </p>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-[#051C3F] block">
              {language === 'ar' ? 'الخطوة الثانية: ملفات الـ PDF المراد رفعها' : 'Step 2: PDF Continuous Evaluation Documents'}
            </span>
          </div>

          {/* List of Dynamic Upload Slots */}
          <div className="space-y-5">
            {slots.map((slot, index) => {
              const isSlotLoading = loadingSlotId === slot.id;
              
              return (
                <div 
                  key={`teacher-slot-${slot.id}-${index}`} 
                  className={`p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border transition-all space-y-3 sm:space-y-4 relative ${
                    slot.uploaded 
                      ? 'border-emerald-600 bg-emerald-500/5' 
                      : 'border-slate-200 bg-slate-50/20 hover:bg-slate-50/55'
                  }`}
                >
                  {/* Slot header layout */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 rtl:flex-row-reverse">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                      {language === 'ar' ? `وحدة الملف رقم #${index + 1}` : `Document File Slot #${index + 1}`}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => removeUploadSlot(slot.id, e)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title={language === 'ar' ? 'حذف الوحدة الإنشائية' : 'Remove this upload module'}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Standard file input trigger button (visible if no file selected yet) */}
                  {!slot.pdfFile ? (
                    <div
                      onDragOver={(e) => handleSlotDragOver(slot.id, e)}
                      onDragLeave={() => handleSlotDragLeave(slot.id)}
                      onDrop={(e) => handleSlotDrop(slot.id, e)}
                      onClick={() => triggerFileBrowser(slot.id)}
                      className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                        slot.isDragOver 
                          ? 'border-emerald-600 bg-emerald-500/5 scale-[1.01]' 
                          : 'border-slate-300 hover:border-emerald-500 bg-white hover:bg-slate-50/50'
                      }`}
                    >
                      <input 
                        type="file" 
                        id={`file-input-${slot.id}`}
                        className="hidden" 
                        accept=".pdf" 
                        onChange={(e) => handleSlotFileChange(slot.id, e)} 
                      />
                      <div className="space-y-2.5">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mx-auto text-slate-500 shadow-2xs">
                          <FileUp className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-slate-800">
                            {language === 'ar' ? 'انقر هنا لتصفح أو اسحب ملف الـ PDF' : 'Click to Upload / Browse PDF File'}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {language === 'ar' ? 'الحد الأقصى للمرفق 20 ميجابايت' : 'Maximum file size allowed is 20MB'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Attached file detail parameters Form */
                    <div className="space-y-4 animate-in fade-in duration-200">
                      
                      <input 
                        type="file" 
                        id={`file-input-${slot.id}`}
                        className="hidden" 
                        accept=".pdf" 
                        onChange={(e) => handleSlotFileChange(slot.id, e)} 
                      />

                      {/* File badge block */}
                      <div className="flex items-center justify-between bg-white border border-slate-205 rounded-xl p-3 shadow-2xs rtl:flex-row-reverse">
                        <div className="flex items-center gap-3 rtl:flex-row-reverse">
                          <div className="p-2.5 bg-[#FFFCE8] border border-amber-200 text-amber-600 rounded-lg">
                            <FileCheck2 className="w-5 h-5 text-emerald-600 animate-pulse" />
                          </div>
                          <div className="text-right rtl:text-right ltr:text-left space-y-0.5">
                            <p className="text-xs font-black text-slate-850 truncate max-w-[200px] sm:max-w-md">{slot.pdfFile.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono font-bold">{formatBytes(slot.pdfFile.size)}</p>
                          </div>
                        </div>

                        {!slot.uploaded && (
                          <button
                            type="button"
                            onClick={(e) => removeFileFromSlot(slot.id, e)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title={language === 'ar' ? 'تغيير الملف وإزالته' : 'Change or remove file'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Slot fields */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="space-y-1">
                          <label className="text-[9.5px] font-black text-slate-450 uppercase block">
                            {language === 'ar' ? 'عنوان أو اسم ملف التقييم الموفر' : 'Assessment Blueprint Title'}
                          </label>
                          <input
                            type="text"
                            required
                            disabled={slot.uploaded || isSlotLoading}
                            value={slot.title}
                            onChange={(e) => {
                              const val = e.target.value;
                              setSlots(prev => prev.map(s => s.id === slot.id ? { ...s, title: val } : s));
                            }}
                            placeholder={language === 'ar' ? 'مثال: فيزياء اختبار فصلي' : 'e.g. Physics Classroom quiz'}
                            className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 font-bold bg-white focus:outline-none focus:border-emerald-600 disabled:opacity-60"
                          />
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <label className="text-[9.5px] font-black text-slate-700 uppercase flex items-center gap-1">
                              <span>{language === 'ar' ? 'صيغة ونمط التقييم الأكاديمي' : 'Curriculum Assessment Type & Format'}</span>
                              <span className="text-rose-500 font-black text-xs">*</span>
                            </label>
                            <span className="text-[9px] font-extrabold text-rose-600 bg-rose-50 border border-rose-200/80 px-1.5 py-0.5 rounded">
                              {language === 'ar' ? 'مطلوب إلزامي' : 'Required'}
                            </span>
                          </div>
                          <input
                            type="text"
                            required
                            disabled={slot.uploaded || isSlotLoading}
                            value={slot.docType}
                            onChange={(e) => {
                              const val = e.target.value;
                              setSlots(prev => prev.map(s => s.id === slot.id ? { ...s, docType: val } : s));
                            }}
                            placeholder={
                              language === 'ar' 
                                ? 'اكتب صيغة التقييم هنا (مثال: اختبار قصير 1 / امتحان فصلي / واجب منزلي...)' 
                                : 'Type format here (e.g. Quiz 1, Midterm Exam, Portfolio Project...)'
                            }
                            className={`w-full px-3.5 py-2 border rounded-xl text-xs font-bold bg-white focus:outline-none focus:border-emerald-600 disabled:opacity-60 transition-colors ${
                              !slot.docType.trim() ? 'border-amber-300 text-slate-800' : 'border-slate-200 text-slate-800'
                            }`}
                          />
                          {/* Quick suggestion buttons to speed up input while keeping it completely free-form */}
                          <div className="flex flex-wrap items-center gap-1 pt-1">
                            <span className="text-[9px] text-slate-400 font-medium">
                              {language === 'ar' ? 'اقتراحات سريعة:' : 'Quick suggestions:'}
                            </span>
                            {(language === 'ar' 
                              ? ['اختبار قصير أول', 'اختبار قصير ثانٍ', 'امتحان فصلي موحد', 'واجب منزلي', 'مشروع تقييمي', 'ورقة عمل إثرائية']
                              : ['Quiz 1', 'Quiz 2', 'Unified Exam', 'Homework Task', 'Project Assessment', 'Worksheet']
                            ).map((suggestion, sIdx) => (
                              <button
                                key={`slot-${slot.id}-sug-${suggestion}-${sIdx}`}
                                type="button"
                                disabled={slot.uploaded || isSlotLoading}
                                onClick={() => {
                                  setSlots(prev => prev.map(s => s.id === slot.id ? { ...s, docType: suggestion } : s));
                                }}
                                className={`text-[9px] px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                                  slot.docType === suggestion
                                    ? 'bg-emerald-100 border-emerald-300 text-emerald-800 font-black shadow-2xs'
                                    : 'bg-slate-50 border-slate-200/80 text-slate-600 hover:bg-slate-100 hover:text-slate-800 font-semibold'
                                }`}
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9.5px] font-black text-slate-450 uppercase block">
                          {language === 'ar' ? 'ملاحظات المعلم أو توجيهات المناهج المستهدفة' : 'Teaching Notes & Reference units'}
                        </label>
                        <input
                          type="text"
                          disabled={slot.uploaded || isSlotLoading}
                          value={slot.description}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSlots(prev => prev.map(s => s.id === slot.id ? { ...s, description: val } : s));
                          }}
                          placeholder={language === 'ar' ? 'اكتب الفصل الدراسي، رموز الوحدات ومخرجات الأهداف...' : 'Indicate unit target objectives, textbooks chapters...'}
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 bg-white focus:outline-none focus:border-emerald-600 disabled:opacity-60"
                        />
                      </div>

                      {/* Complete upload submission inside the slot block */}
                      <div className="flex justify-end pt-1.5 border-t border-slate-100">
                        {slot.uploaded ? (
                          <div className="flex items-center gap-1.5 text-xs font-black text-emerald-600 bg-emerald-500/10 px-4 py-1.5 rounded-xl">
                            <CheckCircle className="w-4 h-4" />
                            <span>{language === 'ar' ? 'تم الرفع والتسجيل بنجاح للوزارة' : 'Uploaded successfully to MOE'}</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            disabled={isSlotLoading}
                            onClick={() => handleUploadSlot(slot.id)}
                            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm shadow-emerald-500/10 transition-all hover:scale-[1.01]"
                          >
                            {isSlotLoading ? (
                              <>
                                <div className="w-3.5 h-3.5 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
                                <span>{language === 'ar' ? 'جاري الفحص والرفع...' : 'Processing upload...'}</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                                <span>{language === 'ar' ? 'رفع وتأكيد هذا المستند' : 'Confirm & Upload This File'}</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>

                    </div>
                  )}

                </div>
              );
            })}
          </div>

          {/* ADD NEW FILE BUTTON (Spawns a new file upload area) */}
          <div className="flex justify-center pt-2.5">
            <button
              type="button"
              onClick={addUploadSlot}
              className="px-5 py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-750 font-black text-xs rounded-2xl flex items-center gap-2 transition-all border border-indigo-200/50 cursor-pointer shadow-2xs hover:scale-[1.005]"
              id="add-upload-slot-btn"
            >
              <Plus className="w-4 h-4 text-indigo-705" />
              <span>{language === 'ar' ? '+ أضف ملفاً جديداً' : '+ Add new file'}</span>
            </button>
          </div>

        </div>

      </div>

      {/* Security alert footnote */}
      <div className="flex items-start gap-2.5 bg-indigo-900/5 border border-indigo-750/10 rounded-2xl p-4 text-[#051C3F] rtl:flex-row-reverse">
        <ShieldAlert className="w-5 h-5 text-[#051C3F] shrink-0 mt-0.5" />
        <div className="space-y-0.5 text-right rtl:text-right ltr:text-left text-[11px] leading-relaxed font-sans">
          <p className="font-extrabold text-slate-900">
            {language === 'ar' ? 'تنبيه أمن وتدقيق المستندات الوطني' : 'National Document Verification & Safety Warning'}
          </p>
          <p className="text-slate-500">
            {language === 'ar'
              ? 'إن جميع ملفات الـ PDF التي يتم رفعها تخضع فوراً للفحص والتدقيق الآلي لمطابقة مخرجات المنهج المعتمد قبل تحويلها لموظفي المتابعة الإشرافية بالوزارة.'
              : 'All teacher-uploaded PDF continuous evaluation portfolios are immediately parsed and validated against State syllabi benchmarks before submission.'}
          </p>
        </div>
      </div>

      {/* SECTION: Previously Uploaded Files */}
      {previousAssessments && previousAssessments.length > 0 && (
        <div className="pt-6 border-t border-slate-100 space-y-4">
          <div className="flex items-center gap-2 rtl:flex-row-reverse text-[#051C3F]">
            <FileText className="w-5 h-5 text-indigo-600" />
            <h4 className="font-extrabold font-heading text-sm uppercase tracking-wide">
              {language === 'ar' ? 'سجل ملفاتي المرفوعة سابقاً' : 'My Previously Uploaded Files'}
            </h4>
            <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-bold">
              {previousAssessments.length}
            </span>
          </div>

          <div className="overflow-hidden border border-slate-200/80 rounded-2xl bg-white shadow-2xs">
            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-collapse" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4 text-center">{language === 'ar' ? 'نوع الملف' : 'Type'}</th>
                    <th className="py-3 px-4">{language === 'ar' ? 'اسم العنوان' : 'Assessment Title'}</th>
                    <th className="py-3 px-4">{language === 'ar' ? 'الصف والمادة' : 'Grade & Subject'}</th>
                    <th className="py-3 px-4">{language === 'ar' ? 'تاريخ الرفع' : 'Uploaded Date'}</th>
                    <th className="py-3 px-4 text-center">{language === 'ar' ? 'حالة التدقيق' : 'Moderation Status'}</th>
                    <th className="py-3 px-4 text-center">{language === 'ar' ? 'الإجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {previousAssessments.map((item, idx) => {
                    // Status Badge colors
                    let statusBg = 'bg-amber-50 text-amber-800 border-amber-200/50';
                    let statusDot = 'bg-amber-550';
                    if (item.status === 'Approved') {
                      statusBg = 'bg-emerald-50 text-emerald-800 border-emerald-200/50';
                      statusDot = 'bg-emerald-500';
                    } else if (item.status === 'Revision Request') {
                      statusBg = 'bg-rose-50 text-rose-800 border-rose-200/50';
                      statusDot = 'bg-rose-500';
                    } else if (item.status === 'In Progress') {
                      statusBg = 'bg-blue-50 text-blue-800 border-blue-200/50';
                      statusDot = 'bg-blue-500';
                    }

                    return (
                      <tr key={`prev-upload-${item.id || idx}-${idx}`} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-lg text-[9.5px] font-black bg-indigo-50 text-indigo-750 border border-indigo-100/80">
                            {item.type === 'test' 
                              ? (language === 'ar' ? 'امتحان فصلي' : 'Exam') 
                              : item.type === 'quiz' 
                              ? (language === 'ar' ? 'اختبار قصير' : 'Quiz') 
                              : item.type}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-extrabold text-slate-800">
                          {item.title}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                          <div className="space-y-1">
                            <span className="block font-medium">
                              {translateSubject(item.subject, language)} • {translateGrade(item.grade, language)}
                            </span>
                            {item.grade === 'Grade 12' ? (
                              <span className="inline-block px-1.5 py-0.5 rounded bg-indigo-50 border border-indigo-100 text-[#3c1e7a] text-[8.5px] font-black leading-none">
                                {language === 'ar' ? 'فحص وتدقيق نهائي (الصف 12)' : 'Final Audit (Grade 12)'}
                              </span>
                            ) : (
                              <span className="inline-block px-1.5 py-0.5 rounded bg-teal-50 border border-teal-100 text-[#0f5445] text-[8.5px] font-black leading-none">
                                {language === 'ar' ? 'فحص وتدقيق مستمر (الصفوف 1-11)' : 'Continuous Audit (Grades 1-11)'}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 font-mono text-[10.5px] whitespace-nowrap">
                          {new Date(item.createdAt).toLocaleDateString(language === 'ar' ? 'ar-OM' : 'en-US')}
                        </td>
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider ${statusBg}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`}></span>
                            {language === 'ar' 
                              ? (item.status === 'Approved' ? 'معتمد' : item.status === 'Revision Request' ? 'مطلوب مراجعة' : item.status === 'In Progress' ? 'قيد المراجعة' : 'قيد الانتظار')
                              : item.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          {item.pdfData && (
                            <button
                              type="button"
                              onClick={() => {
                                if (item.pdfData!.startsWith('data:')) {
                                  const link = document.createElement('a');
                                  link.href = item.pdfData!;
                                  link.download = item.pdfName || `${item.title}.pdf`;
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                } else {
                                  window.open(item.pdfData, '_blank', 'noopener,noreferrer');
                                }
                              }}
                              className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-250/60 rounded-xl text-[10px] font-extrabold transition-all cursor-pointer inline-flex items-center gap-1 justify-center mx-auto hover:scale-[1.01]"
                            >
                              <Download className="w-3 h-3 text-emerald-600" />
                              <span>{language === 'ar' ? 'تنزيل' : 'Download'}</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View (Optimized for phones) */}
            <div className="block sm:hidden divide-y divide-slate-100 p-2" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              {previousAssessments.map((item, idx) => {
                let statusBg = 'bg-amber-50 text-amber-800 border-amber-200/50';
                let statusDot = 'bg-amber-550';
                if (item.status === 'Approved') {
                  statusBg = 'bg-emerald-50 text-emerald-800 border-emerald-200/50';
                  statusDot = 'bg-emerald-500';
                } else if (item.status === 'Revision Request') {
                  statusBg = 'bg-rose-50 text-rose-800 border-rose-200/50';
                  statusDot = 'bg-rose-500';
                } else if (item.status === 'In Progress') {
                  statusBg = 'bg-blue-50 text-blue-800 border-blue-200/50';
                  statusDot = 'bg-blue-500';
                }

                return (
                  <div key={`prev-mobile-card-${item.id || idx}-${idx}`} className="p-3 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-black bg-indigo-50 text-indigo-750 border border-indigo-100/80">
                        {item.type === 'test' 
                          ? (language === 'ar' ? 'امتحان فصلي' : 'Exam') 
                          : item.type === 'quiz' 
                          ? (language === 'ar' ? 'اختبار قصير' : 'Quiz') 
                          : item.type}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-black border uppercase tracking-wider ${statusBg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`}></span>
                        {language === 'ar' 
                          ? (item.status === 'Approved' ? 'معتمد' : item.status === 'Revision Request' ? 'مطلوب مراجعة' : item.status === 'In Progress' ? 'قيد المراجعة' : 'قيد الانتظار')
                          : item.status}
                      </span>
                    </div>

                    <div>
                      <h5 className="font-extrabold text-xs text-slate-900 leading-snug">
                        {item.title}
                      </h5>
                      <p className="text-[10.5px] text-slate-500 mt-0.5">
                        {translateSubject(item.subject, language)} • {translateGrade(item.grade, language)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100/80">
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(item.createdAt).toLocaleDateString(language === 'ar' ? 'ar-OM' : 'en-US')}
                      </span>
                      {item.pdfData && (
                        <button
                          type="button"
                          onClick={() => {
                            if (item.pdfData!.startsWith('data:')) {
                              const link = document.createElement('a');
                              link.href = item.pdfData!;
                              link.download = item.pdfName || `${item.title}.pdf`;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            } else {
                              window.open(item.pdfData, '_blank', 'noopener,noreferrer');
                            }
                          }}
                          className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-250/60 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer inline-flex items-center gap-1"
                        >
                          <Download className="w-3 h-3 text-emerald-600" />
                          <span>{language === 'ar' ? 'تنزيل PDF' : 'Download PDF'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
