import React, { useState, useEffect, useRef } from 'react';
import { 
  Stamp, 
  Upload, 
  Trash2, 
  Search, 
  Filter, 
  Check, 
  X, 
  AlertTriangle, 
  Loader2, 
  Eye, 
  FileText, 
  Sparkles, 
  Building2, 
  CheckCircle2, 
  Image as ImageIcon,
  RefreshCw,
  Info,
  Layers,
  FileCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SchoolDoc } from '../types';
import { 
  getSchoolsList, 
  uploadSchoolStamp, 
  deleteSchoolStamp,
  syncOfficialWustaSchools
} from '../services/db';
import { principalStampUrl } from './OmanPrincipalStamp';

interface SchoolStampsManagerProps {
  language: 'en' | 'ar';
}

const WILAYATS = [
  { id: 'all', nameAr: 'جميع الولايات', nameEn: 'All Wilayats' },
  { id: 'mahout', nameAr: 'ولاية محوت', nameEn: 'Wilayat Mahout' },
  { id: 'duqm', nameAr: 'ولاية الدقم', nameEn: 'Wilayat Duqm' },
  { id: 'jazer', nameAr: 'ولاية الجازر', nameEn: 'Wilayat Al Jazer' },
  { id: 'haima', nameAr: 'ولاية هيماء', nameEn: 'Wilayat Haima' }
];

export const SchoolStampsManager: React.FC<SchoolStampsManagerProps> = ({ language }) => {
  const isRtl = language === 'ar';

  const [schools, setSchools] = useState<SchoolDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWilaya, setSelectedWilaya] = useState('all');
  const [stampFilter, setStampFilter] = useState<'all' | 'with_stamp' | 'without_stamp'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modal states
  const [uploadModalSchool, setUploadModalSchool] = useState<SchoolDoc | null>(null);
  const [deleteModalSchool, setDeleteModalSchool] = useState<SchoolDoc | null>(null);
  const [previewStampSchool, setPreviewStampSchool] = useState<SchoolDoc | null>(null);
  const [documentTestSchool, setDocumentTestSchool] = useState<SchoolDoc | null>(null);

  // Upload file state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewDataUrl, setPreviewDataUrl] = useState<string>('');
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | null }>({
    message: '',
    type: null
  });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast({ message: '', type: null });
    }, 4000);
  };

  // Load all schools
  const loadSchools = async () => {
    setLoading(true);
    try {
      let data = await getSchoolsList();
      if (data.length === 0) {
        data = await syncOfficialWustaSchools();
      }
      setSchools(data);
    } catch (err) {
      showToast(
        isRtl ? 'تعذر تحميل بيانات المدارس' : 'Failed to load schools list', 
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchools();
  }, []);

  // Filtered schools
  const filteredSchools = schools.filter(school => {
    const matchesSearch = 
      school.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (school.nameEn && school.nameEn.toLowerCase().includes(searchQuery.toLowerCase())) ||
      school.wilayaAr.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesWilaya = selectedWilaya === 'all' || school.wilayaId === selectedWilaya;

    const hasStamp = Boolean(school.stampUrl && school.stampUrl.trim() !== '');
    const matchesStamp = 
      stampFilter === 'all' ? true :
      stampFilter === 'with_stamp' ? hasStamp : !hasStamp;

    return matchesSearch && matchesWilaya && matchesStamp;
  });

  // Summary Metrics
  const totalCount = schools.length;
  const withStampCount = schools.filter(s => Boolean(s.stampUrl && s.stampUrl.trim() !== '')).length;
  const withoutStampCount = totalCount - withStampCount;
  const coveragePercent = totalCount > 0 ? Math.round((withStampCount / totalCount) * 100) : 0;

  // File Handling
  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast(isRtl ? 'يرجى اختيار ملف صورة صالح (PNG, JPG, SVG, WebP)' : 'Please select a valid image file', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast(isRtl ? 'حجم الصورة كبير جداً، الحد الأقصى 5 ميجابايت' : 'Image size too large, maximum 5MB', 'error');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setPreviewDataUrl(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Open Upload Modal
  const openUploadModal = (school: SchoolDoc) => {
    setUploadModalSchool(school);
    setSelectedFile(null);
    setPreviewDataUrl(school.stampUrl || '');
  };

  // Submit Stamp Upload
  const handleSaveStamp = async () => {
    if (!uploadModalSchool || !previewDataUrl) {
      showToast(isRtl ? 'يرجى اختيار صورة الختم أولاً' : 'Please select a stamp image first', 'error');
      return;
    }

    setIsProcessingUpload(true);
    try {
      const fileName = selectedFile?.name || uploadModalSchool.stampName || 'school_stamp.png';
      await uploadSchoolStamp(
        uploadModalSchool.id, 
        previewDataUrl, 
        fileName, 
        'مدير النظام (Admin)'
      );

      showToast(
        isRtl 
          ? `✓ تم اعتماد وتثبيت الختم لمدرسة (${uploadModalSchool.nameAr}) بنجاح!` 
          : `Official stamp saved for (${uploadModalSchool.nameAr}) successfully!`,
        'success'
      );

      setUploadModalSchool(null);
      setSelectedFile(null);
      setPreviewDataUrl('');
      await loadSchools();
    } catch (err) {
      showToast(
        isRtl ? 'فشل حفظ الختم، يرجى المحاولة مرة أخرى' : 'Failed to save stamp, please retry',
        'error'
      );
    } finally {
      setIsProcessingUpload(false);
    }
  };

  // Confirm and Execute Stamp Deletion
  const handleDeleteStamp = async () => {
    if (!deleteModalSchool) return;
    setIsProcessingUpload(true);
    try {
      await deleteSchoolStamp(deleteModalSchool.id);
      showToast(
        isRtl 
          ? `✓ تم حذف ختم (${deleteModalSchool.nameAr}) بنجاح` 
          : `Stamp removed for (${deleteModalSchool.nameAr})`,
        'success'
      );
      setDeleteModalSchool(null);
      await loadSchools();
    } catch (err) {
      showToast(
        isRtl ? 'حدث خطأ أثناء حذف الختم' : 'Error deleting stamp',
        'error'
      );
    } finally {
      setIsProcessingUpload(false);
    }
  };

  return (
    <div className="space-y-6 w-full font-sans text-slate-800" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Toast Notification */}
      <AnimatePresence>
        {toast.type && (
          <motion.div
            key="stamp-toast-notification"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border text-xs sm:text-sm font-black backdrop-blur-md ${
              toast.type === 'success'
                ? 'bg-emerald-600 text-white border-emerald-500/50'
                : 'bg-rose-600 text-white border-rose-500/50'
            }`}
          >
            {toast.type === 'success' ? <Check className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Executive Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 md:p-8 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-amber-100/40 via-emerald-50/20 to-transparent rounded-bl-full pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-tr from-indigo-100/30 to-transparent rounded-tr-full pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/60 text-amber-900 text-xs font-black">
              <Stamp className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
              <span>{isRtl ? 'إدارة الأختام الرسمية المعتمدة' : 'Official Stamps Registry'}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-[#051C3F] tracking-tight">
              {isRtl ? '💮 سجل أختام المدارس التعليمية' : '💮 Schools Official Stamps Hub'}
            </h1>
            <p className="text-xs md:text-sm text-slate-500 font-medium max-w-2xl leading-relaxed">
              {isRtl
                ? 'بوابة مدير النظام المركزية لرفع وإدارة وحذف الأختام الرسمية الخاصة بكل مدرسة في المحافظة. تُدرج هذه الأختام تلقائياً على استمارات التقييم المعتمدة وتوقيع المدير الإلكتروني.'
                : 'Central administrator repository to upload, manage, verify, and delete official school seals for all regional schools, automatically embedded into certified audit reports.'}
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 shrink-0">
            <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-3.5 text-center min-w-[100px]">
              <div className="text-[11px] font-bold text-slate-500">{isRtl ? 'إجمالي المدارس' : 'Total Schools'}</div>
              <div className="text-xl md:text-2xl font-black text-slate-800 mt-1">{totalCount}</div>
            </div>

            <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-3.5 text-center min-w-[100px]">
              <div className="text-[11px] font-bold text-emerald-800 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>{isRtl ? 'أختام معتمدة' : 'With Stamp'}</span>
              </div>
              <div className="text-xl md:text-2xl font-black text-emerald-900 mt-1">
                {withStampCount}
              </div>
              <div className="text-[10px] font-bold text-emerald-700 mt-0.5">
                {coveragePercent}% {isRtl ? 'مكتمل' : 'Covered'}
              </div>
            </div>

            <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3.5 text-center min-w-[100px]">
              <div className="text-[11px] font-bold text-amber-800 flex items-center justify-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-600" />
                <span>{isRtl ? 'بدون ختم' : 'Missing'}</span>
              </div>
              <div className="text-xl md:text-2xl font-black text-amber-900 mt-1">
                {withoutStampCount}
              </div>
              <div className="text-[10px] font-bold text-amber-700 mt-0.5">
                {isRtl ? 'بانتظار الرفع' : 'Pending'}
              </div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3">
          <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-[#0b5e32] h-full rounded-full transition-all duration-500"
              style={{ width: `${coveragePercent}%` }}
            />
          </div>
          <span className="text-xs font-black text-slate-600 shrink-0">
            {isRtl ? `نسبة تغطية الأختام: ${coveragePercent}%` : `Stamps Coverage: ${coveragePercent}%`}
          </span>
        </div>
      </div>

      {/* Interactive Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 right-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isRtl ? 'البحث باسم المدرسة أو الولاية...' : 'Search school or wilayat...'}
            className="w-full pr-9 pl-4 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0b5e32]/30 focus:border-[#0b5e32]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute top-1/2 -translate-y-1/2 left-3 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Wilaya and Stamp Status Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Wilaya Filter Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedWilaya}
              onChange={(e) => setSelectedWilaya(e.target.value)}
              className="text-xs font-bold text-slate-700 bg-transparent focus:outline-hidden cursor-pointer"
            >
              {WILAYATS.map(w => (
                <option key={`stamp-wilaya-opt-${w.id}`} value={w.id}>
                  {isRtl ? w.nameAr : w.nameEn}
                </option>
              ))}
            </select>
          </div>

          {/* Stamp Presence Filter */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs font-bold">
            <button
              type="button"
              onClick={() => setStampFilter('all')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                stampFilter === 'all' 
                  ? 'bg-white text-slate-900 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isRtl ? 'الكل' : 'All'}
            </button>
            <button
              type="button"
              onClick={() => setStampFilter('with_stamp')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                stampFilter === 'with_stamp' 
                  ? 'bg-emerald-600 text-white shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Check className="w-3 h-3" />
              <span>{isRtl ? 'بختم' : 'With Stamp'}</span>
            </button>
            <button
              type="button"
              onClick={() => setStampFilter('without_stamp')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                stampFilter === 'without_stamp' 
                  ? 'bg-amber-600 text-white shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              <span>{isRtl ? 'بدون ختم' : 'Missing'}</span>
            </button>
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={loadSchools}
            className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 transition-all cursor-pointer"
            title={isRtl ? 'تحديث السجل' : 'Refresh'}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Schools List Content */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
          <Loader2 className="w-8 h-8 text-[#0b5e32] animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-500 mt-3">
            {isRtl ? 'جارِ تحميل سجل أختام المدارس...' : 'Loading school stamps registry...'}
          </p>
        </div>
      ) : filteredSchools.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-400 mb-3">
            <Stamp className="w-8 h-8" />
          </div>
          <h3 className="text-base font-black text-slate-700">
            {isRtl ? 'لا توجد نتائج مطابقة' : 'No matching schools found'}
          </h3>
          <p className="text-xs text-slate-400 font-bold mt-1">
            {isRtl ? 'يرجى تجربة معايير بحث أخرى' : 'Try adjusting your search or filters'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSchools.map((school, index) => {
            const hasStamp = Boolean(school.stampUrl && school.stampUrl.trim() !== '');

            return (
              <motion.div
                key={`stamp-sch-${school.id || 'sch'}-${index}`}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between relative group overflow-hidden"
              >
                {/* Status Indicator Tag */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <span className="inline-block px-2.5 py-1 rounded-lg text-[10px] font-black bg-slate-100 text-slate-600 border border-slate-200/60 mb-1.5">
                      {school.wilayaAr}
                    </span>
                    <h3 className="text-base font-black text-slate-900 leading-tight">
                      {school.nameAr}
                    </h3>
                    {school.nameEn && (
                      <p className="text-[11px] text-slate-400 font-semibold mt-0.5" dir="ltr">
                        {school.nameEn}
                      </p>
                    )}
                  </div>

                  {hasStamp ? (
                    <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>{isRtl ? 'معتمد' : 'Verified'}</span>
                    </span>
                  ) : (
                    <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-50 text-amber-800 border border-amber-200">
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                      <span>{isRtl ? 'بدون ختم' : 'No Stamp'}</span>
                    </span>
                  )}
                </div>

                {/* Stamp Seal Canvas Display */}
                <div className="my-3 flex items-center justify-center">
                  <div 
                    className={`w-36 h-36 rounded-2xl border-2 flex items-center justify-center relative p-2 transition-all group-hover:scale-105 duration-200 ${
                      hasStamp 
                        ? 'border-emerald-200/80 bg-slate-50/50 shadow-inner' 
                        : 'border-dashed border-slate-200 bg-slate-50/40'
                    }`}
                    style={{
                      backgroundImage: hasStamp ? 'radial-gradient(#cbd5e1 1px, transparent 1px)' : 'none',
                      backgroundSize: '12px 12px'
                    }}
                  >
                    {hasStamp ? (
                      <div className="relative w-full h-full flex items-center justify-center">
                        <img 
                          src={school.stampUrl} 
                          alt={school.nameAr}
                          className="max-h-full max-w-full object-contain filter drop-shadow-sm select-none"
                          referrerPolicy="no-referrer"
                        />
                        {/* Quick View Lightbox Button */}
                        <button
                          type="button"
                          onClick={() => setPreviewStampSchool(school)}
                          className="absolute inset-0 bg-black/40 text-white rounded-xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer backdrop-blur-[2px]"
                          title={isRtl ? 'تكبير ومعاينة الختم' : 'Enlarge Stamp'}
                        >
                          <Eye className="w-5 h-5" />
                          <span className="text-[10px] font-bold">{isRtl ? 'معاينة مكبرة' : 'Preview'}</span>
                        </button>
                      </div>
                    ) : (
                      <div className="text-center p-3 space-y-1.5">
                        <div className="w-12 h-12 rounded-full border border-dashed border-slate-300 flex items-center justify-center mx-auto text-slate-400">
                          <Stamp className="w-6 h-6 stroke-1" />
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold leading-tight">
                          {isRtl ? 'لم يتم رفع ختم للمدرسة' : 'No seal uploaded yet'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stamp Details or Upload Prompt */}
                <div className="text-center mb-4">
                  {hasStamp ? (
                    <div className="text-[10px] font-bold text-slate-500 space-y-0.5">
                      <p className="truncate max-w-[220px] mx-auto text-slate-700">
                        📄 {school.stampName || 'school_stamp.png'}
                      </p>
                      <p className="text-slate-400">
                        {school.stampUploadedAt ? new Date(school.stampUploadedAt).toLocaleDateString(isRtl ? 'ar-OM' : 'en-US') : ''}
                      </p>
                    </div>
                  ) : (
                    <p className="text-[11px] text-amber-700 font-bold bg-amber-50/80 rounded-lg py-1 px-2 border border-amber-100">
                      {isRtl ? '⚠️ اضغط لرفع الختم الرسمي' : 'Click below to upload stamp'}
                    </p>
                  )}
                </div>

                {/* Actions Bar */}
                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  {hasStamp ? (
                    <>
                      {/* Replace Stamp Button */}
                      <button
                        type="button"
                        onClick={() => openUploadModal(school)}
                        className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5 text-slate-600" />
                        <span>{isRtl ? 'استبدال' : 'Replace'}</span>
                      </button>

                      {/* Test Document Sample */}
                      <button
                        type="button"
                        onClick={() => setDocumentTestSchool(school)}
                        className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-black transition-all cursor-pointer"
                        title={isRtl ? 'معاينة الختم على استمارة رسمية' : 'Test on document'}
                      >
                        <FileText className="w-4 h-4" />
                      </button>

                      {/* Delete Stamp Button */}
                      <button
                        type="button"
                        onClick={() => setDeleteModalSchool(school)}
                        className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-black transition-all cursor-pointer"
                        title={isRtl ? 'حذف الختم' : 'Delete Stamp'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openUploadModal(school)}
                      className="w-full py-2.5 px-4 bg-[#0b5e32] hover:bg-[#084524] text-white rounded-xl text-xs font-black shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      <span>{isRtl ? 'رفع ختم المدرسة' : 'Upload School Stamp'}</span>
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Upload Stamp Modal */}
      <AnimatePresence>
        {uploadModalSchool && (
          <motion.div 
            key="stamp-upload-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden p-6 md:p-7 space-y-5"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[11px] font-black mb-1">
                    <Stamp className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'رفع ختم مدرسة' : 'Upload School Stamp'}</span>
                  </div>
                  <h2 className="text-lg font-black text-slate-900">
                    {uploadModalSchool.nameAr}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    {uploadModalSchool.wilayaAr}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setUploadModalSchool(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Upload Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-[#0b5e32] bg-emerald-50/50 scale-[1.01]'
                    : previewDataUrl
                    ? 'border-emerald-300 bg-slate-50/60'
                    : 'border-slate-200 hover:border-slate-400 bg-slate-50/40 hover:bg-slate-50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileSelect(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />

                {previewDataUrl ? (
                  <div className="space-y-4">
                    {/* Visual Stamp Seal Preview */}
                    <div 
                      className="w-40 h-40 mx-auto rounded-2xl border border-slate-200 bg-white shadow-inner flex items-center justify-center p-3 relative"
                      style={{
                        backgroundImage: 'radial-gradient(#cbd5e1 1.2px, transparent 1.2px)',
                        backgroundSize: '12px 12px'
                      }}
                    >
                      <img
                        src={previewDataUrl}
                        alt="Stamp Preview"
                        className="max-h-full max-w-full object-contain filter drop-shadow-sm select-none"
                      />
                      <div className="absolute -top-2 -right-2 bg-[#0b5e32] text-white p-1 rounded-full shadow-md">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-black text-slate-800">
                        {selectedFile?.name || uploadModalSchool.stampName || 'school_stamp.png'}
                      </p>
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                        {isRtl ? 'انقر أو اسحب صورة أخرى للاستبدال' : 'Click or drop another image to replace'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 py-4">
                    <div className="w-14 h-14 bg-emerald-50 text-[#0b5e32] rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                      <Upload className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-black text-slate-800">
                        {isRtl ? 'انقر هنا لاختيار صورة الختم أو اسحبها إلى هنا' : 'Click to select stamp image or drag and drop'}
                      </p>
                      <p className="text-[11px] text-slate-400 font-bold mt-1">
                        PNG, JPG, SVG, WebP (بحد أقصى 5MB)
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Best Practice Tip Notice */}
              <div className="bg-amber-50/80 border border-amber-200/60 rounded-2xl p-3.5 flex items-start gap-3">
                <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div className="text-[11px] text-amber-900 font-medium leading-relaxed">
                  <span className="font-bold block text-amber-950 mb-0.5">
                    {isRtl ? '💡 نصيحة لجودة الختم الرسمي:' : '💡 Recommended Format:'}
                  </span>
                  {isRtl
                    ? 'يُفضّل رفع صورة بصيغة PNG وبخلفية شفافة (Transparent) ومفرغة من البياض، حتى يظهر الختم الأزرق أو الأخضر بانسيابية واقعية فوق نص الاستمارة وتوقيع المدير.'
                    : 'Prefer a PNG file with transparent background so the ink appears realistic over signatures and text on official documents.'}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setUploadModalSchool(null)}
                  disabled={isProcessingUpload}
                  className="px-4 py-2.5 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>

                <button
                  type="button"
                  onClick={handleSaveStamp}
                  disabled={!previewDataUrl || isProcessingUpload}
                  className="px-6 py-2.5 bg-[#0b5e32] hover:bg-[#084524] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  {isProcessingUpload ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{isRtl ? 'جارِ الحفظ والاعتماد...' : 'Saving Stamp...'}</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{isRtl ? 'تثبيت واعتماد الختم للمدرسة' : 'Save & Assign Stamp'}</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModalSchool && (
          <motion.div 
            key="stamp-delete-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl border border-rose-100 shadow-2xl max-w-md w-full p-6 text-center space-y-4"
            >
              <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                <Trash2 className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-base font-black text-slate-900">
                  {isRtl ? 'تأكيد حذف ختم المدرسة' : 'Confirm Delete School Stamp'}
                </h3>
                <p className="text-xs text-slate-500 font-bold mt-1.5 leading-relaxed">
                  {isRtl 
                    ? `هل أنت متأكد من رغبتك في إزالة وختم مدرسة (${deleteModalSchool.nameAr})؟ لن يظهر الختم على النماذج المستقبلية حتى يتم رفع ختم بديل.`
                    : `Are you sure you want to delete the official stamp for (${deleteModalSchool.nameAr})?`}
                </p>
              </div>

              {deleteModalSchool.stampUrl && (
                <div className="w-24 h-24 mx-auto rounded-2xl border border-slate-200 bg-slate-50 p-2 flex items-center justify-center shadow-inner">
                  <img
                    src={deleteModalSchool.stampUrl}
                    alt="Stamp"
                    className="max-h-full max-w-full object-contain filter drop-shadow-sm opacity-60"
                  />
                </div>
              )}

              <div className="flex items-center justify-center gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setDeleteModalSchool(null)}
                  disabled={isProcessingUpload}
                  className="flex-1 py-2.5 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  {isRtl ? 'تراجع' : 'Cancel'}
                </button>

                <button
                  type="button"
                  onClick={handleDeleteStamp}
                  disabled={isProcessingUpload}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isProcessingUpload ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>{isRtl ? 'نعم، حذف الختم' : 'Delete Stamp'}</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enlarge Stamp Lightbox Modal */}
      <AnimatePresence>
        {previewStampSchool && previewStampSchool.stampUrl && (
          <motion.div 
            key="stamp-preview-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewStampSchool(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm cursor-pointer"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 text-center space-y-4 relative overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setPreviewStampSchool(null)}
                className="absolute top-4 left-4 p-1.5 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="pt-2">
                <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                  {previewStampSchool.wilayaAr}
                </span>
                <h3 className="text-base font-black text-slate-900 mt-1">
                  {previewStampSchool.nameAr}
                </h3>
              </div>

              {/* Large high-res canvas */}
              <div 
                className="w-64 h-64 mx-auto rounded-3xl border border-slate-200 bg-white shadow-inner flex items-center justify-center p-6 relative"
                style={{
                  backgroundImage: 'radial-gradient(#94a3b8 1.5px, transparent 1.5px)',
                  backgroundSize: '16px 16px'
                }}
              >
                <img
                  src={previewStampSchool.stampUrl}
                  alt={previewStampSchool.nameAr}
                  className="max-h-full max-w-full object-contain filter drop-shadow-md select-none"
                />
              </div>

              <div className="text-xs text-slate-500 font-bold space-y-1">
                <p>{isRtl ? 'الختم الرسمي المعتمد للمدرسة' : 'Official Verified School Stamp'}</p>
                <p className="text-[11px] text-slate-400">
                  {previewStampSchool.stampUploadedAt ? `تاريخ الرفع: ${new Date(previewStampSchool.stampUploadedAt).toLocaleString(isRtl ? 'ar-OM' : 'en-US')}` : ''}
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const sch = previewStampSchool;
                    setPreviewStampSchool(null);
                    openUploadModal(sch);
                  }}
                  className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isRtl ? 'استبدال بختم جديد' : 'Replace Stamp'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const sch = previewStampSchool;
                    setPreviewStampSchool(null);
                    setDocumentTestSchool(sch);
                  }}
                  className="flex-1 py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{isRtl ? 'تجربة على وثيقة' : 'Test on Form'}</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Test Document Stamping Simulation Modal */}
      <AnimatePresence>
        {documentTestSchool && (
          <motion.div 
            key="stamp-document-test-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDocumentTestSchool(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm cursor-pointer"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-slate-900">
                      {isRtl ? 'محاكاة الختم الرسمي على استمارة التدقيق' : 'Official Document Stamping Preview'}
                    </h3>
                    <p className="text-xs text-slate-400 font-bold">
                      {documentTestSchool.nameAr}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setDocumentTestSchool(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Sample Ministry of Education Audit Document Preview Box */}
              <div className="bg-[#FAF9F5] border-2 border-slate-300 rounded-2xl p-6 text-right font-sans shadow-sm relative overflow-hidden" dir="rtl">
                {/* Header of Simulated Certificate */}
                <div className="text-center border-b-2 border-slate-400/60 pb-4 mb-4">
                  <p className="text-xs font-bold text-slate-600">سلطنة عُمان - وزارة التعليم</p>
                  <p className="text-xs font-bold text-slate-600">المديرية العامة للتربية والتعليم بمحافظة الوسطى</p>
                  <h4 className="text-base font-black text-[#821315] mt-1">
                    استمارة تدقيق ومصادقة الاختبارات الرسمية
                  </h4>
                  <p className="text-[11px] font-bold text-slate-500 mt-0.5">
                    المدرسة المستهدفة: <span className="text-slate-800 font-black">{documentTestSchool.nameAr}</span> | {documentTestSchool.wilayaAr}
                  </p>
                </div>

                {/* Simulated Content */}
                <div className="space-y-2 text-xs font-medium text-slate-700 mb-6 bg-white/70 p-4 rounded-xl border border-slate-200">
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span>المادة الدراسية: <strong>الرياضيات المتقدمة</strong></span>
                    <span>الصف الدراسي: <strong>الصف العاشر</strong></span>
                    <span>الفصل الدراسي: <strong>الأول 2025/2026</strong></span>
                  </div>
                  <p className="text-[11px] text-slate-500 pt-1 leading-relaxed">
                    تم تدقيق ومطابقة مفردات الورقة الامتحانية وفقاً لجدول المواصفات والضوابط الصادرة من دائرة تنمية الموارد البشرية، وتمت التوصية بالاعتماد النهائي.
                  </p>
                </div>

                {/* Signatures & School Stamp Section */}
                <div className="grid grid-cols-2 gap-4 border-2 border-[#821315]/40 rounded-xl p-4 bg-white relative">
                  <div>
                    <span className="text-xs font-extrabold text-[#821315] block">المشرف التربوي المدقق:</span>
                    <span className="text-xs font-black text-slate-800 mt-1 block">أ. المشرف المعتمد</span>
                    <span className="text-[10px] text-emerald-700 font-bold block mt-1">✓ مصادق رقمياً</span>
                  </div>

                  <div className="relative text-right">
                    <span className="text-xs font-extrabold text-[#821315] block">مدير المدرسة المصادق:</span>
                    <span className="text-xs font-black text-slate-800 mt-1 block">أ. مدير المدرسة</span>
                    <span className="text-[10px] text-slate-500 font-bold block mt-1">
                      التاريخ: {new Date().toLocaleDateString('ar-OM')}
                    </span>

                    {/* School Stamp Placed Over Principal's signature */}
                    <div className="absolute -top-3 left-2 w-24 h-24 pointer-events-none select-none">
                      <img 
                        src={documentTestSchool.stampUrl || principalStampUrl} 
                        alt="Stamp"
                        className="w-full h-full object-contain filter drop-shadow-sm rotate-[-4deg] opacity-95"
                      />
                    </div>
                  </div>
                </div>

                <div className="text-center text-[10px] text-slate-400 font-bold mt-4">
                  رمز التحقق الرقمي الرسمي: OM-SIG-2026-VAL-WUSTA
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setDocumentTestSchool(null)}
                  className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black transition-all cursor-pointer"
                >
                  {isRtl ? 'إغلاق المعاينة' : 'Close Preview'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
