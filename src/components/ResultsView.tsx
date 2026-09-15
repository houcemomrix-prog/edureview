import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Send, 
  School, 
  Trash2, 
  Clock, 
  Calendar, 
  Paperclip, 
  BookOpen, 
  Download,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  FileDown,
  UploadCloud
} from 'lucide-react';
import { Assessment, UserProfile, SchoolReport, SchoolDoc } from '../types';
import { Language } from '../lib/translations';
import { 
  getSchoolReports, 
  createSchoolReport, 
  deleteSchoolReport, 
  getAllUserProfiles,
  getSchoolsList,
  markSchoolReportAsRead
} from '../services/db';

interface ResultsViewProps {
  assessments: Assessment[];
  language: Language;
  userProfile: UserProfile | null;
}

// Utility to format sizes beautifully
function formatBytes(bytes?: number): string {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const dm = 1;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function ResultsView({ assessments, language, userProfile }: ResultsViewProps) {
  const isRtl = language === 'ar';
  const displayRole = userProfile?.role || 'school';

  // State Management
  const [reports, setReports] = useState<SchoolReport[]>([]);
  const [schools, setSchools] = useState<SchoolDoc[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Custom Form State
  const [targetSchoolId, setTargetSchoolId] = useState('');
  const [selectedSemester, setSelectedSemester] = useState<'first' | 'second'>('first');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfBase64, setPdfBase64] = useState<string>('');
  
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Drag & drop state
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Selected Report Modal / Detail View
  const [selectedReport, setSelectedReport] = useState<SchoolReport | null>(null);
  
  // Successful feedback state
  const [justSent, setJustSent] = useState(false);

  // Handle opening / reading the report by principal
  const handleViewReport = async (rep: SchoolReport) => {
    setSelectedReport(rep);
    
    if (userProfile?.role === 'school' && !rep.isRead) {
      try {
        await markSchoolReportAsRead(rep.id!, userProfile.name || 'مدير المدرسة');
        
        // Update state locally
        setReports(prev => prev.map(r => r.id === rep.id ? { ...r, isRead: true, readAt: new Date().toISOString(), readBy: userProfile.name || 'مدير المدرسة' } : r));
        
        // Update selected Report inside modal state so it's fresh
        setSelectedReport(prev => prev && prev.id === rep.id ? { ...prev, isRead: true, readAt: new Date().toISOString(), readBy: userProfile.name || 'مدير المدرسة' } : prev);
      } catch (err) {
        console.error('Failed to mark school report as read:', err);
      }
    }
  };

  // Load Initial Data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Load the reports filtered by backend securely
        const fetchedReports = await getSchoolReports(userProfile);
        setReports(fetchedReports);

        // If admin, load the schools list to specify target school in dropdown
        if (userProfile?.role === 'admin') {
          const actualSchools = await getSchoolsList();
          setSchools(actualSchools);
        }
      } catch (err) {
        console.error('Error loading reports data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [userProfile]);

  // Handle local PDF import & base64 encoding
  const handlePdfFileSelection = (file: File) => {
    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      setErrorMsg(isRtl ? '⚠️ عذراً، يجب إرفاق مستند بصيغة PDF فقط.' : '⚠️ Sorry, you must attach a PDF document only.');
      setPdfFile(null);
      setPdfBase64('');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setErrorMsg(isRtl ? '⚠️ خطأ: حجم التقرير يتجاوز الحد المسموح به (20 ميجابايت).' : '⚠️ Error: File size exceeds the 20MB limit.');
      setPdfFile(null);
      setPdfBase64('');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPdfBase64(reader.result as string);
      setPdfFile(file);
      setErrorMsg('');
    };
    reader.onerror = () => {
      setErrorMsg(isRtl ? '⚠️ فشل في معالجة وقراءة ملف التقرير.' : '⚠️ Failed to parse the PDF file.');
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handlePdfFileSelection(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handlePdfFileSelection(file);
  };

  // Handle Dispatch/Create Report
  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile || userProfile.role !== 'admin') return;

    if (!targetSchoolId) {
      setErrorMsg(isRtl ? '⚠️ الرجاء اختيار المدرسة المستهدفة أولاً' : '⚠️ Please select a target school');
      return;
    }
    if (!pdfBase64) {
      setErrorMsg(isRtl ? '⚠️ الرجاء إرفاق ملف التقرير كـ PDF' : '⚠️ Please attach the report PDF file');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');
      setSuccessMsg('');

      // Find selected school name
      const targetSchool = schools.find(s => s.id === targetSchoolId);
      const schoolName = targetSchool ? targetSchool.nameAr : 'مدرسة غير معروفة';

      const semesterLabel = selectedSemester === 'first'
        ? (isRtl ? 'الفصل الدراسي الأول' : 'First Semester')
        : (isRtl ? 'الفصل الدراسي الثاني' : 'Second Semester');

      const dateStr = new Date().toLocaleDateString(isRtl ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long' });
      
      const titleAr = `تقرير الجودة والمطابقة - ${semesterLabel} - ${dateStr}`;
      const titleEn = `Evaluation & Compliance Report - ${semesterLabel} - ${dateStr}`;

      await createSchoolReport({
        titleAr,
        titleEn,
        schoolId: targetSchoolId,
        schoolName,
        semester: selectedSemester,
        content: isRtl 
          ? `تقرير زيارة تدقيق الجودة والمطابقة لـ ${semesterLabel}. يرجى تعقب التوصيات والتدابير التصحيحية المرفقة.`
          : `Quality assurance and curricular compliance monitoring report for ${semesterLabel}. Please follow the corrective directives enclosed.`,
        pdfData: pdfBase64,
        pdfName: pdfFile?.name || 'compliance_report.pdf',
        pdfSize: pdfFile?.size,
        senderId: userProfile.uid,
        senderName: userProfile.name || 'مدير النظام'
      });

      // Clear Form
      setTargetSchoolId('');
      setPdfFile(null);
      setPdfBase64('');
      setSelectedSemester('first');

      setSuccessMsg(isRtl ? '✅ تم رفع وربط التقرير بنجاح وتوجيهه فورياً لمدير المدرسة!' : '✅ Compliance PDF report uploaded and transmitted to school director successfully!');
      setJustSent(true);
      setTimeout(() => {
        setJustSent(false);
      }, 5000);
      
      // Reload reports
      const updated = await getSchoolReports(userProfile);
      setReports(updated);
    } catch (err) {
      console.error(err);
      setErrorMsg(isRtl ? 'حدث خطأ أثناء رفع وبث التقرير' : 'Error dispatching school PDF report');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Report
  const handleDeleteReport = async (id: string) => {
    const isConfirmed = window.confirm(
      isRtl ? 'هل أنت متأكد من حذف هذا التقرير نهائياً من سجلات المدرسة؟' : 'Are you sure you want to permanently delete this report?'
    );
    if (!isConfirmed) return;

    try {
      await deleteSchoolReport(id);
      setReports(prev => prev.filter(r => r.id !== id));
      if (selectedReport?.id === id) {
        setSelectedReport(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Analytics helper quantities
  const approved = assessments.filter(a => a.status === 'Approved').length;
  const review = assessments.filter(a => a.status === 'In Progress').length;
  const pending = assessments.filter(a => a.status === 'Pending').length;
  const revisions = assessments.filter(a => a.status === 'Revision Request').length;

  return (
    <div className="space-y-7 w-full font-sans text-[#0B1E40]" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* 1. Header Hero Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xs p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/10 rounded-bl-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-50/20 rounded-tr-full pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-linear-to-br from-emerald-800 to-teal-950 rounded-2xl text-amber-200 shadow-md">
              <FileText className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                {userProfile?.role === 'admin' 
                  ? (isRtl ? '📋 نظام بث تقارير المدارس المركزي' : '📋 Ministry Central School Reports Dispatcher')
                  : (isRtl ? '📋 تقارير واشرافيات المدرسة الموجهة' : '📋 School Evaluation Dashboard')
                }
              </h1>
              <p className="text-xs text-slate-400 font-bold mt-1 leading-relaxed">
                {userProfile?.role === 'admin'
                  ? (isRtl 
                      ? 'بوابة فورية لرفع التقارير المعتمدة بصيغة PDF وتوجيهها آلياً لكل مدرسة وفق الفصل الدراسي.' 
                      : 'Upload certified evaluation PDFs and auto-route them to target school principals instantly.')
                  : (isRtl 
                      ? 'الوصول الآمن للتقارير الإشرافية والزيارات الفنية وملفات التقييم المرسلة لمدرستكم من المشرفين.' 
                      : 'Securely access compliance notes, visitation feedback, and official PDFs dispatched to your school.')
                }
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200/60 self-start md:self-center">
            {isRtl ? 'تفريز آلي وفق المدرسة' : 'Intelligent Auto-Routing Active'}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl border border-slate-200/60 p-12 text-center flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-4 border-emerald-800 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-bold">{isRtl ? 'جاري فرز وتحميل مستندات المدرسة الرمزية...' : 'Retrieving audited school files...'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
          
          {/* 2. ADMIN PANEL: Clean File Uploader & Designated Targets */}
          {userProfile?.role === 'admin' && (
            <>
              {/* Dispatch Report Form */}
              <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/60 shadow-xs p-6 space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Send className="w-4.5 h-4.5 text-emerald-700" />
                  <h3 className="text-sm font-black text-slate-800">
                    {isRtl ? 'تصدير وبث ملف التقرير' : 'Dispatch New Evaluation PDF'}
                  </h3>
                </div>

                <form onSubmit={handleCreateReport} className="space-y-5">
                  
                  {/* Select Destination School */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">
                      {isRtl ? '١. المدرسة المستهدفة' : '1. Target School'}
                    </label>
                    <div className="relative">
                      <select
                        value={targetSchoolId}
                        onChange={(e) => setTargetSchoolId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 cursor-pointer appearance-none shadow-xs"
                      >
                        <option key="results-sch-default" value="">{isRtl ? '-- اختر مدرسة من مدارس السلطنة --' : '-- Select School --'}</option>
                        {schools.map((sch, index) => (
                          <option key={`sch-opt-${sch.id || index}-${index}`} value={sch.id}>
                            🏢 {isRtl ? sch.nameAr : sch.nameEn} ({isRtl ? sch.wilayaAr : sch.wilayaEn})
                          </option>
                        ))}
                      </select>
                      <div className={`absolute top-4 pointer-events-none ${isRtl ? 'left-4' : 'right-4'}`}>
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Period Selection */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">
                      {isRtl ? '٢. الفصل الدراسي المستهدف' : '2. Target Academic Semester'}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedSemester('first')}
                        className={`py-3 px-4 rounded-xl text-xs font-black border transition-all cursor-pointer text-center ${
                          selectedSemester === 'first'
                            ? 'bg-emerald-800 text-white border-emerald-800 shadow-md'
                            : 'bg-slate-50/50 hover:bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        {isRtl ? '🍂 الفصل الدراسي الأول' : '🍂 First Semester'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedSemester('second')}
                        className={`py-3 px-4 rounded-xl text-xs font-black border transition-all cursor-pointer text-center ${
                          selectedSemester === 'second'
                            ? 'bg-emerald-800 text-white border-emerald-800 shadow-md'
                            : 'bg-slate-50/50 hover:bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        {isRtl ? '🌱 الفصل الدراسي الثاني' : '🌱 Second Semester'}
                      </button>
                    </div>
                  </div>

                  {/* Clean PDF Attachment Selector */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">
                      {isRtl ? '٣. ملف تقرير المدرسة (PDF فقط)' : '3. School Evaluation PDF File'}
                    </label>
                    
                    <div 
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`relative border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
                        dragActive ? 'border-emerald-600 bg-emerald-50/20' : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                      }`}
                    >
                      <input 
                        ref={fileInputRef}
                        type="file" 
                        accept="application/pdf"
                        className="hidden" 
                        onChange={handleInputChange}
                      />

                      <UploadCloud className="w-9 h-9 mx-auto text-slate-400 mb-2 animate-bounce" />
                      
                      <div className="space-y-1">
                        <p className="text-xs font-black text-slate-700">
                          {isRtl ? 'اسحب التقرير هنا أو تصفح الملفات المحلية' : 'Drag & drop report here or browse'}
                        </p>
                        <p className="text-[10px] text-slate-450 font-bold">
                          {isRtl ? 'يدعم مستندات PDF المكتوبة والمصورة حتى ٢٠ ميجابايت' : 'Only PDF reports up to 20MB are supported'}
                        </p>
                      </div>
                    </div>

                    {/* Attached file visual token state display */}
                    {pdfFile && (
                      <div className="mt-3.5 p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-150 flex items-center justify-between gap-3 animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="p-2 bg-emerald-800 text-white rounded-lg">
                            <FileText className="w-4.5 h-4.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] font-black text-teal-950 truncate max-w-[150px] sm:max-w-[190px]">
                              {pdfFile.name}
                            </p>
                            <p className="text-[10px] text-emerald-700/80 font-bold font-mono">
                              {formatBytes(pdfFile.size)}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setPdfFile(null);
                            setPdfBase64('');
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-white rounded-md transition-colors font-bold text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>

                  {errorMsg && (
                    <div className="p-3 bg-rose-50 text-rose-800 rounded-xl text-xs font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {successMsg && (
                    <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 shrink-0" />
                      <span>{successMsg}</span>
                    </div>
                  )}

                   <button
                    type="submit"
                    disabled={submitting}
                    className={`w-full py-3.5 px-4 text-white rounded-2xl text-xs font-black shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 ${
                      justSent 
                        ? 'bg-emerald-600 border border-emerald-500 shadow-emerald-250/50' 
                        : 'bg-linear-to-r from-emerald-800 to-teal-950 hover:opacity-95'
                    }`}
                  >
                    {justSent ? (
                      <CheckCircle className="w-4 h-4 text-amber-200 animate-bounce" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span>
                      {submitting 
                        ? (isRtl ? 'جاري معالجة ورفع التقرير وبثه...' : 'Uploading & Broadcasting PDF...') 
                        : justSent
                          ? (isRtl ? '✓ تم الإرسال بنجاح' : '✓ Sent Successfully')
                          : (isRtl ? 'بث ورفع التقرير لمدير المدرسة الآن' : 'Publish Report to Principal Now')
                      }
                    </span>
                  </button>
                </form>
              </div>

              {/* Dispatched Reports History */}
              <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/60 shadow-xs p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <School className="w-4.5 h-4.5 text-[#0B1E40]" />
                    <h3 className="text-sm font-black text-slate-800">
                      {isRtl ? 'سجل تقارير المدارس الصادرة والمنفذة' : 'Dispatched Institutional Reports'}
                    </h3>
                  </div>
                  <span className="text-[10px] font-black bg-slate-100 text-[#0B1E40] px-3 py-1 rounded-full border border-slate-200/50">
                    {reports.length} {isRtl ? 'تقرير مبعوث' : 'Reports Published'}
                  </span>
                </div>

                {reports.length === 0 ? (
                  <div className="py-24 text-center flex flex-col items-center justify-center space-y-3.5">
                    <FileText className="w-12 h-12 text-slate-300 animate-pulse" />
                    <div>
                      <p className="text-xs text-slate-400 font-bold">
                        {isRtl ? 'لا توجد تقارير منشورة حالياً في سجلات النظام.' : 'No compliance reports have been dispatched yet.'}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {isRtl ? 'قم باختيار مدرسة وإرفاق تفرير PDF لبثه للمطابقة فورا.' : 'Select a school and upload a PDF to test real database broadcasting.'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3.5 max-h-[580px] overflow-y-auto pr-1">
                    {reports.map((rep, index) => (
                      <div 
                        key={`rep-row-${rep.id || index}-${index}`} 
                        className="p-4 bg-slate-50/40 hover:bg-slate-50/90 border border-slate-250/25 rounded-2xl flex items-center justify-between gap-4 transition-all"
                      >
                        <div 
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => setSelectedReport(rep)}
                        >
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-[9px] font-extrabold bg-[#0B1E40]/5 text-[#0B1E40] border border-[#0B1E40]/10 max-w-xs truncate">
                              🏢 {rep.schoolName}
                            </span>
                            
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-extrabold border ${
                              rep.semester === 'first'
                                ? 'bg-indigo-50 text-indigo-800 border-indigo-150'
                                : 'bg-amber-50 text-amber-800 border-amber-150'
                            }`}>
                              {rep.semester === 'first' ? (isRtl ? 'الفصل الدراسي الأول' : 'First Semester') : (isRtl ? 'الفصل الدراسي الثاني' : 'Second Semester')}
                            </span>

                            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(rep.createdAt).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US')}
                            </span>

                            {rep.isRead ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[9px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-250">
                                <CheckCircle className="w-3 h-3 text-emerald-600" />
                                {isRtl ? 'تمت القراءة ✓' : 'Read ✓'}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[9px] font-extrabold bg-amber-50 text-amber-800 border border-amber-150">
                                <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
                                {isRtl ? 'غير مقروء ⏳' : 'Unread'}
                              </span>
                            )}
                          </div>

                          <h4 className="text-xs font-black text-slate-800 mt-2 truncate">
                            {isRtl ? rep.titleAr : (rep.titleEn || rep.titleAr)}
                          </h4>

                          {rep.isRead && (
                            <div className="mt-1.5 inline-flex items-center gap-1.5 text-[9.5px] font-extrabold text-emerald-800 bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-150/40 px-2.5 py-1 rounded-xl transition-all shadow-xs">
                              <span className="animate-bounce">👁️</span>
                              <span>
                                {isRtl 
                                  ? `تم الاطلاع من قِبل [أ. ${rep.readBy || 'مدير المدرسة'}] في: ${new Date(rep.readAt || '').toLocaleString('ar-OM', { dateStyle: 'short', timeStyle: 'short' })}`
                                  : `Viewed by [Pr. ${rep.readBy || 'Principal'}] at: ${new Date(rep.readAt || '').toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })}`
                                }
                              </span>
                            </div>
                          )}

                          {/* PDF metadata log layout */}
                          <div className="mt-1.5 flex items-center gap-1.5 text-[10px] font-bold text-emerald-800">
                            <Paperclip className="w-3.5 h-3.5 text-emerald-650" />
                            <span className="truncate max-w-[280px]">
                              {rep.pdfName || 'compliance_report.pdf'}
                            </span>
                            {rep.pdfSize && (
                              <span className="text-slate-400 font-mono text-[9px]">
                                ({formatBytes(rep.pdfSize)})
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {rep.pdfData && (
                            <a
                              href={rep.pdfData}
                              download={rep.pdfName || 'report.pdf'}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-150 rounded-xl text-emerald-800 cursor-pointer transition-all"
                              title={isRtl ? 'تنزيل أو قراءة التقرير المرفق' : 'Download attachment'}
                            >
                              <FileDown className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => setSelectedReport(rep)}
                            className="p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 cursor-pointer transition-all"
                            title={isRtl ? 'تفاصيل التقرير' : 'View report details'}
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteReport(rep.id!)}
                            className="p-2 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-250 rounded-xl text-rose-600 cursor-pointer transition-all"
                            title={isRtl ? 'حذف التقرير نهائياً' : 'Delete report'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* 3. SCHOOL / PRINCIPAL: Interactive Received Reports View */}
          {userProfile?.role === 'school' && (
            <div className="lg:col-span-12 space-y-6 animate-in fade-in duration-150">
              
              <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xs p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-700" />
                    <h3 className="text-sm font-black text-slate-800">
                      {isRtl ? `التقارير الواردة لمدرستكم: ${userProfile.schoolName || userProfile.name}` : `Compliance & Visitation Reports Received`}
                    </h3>
                  </div>
                  <span className="text-[11px] font-black bg-emerald-50 text-emerald-850 border border-emerald-150 px-3 py-1 rounded-full animate-pulse">
                    {reports.length} {isRtl ? 'تقارير موجهة لكم' : 'Dispatched Reports'}
                  </span>
                </div>

                {reports.length === 0 ? (
                  <div className="py-24 text-center flex flex-col items-center justify-center space-y-3.5">
                    <div className="p-4 bg-slate-50 rounded-full text-slate-300">
                      <FileText className="w-12 h-12" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-700">
                        {isRtl ? 'لم يتم العثور على أي تقارير واردة حالياً.' : 'No reports found for your school yet.'}
                      </p>
                      <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
                        {isRtl 
                          ? 'يقوم النظام تلقائياً بتحويل وإظهار أي تقرير يصدره مدير النظام لـ الفصل الأول أو الفصل الثاني الخاص بمدرستكم.' 
                          : 'As soon as Ministry Admins draft and upload reports for your school, they will securely appear here.'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reports.map((rep, index) => (
                      <div 
                        key={`rep-card-${rep.id || index}-${index}`} 
                        className="bg-[#0B1E40]/5 hover:bg-[#0B1E40]/10 border border-slate-100/85 p-5 rounded-3xl flex flex-col justify-between space-y-4 hover:shadow-xs transition-all relative overflow-hidden group"
                      >
                        {/* Shading design overlay */}
                        <div className="absolute top-0 right-0 w-20 h-20 bg-linear-to-br from-emerald-500/5 to-transparent rounded-bl-full pointer-events-none" />
                        
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold flex-wrap gap-1.5">
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(rep.createdAt).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US')}
                            </span>
                            
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`px-2.5 py-0.5 rounded-full font-extrabold text-[9px] border ${
                                rep.semester === 'first' 
                                  ? 'bg-indigo-50 text-indigo-900 border-indigo-150' 
                                  : 'bg-amber-50 text-amber-900 border-amber-150'
                              }`}>
                                {rep.semester === 'first' ? (isRtl ? 'الفصل الدراسي الأول' : 'First Semester') : (isRtl ? 'الفصل الدراسي الثاني' : 'Second Semester')}
                              </span>

                              {rep.isRead ? (
                                <span className="px-2 py-0.5 rounded-full font-extrabold text-[9px] bg-emerald-50 text-emerald-800 border border-emerald-250">
                                  {isRtl ? 'تمت القراءة ✓' : 'Read ✓'}
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full font-extrabold text-[9px] bg-amber-50 text-amber-800 border border-amber-250 animate-pulse">
                                  {isRtl ? 'جديد 🆕' : 'New 🆕'}
                                </span>
                              )}
                            </div>
                          </div>

                          <h4 
                            onClick={() => handleViewReport(rep)}
                            className="text-xs font-black text-slate-900 leading-snug hover:text-emerald-800 transition-colors line-clamp-2 cursor-pointer"
                          >
                            {isRtl ? rep.titleAr : (rep.titleEn || rep.titleAr)}
                          </h4>

                          {/* PDF Token Row inside principal card view */}
                          <div className="p-3 bg-white rounded-2xl border border-slate-200/40 flex items-center justify-between gap-2.5">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="p-1.5 bg-rose-50 text-rose-700 rounded-lg">
                                <FileText className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-[10px] font-bold text-slate-800 truncate max-w-[130px]">
                                  {rep.pdfName || 'compliance_report.pdf'}
                                </p>
                                {rep.pdfSize && (
                                  <p className="text-[9px] text-slate-400 font-mono">
                                    {formatBytes(rep.pdfSize)}
                                  </p>
                                )}
                              </div>
                            </div>

                            {rep.pdfData && (
                              <a
                                href={rep.pdfData}
                                target="_blank"
                                rel="noreferrer"
                                onClick={() => handleViewReport(rep)}
                                className="p-1 px-2.5 bg-[#0B1E40] hover:bg-emerald-800 text-amber-300 hover:text-white rounded-lg text-[9px] font-black tracking-wide shrink-0 transition-colors"
                              >
                                {isRtl ? 'تحميل ⬇️' : 'Get ⬇️'}
                              </a>
                            )}
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100/80 flex items-center justify-between text-[11px] font-black text-[#0B1E40] flex-wrap gap-2">
                          <span className="text-[10px] text-slate-400 font-bold">
                            {isRtl ? 'بواسطة: ' : 'From: '} {rep.senderName}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleViewReport(rep)}
                            className="flex items-center gap-1 hover:text-emerald-700 cursor-pointer"
                          >
                            {isRtl ? 'القرار الوزاري' : 'Ministry Resolution'}
                            {isRtl ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Standard Compliance Statistics for Reference */}
              <div className="bg-slate-50/50 rounded-3xl border border-slate-200/50 p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
                  <div className="space-y-0.5">
                    <h3 className="text-xs font-black text-slate-850">
                      {isRtl ? '📊 لوحة القياس المعيارية للمطابقة' : '📊 Contextual Compliance Metrics'}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {isRtl ? 'تتبع فوري لمؤشرات جودة واعتماد الاختبارات الإقليمية ومقارنتها بالمعايير الوطنية.' : 'Real-time alignment indexes calculated relative to international exam grids.'}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">
                    {isRtl ? `إجمالي الفحوصات: ${assessments.length}` : `Total Audits: ${assessments.length}`}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/50 text-center">
                    <span className="text-2xl font-black text-emerald-600">
                      {assessments.length > 0 ? Math.round((approved / assessments.length) * 100) : 0}%
                    </span>
                    <p className="text-[10px] font-black text-slate-500 mt-1">{isRtl ? 'معدل جودة الاختبارات ومطابقتها للمناهج' : 'Aligned Curriculum Rate'}</p>
                  </div>
                  <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50 text-center">
                    <span className="text-2xl font-black text-blue-700">
                      {review + pending}
                    </span>
                    <p className="text-[10px] font-black text-slate-500 mt-1">{isRtl ? 'ملفات تخضع للتدقيق الإشرافي الفعلي' : 'Awaiting Operational Audits'}</p>
                  </div>
                  <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-100/50 text-center">
                    <span className="text-2xl font-black text-rose-600">
                      {revisions}
                    </span>
                    <p className="text-[10px] font-black text-slate-500 mt-1">{isRtl ? 'ملفات بحاجة للتعديل وفق ملاحظات الوزارة' : 'Requires Local Revisions'}</p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* 4. FALLBACK / guest / moderators: Render standard compliance matrix */}
          {userProfile?.role !== 'admin' && userProfile?.role !== 'school' && (
            <div className="lg:col-span-12 space-y-6">
              <div className="bg-white rounded-3xl p-6 border border-slate-205/50 shadow-md space-y-6">
                <div>
                  <h3 className="text-lg font-extrabold text-[#0B1E40]">
                    {isRtl ? '📊 مؤشرات الامتحانات ومعدلات الاعتماد الوطني' : '📊 MOE Curriculum Compliance & Verification Analytics'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {isRtl ? 'بيانات حقيقية لمعدلات التدقيق والمطابقة للامتحانات بالسلطنة' : 'Empirical analytics summarizing compliance weights, status rates, and feedback indicators.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="bg-emerald-50/50 p-5 rounded-2xl border border-[#e6f9f0] flex flex-col justify-center items-center">
                    <span className="text-3xl font-black text-[#00b074]">
                      {assessments.length > 0 ? Math.round((approved / assessments.length) * 100) : 0}%
                    </span>
                    <p className="text-xs font-bold text-slate-500 mt-1">{isRtl ? 'نسبة المطابقة للمناهج' : 'Curriculum Alignment Rate'}</p>
                  </div>

                  <div className="bg-blue-50/40 p-5 rounded-2xl border border-blue-50 flex flex-col justify-center items-center">
                    <span className="text-3xl font-black text-blue-800">
                      {review + pending}
                    </span>
                    <p className="text-xs font-bold text-slate-500 mt-1">{isRtl ? 'ملفات قيد التدقيق الإشرافي' : 'Under Ministry Review'}</p>
                  </div>

                  <div className="bg-rose-50/50 p-5 rounded-2xl border border-rose-50 flex flex-col justify-center items-center">
                    <span className="text-3xl font-black text-[#eb5757]">
                      {revisions}
                    </span>
                    <p className="text-xs font-bold text-slate-500 mt-1">{isRtl ? 'ملفات بحاجة للمراجعة الفنية' : 'Blueprints Rejections'}</p>
                  </div>
                </div>

                {/* Compliance weights indicators */}
                <div className="p-4 border border-slate-100 rounded-2xl bg-slate-50/20">
                  <h4 className="font-extrabold text-[#0B1E40] text-xs uppercase tracking-wider mb-4 px-1">{isRtl ? 'تدرج حالة المطابقة الإحصائية للمدارس بالسلطنة' : 'Institutional Blueprints Compliance Matrix'}</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between w-full">
                      <span className="w-20 text-[10.5px] font-bold text-slate-450 truncate">{isRtl ? 'معتمد ومطابق' : 'Approved Grid'}</span>
                      <div className="flex-1 max-w-xs bg-slate-100 rounded-full h-3 relative mx-3.5">
                        <div className="bg-[#00b074] rounded-full h-3 transition-all duration-500" style={{ width: `${assessments.length > 0 ? (approved / assessments.length) * 100 : 0}%` }}></div>
                      </div>
                      <span className="font-mono text-[10px] font-black text-slate-600">{approved} files</span>
                    </div>

                    <div className="flex items-center justify-between w-full">
                      <span className="w-20 text-[10.5px] font-bold text-slate-450 truncate">{isRtl ? 'تحت التدقيق' : 'Technical review'}</span>
                      <div className="flex-1 max-w-xs bg-slate-100 rounded-full h-3 relative mx-3.5">
                        <div className="bg-[#12305c] rounded-full h-3 transition-all duration-500" style={{ width: `${assessments.length > 0 ? (review / assessments.length) * 100 : 0}%` }}></div>
                      </div>
                      <span className="font-mono text-[10px] font-black text-slate-600">{review} files</span>
                    </div>

                    <div className="flex items-center justify-between w-full">
                      <span className="w-20 text-[10.5px] font-bold text-slate-450 truncate">{isRtl ? 'بانتظار الفرز' : 'Pending Allocation'}</span>
                      <div className="flex-1 max-w-xs bg-slate-100 rounded-full h-3 relative mx-3.5">
                        <div className="bg-[#f2994a] rounded-full h-3 transition-all duration-500" style={{ width: `${assessments.length > 0 ? (pending / assessments.length) * 100 : 0}%` }}></div>
                      </div>
                      <span className="font-mono text-[10px] font-black text-slate-600">{pending} files</span>
                    </div>

                    <div className="flex items-center justify-between w-full">
                      <span className="w-20 text-[10.5px] font-bold text-slate-450 truncate">{isRtl ? 'مسترجع للتعديل' : 'Revision Required'}</span>
                      <div className="flex-1 max-w-xs bg-slate-100 rounded-full h-3 relative mx-3.5">
                        <div className="bg-[#eb5757] rounded-full h-3 transition-all duration-500" style={{ width: `${assessments.length > 0 ? (revisions / assessments.length) * 100 : 0}%` }}></div>
                      </div>
                      <span className="font-mono text-[10px] font-black text-slate-600">{revisions} files</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* 5. Detail Report View modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div 
            className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl max-w-2xl w-full p-6 space-y-5 relative overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Shading and design decorations */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-[#0B1E40]/5 rounded-bl-full pointer-events-none" />
            
            <div className="flex justify-between items-start border-b border-slate-100 pb-3 gap-4 relative z-10">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-150">
                  🏢 {selectedReport.schoolName}
                </span>
                <h3 className="text-sm md:text-base font-black text-slate-800 leading-tight">
                  {isRtl ? selectedReport.titleAr : (selectedReport.titleEn || selectedReport.titleAr)}
                </h3>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="p-1 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-500 cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Content body info */}
            <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
              <div className="p-4 bg-slate-50 rounded-2xl text-xs font-medium text-slate-700 leading-relaxed whitespace-pre-wrap">
                {selectedReport.content}
              </div>

              {/* Sub-block displaying files info */}
              <div className="p-3.5 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="p-2 bg-emerald-800 text-white rounded-xl">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 text-xs">
                    <p className="font-extrabold text-emerald-950 truncate max-w-[280px]">
                      {selectedReport.pdfName || 'compliance_report.pdf'}
                    </p>
                    {selectedReport.pdfSize && (
                      <p className="text-[10px] text-slate-500 font-mono">
                        {formatBytes(selectedReport.pdfSize)}
                      </p>
                    )}
                  </div>
                </div>

                {selectedReport.pdfData && (
                  <a
                    href={selectedReport.pdfData}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-[#0B1E40] text-amber-300 rounded-xl text-xs font-black hover:bg-emerald-850 hover:text-white flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isRtl ? 'تحميل التقرير الورقي' : 'Download Document'}</span>
                  </a>
                )}
              </div>

              {/* Sender & Metas */}
              <div className="grid grid-cols-2 gap-4 text-[11px] font-bold text-slate-500 bg-slate-50/50 p-3 rounded-xl border border-slate-250/20">
                <div className="flex items-center gap-1.5 justify-start">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {isRtl ? 'تاريخ النشر: ' : 'Published: '} 
                    {new Date(selectedReport.createdAt).toLocaleString(isRtl ? 'ar-EG' : 'en-US', { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 justify-start">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    {isRtl ? 'المُرسل: ' : 'From: '} {selectedReport.senderName}
                  </span>
                </div>
              </div>

              {selectedReport.isRead && (
                <div className="text-[11px] font-bold text-emerald-800 bg-emerald-50/50 p-3 rounded-xl border border-emerald-150 flex items-center gap-2 animate-in fade-in duration-150">
                  <span className="text-emerald-600">✓</span>
                  <span>
                    {isRtl 
                      ? `تم الاطلاع من قبل (${selectedReport.readBy || 'مدير المدرسة'}) بتاريخ ${new Date(selectedReport.readAt || '').toLocaleString('ar-OM', { dateStyle: 'medium', timeStyle: 'short' })}`
                      : `Read and acknowledged by (${selectedReport.readBy || 'Principal'}) on ${new Date(selectedReport.readAt || '').toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}`
                    }
                  </span>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className={`pt-3 border-t border-slate-100 flex gap-3 ${isRtl ? 'justify-start' : 'justify-end'}`}>
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-black hover:bg-slate-200 cursor-pointer transition-colors animate-pulse"
              >
                {isRtl ? 'إغلاق ومتابعة' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
