import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  School, 
  Edit2, 
  Trash2, 
  Filter, 
  Check, 
  X, 
  MapPin, 
  Calendar,
  AlertTriangle,
  Loader2,
  Globe,
  FileSpreadsheet,
  RefreshCw,
  Stamp,
  Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SchoolDoc } from '../types';
import { 
  getSchoolsList, 
  addSchoolDoc, 
  updateSchoolDoc, 
  deleteSchoolDoc,
  syncOfficialWustaSchools
} from '../services/db';

interface SchoolsDatabaseViewProps {
  language: 'en' | 'ar';
}

const WILAYATS = [
  { id: 'mahout', nameAr: 'ولاية محوت (11 مدرسة)', nameEn: 'Wilayat Mahout (11 Schools)' },
  { id: 'duqm', nameAr: 'ولاية الدقم (6 مدارس)', nameEn: 'Wilayat Duqm (6 Schools)' },
  { id: 'jazer', nameAr: 'ولاية الجازر (6 مدارس)', nameEn: 'Wilayat Al Jazer (6 Schools)' },
  { id: 'haima', nameAr: 'ولاية هيماء (4 مدارس)', nameEn: 'Wilayat Haima (4 Schools)' }
];

export const SchoolsDatabaseView: React.FC<SchoolsDatabaseViewProps> = ({ language }) => {
  const [schools, setSchools] = useState<SchoolDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWilayaFilter, setSelectedWilayaFilter] = useState('');
  
  // Custom Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | null }>({ message: '', type: null });

  // Dialog and form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<SchoolDoc | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  
  // Form input states
  const [formNameAr, setFormNameAr] = useState('');
  const [formNameEn, setFormNameEn] = useState('');
  const [formWilayaId, setFormWilayaId] = useState(WILAYATS[0].id);
  const [formStampUrl, setFormStampUrl] = useState('');
  const [formStampName, setFormStampName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load schools from DB
  const loadSchools = async () => {
    setLoading(true);
    try {
      const data = await getSchoolsList();
      setSchools(data);
    } catch (err: any) {
      showToast(language === 'ar' ? 'فشل تحميل قاعدة بيانات المدارس' : 'Failed to load schools database', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchools();
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast({ message: '', type: null });
    }, 4000);
  };

  // Open Form for Adding
  const handleOpenAdd = () => {
    setEditingSchool(null);
    setFormNameAr('');
    setFormNameEn('');
    setFormWilayaId(WILAYATS[0].id);
    setFormStampUrl('');
    setFormStampName('');
    setIsFormOpen(true);
  };

  // Open Form for Editing
  const handleOpenEdit = (school: SchoolDoc) => {
    setEditingSchool(school);
    setFormNameAr(school.nameAr);
    setFormNameEn(school.nameEn);
    setFormWilayaId(school.wilayaId);
    setFormStampUrl(school.stampUrl || '');
    setFormStampName(school.stampName || '');
    setIsFormOpen(true);
  };

  // Handle Form Submission (Add or Edit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNameAr.trim() || !formNameEn.trim()) {
      showToast(language === 'ar' ? 'يرجى إدخال اسم المدرسة باللغتين' : 'Please input names in both languages', 'error');
      return;
    }

    const selectedWilaya = WILAYATS.find(w => w.id === formWilayaId);
    if (!selectedWilaya) return;

    setIsSubmitting(true);
    try {
      const now = new Date().toISOString();
      const schoolPayload: Partial<SchoolDoc> = {
        nameAr: formNameAr.trim(),
        nameEn: formNameEn.trim(),
        wilayaId: formWilayaId,
        wilayaAr: selectedWilaya.nameAr,
        wilayaEn: selectedWilaya.nameEn,
        stampUrl: formStampUrl,
        stampName: formStampName,
        stampUploadedAt: formStampUrl ? now : '',
        stampUploadedBy: formStampUrl ? 'مدير النظام' : ''
      };

      if (editingSchool) {
        // Edit existing school
        await updateSchoolDoc(editingSchool.id, schoolPayload);
        showToast(
          language === 'ar' ? 'تم تحديث بيانات المدرسة والختم بنجاح' : 'School and stamp updated successfully', 
          'success'
        );
      } else {
        // Add new school
        await addSchoolDoc(schoolPayload as any);
        showToast(
          language === 'ar' ? 'تم إضافة المدرسة الجديدة بنجاح' : 'New school added successfully', 
          'success'
        );
      }
      setIsFormOpen(false);
      loadSchools();
    } catch (err: any) {
      showToast(
        language === 'ar' ? 'حدث خطأ أثناء حفظ البيانات' : 'An error occurred while saving data', 
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Confirmation
  const handleDelete = async (schoolId: string) => {
    try {
      await deleteSchoolDoc(schoolId);
      showToast(
        language === 'ar' ? 'تم حذف المدرسة من قاعدة البيانات' : 'School deleted successfully from database', 
        'success'
      );
      setConfirmDeleteId(null);
      loadSchools();
    } catch (err: any) {
      showToast(
        language === 'ar' ? 'حدث خطأ أثناء الحذف' : 'Failed to delete school', 
        'error'
      );
    }
  };

  // Export as static list JSON/CSV simulate
  const handleExportCSV = () => {
    const headers = 'ID,Arabic Name,English Name,Wilaya (Arabic),Wilaya (English),Registration Date\n';
    const rows = filteredSchools.map(s => 
      `"${s.id}","${s.nameAr}","${s.nameEn}","${s.wilayaAr}","${s.wilayaEn}","${s.createdAt}"`
    ).join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `oman_moe_schools_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(language === 'ar' ? 'تم تصدير البيانات بصيغة CSV' : 'Data exported as CSV successfully', 'success');
  };

  // Filter schools list based on inputs
  const filteredSchools = schools.filter(s => {
    const matchesSearch = 
      s.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.nameEn.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesWilaya = !selectedWilayaFilter || s.wilayaId === selectedWilayaFilter;
    
    return matchesSearch && matchesWilaya;
  });

  const isRtl = language === 'ar';

  return (
    <div className="space-y-6 w-full text-slate-800" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Dynamic Toast Status Messages */}
      <AnimatePresence>
        {toast.type && (
          <motion.div 
            key="sch-db-toast-message"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-3.5 rounded-2xl border text-xs font-black shadow-lg ${
              toast.type === 'success' 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {toast.type === 'success' ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Header Card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 relative overflow-hidden">
        {/* Decorative corner background */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-[#051C3F]/5 rounded-bl-full pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 z-10 relative">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-linear-to-br from-[#051C3F] to-indigo-850 rounded-2xl text-amber-400 shadow-md">
              <School className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-black text-[#051C3F] tracking-tight">
                {isRtl ? '⚙️ قاعدة بيانات مدارس محافظة الوسطى' : '⚙️ Al Wusta Region Schools Database'}
              </h2>
              <p className="text-xs text-slate-400 font-bold mt-1">
                {isRtl 
                  ? 'لوحة تحكم مدير النظام لإدارة المؤسسات التعليمية وتحديث المسميات الرسمية وحذف المدارس المدموجة' 
                  : 'System Administrator module to manage register list of schools, modify official names, and delete merged locations.'}
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={async () => {
                setLoading(true);
                try {
                  const updated = await syncOfficialWustaSchools();
                  setSchools(updated);
                  showToast(
                    isRtl
                      ? 'تمت مزامنة وتحديث قائمة المدارس المعتمدة لمحافظة الوسطى (27 مدرسة)'
                      : 'Successfully synced all 27 official schools for Al Wusta',
                    'success'
                  );
                } catch (err: any) {
                  showToast(isRtl ? 'حدث خطأ أثناء المزامنة' : 'Error syncing schools', 'error');
                } finally {
                  setLoading(false);
                }
              }}
              title={isRtl ? 'تحديث ومزامنة كافة المدارس الـ 27 المعتمدة حسب الولايات' : 'Sync official 27 schools by Wilayat'}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-700 ${loading ? 'animate-spin' : ''}`} />
              <span>{isRtl ? 'مزامنة المدارس المعتمدة (27)' : 'Sync Official (27)'}</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-205 text-xs font-bold text-slate-650 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              {isRtl ? 'تصدير CSV' : 'Export CSV'}
            </button>
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#051C3F] hover:bg-indigo-900 transition-all text-xs font-black text-amber-300 shadow-md hover:shadow-lg cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              {isRtl ? 'إضافة مدرسة' : 'Register School'}
            </button>
          </div>
        </div>
      </div>

      {/* Wilayat Quick Filter Tabs */}
      <div className="flex flex-wrap gap-2 pt-1 font-sans">
        <button
          type="button"
          onClick={() => setSelectedWilayaFilter('')}
          className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
            selectedWilayaFilter === ''
              ? 'bg-[#051C3F] text-amber-300 shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <span>{isRtl ? '🏛️ كافة الولايات' : '🏛️ All Wilayats'}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
            selectedWilayaFilter === '' ? 'bg-amber-400/20 text-amber-200' : 'bg-slate-100 text-slate-600'
          }`}>
            {schools.length}
          </span>
        </button>

        {WILAYATS.map((w) => {
          const count = schools.filter(s => s.wilayaId === w.id).length;
          const isSelected = selectedWilayaFilter === w.id;
          return (
            <button
              key={`sch-db-wilaya-tab-${w.id}`}
              type="button"
              onClick={() => setSelectedWilayaFilter(isSelected ? '' : w.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                isSelected
                  ? 'bg-indigo-900 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>{isRtl ? w.nameAr.split('(')[0].trim() : w.nameEn.split('(')[0].trim()}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Database Filtering Panel */}
      <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-2xl shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-end">
          
          {/* Search school text */}
          <div className="md:col-span-6 space-y-1.5 text-right">
            <label className="text-[10px] font-black text-slate-450 uppercase tracking-widest block font-sans">
              {isRtl ? '🔍 بحث عن اسم المدرسة' : '🔍 Search School Name'}
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isRtl ? 'ابحث باللغة العربية أو الإنجليزية...' : 'Search in Arabic or English...'}
                className="w-full pl-3.5 pr-10 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-850 focus:border-indigo-850 font-bold"
              />
              <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ${isRtl ? 'right-3' : 'left-3'}`} />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className={`absolute top-1/2 -translate-y-1/2 hover:text-slate-700 text-slate-400 p-0.5 ${isRtl ? 'left-3' : 'right-3'}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Wilaya Filter Dropdown */}
          <div className="md:col-span-4 space-y-1.5 text-right">
            <label className="text-[10px] font-black text-slate-450 uppercase tracking-widest block font-sans">
              {isRtl ? '📍 تصفية حسب الولاية' : '📍 Filter by Wilayat'}
            </label>
            <div className="relative">
              <select
                value={selectedWilayaFilter}
                onChange={(e) => setSelectedWilayaFilter(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-850 focus:border-indigo-850 pl-8 font-bold appearance-none cursor-pointer"
              >
                <option key="sch-db-filter-all" value="">{isRtl ? 'كل الولايات بمحافظة الوسطى' : 'All Al Wusta Wilayats'}</option>
                {WILAYATS.map(w => (
                  <option key={`sch-db-filter-opt-${w.id}`} value={w.id}>{isRtl ? w.nameAr : w.nameEn}</option>
                ))}
              </select>
              <Filter className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none ${isRtl ? 'left-3' : 'right-3'}`} />
            </div>
          </div>

          {/* Statistics badge */}
          <div className="md:col-span-2 text-center md:text-left h-full flex items-center justify-center p-2.5 bg-indigo-50/60 rounded-xl border border-indigo-100/40">
            <div className="text-center w-full">
              <span className="text-[10px] font-extrabold text-indigo-500 uppercase block tracking-wide">
                {isRtl ? 'مجموع المدارس' : 'Total Schools'}
              </span>
              <span className="text-base font-black text-indigo-950 font-mono mt-0.5 block">
                {filteredSchools.length} / {schools.length}
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Main interactive Schools Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-xs space-y-4">
          <Loader2 className="w-8 h-8 text-indigo-900 animate-spin" />
          <p className="text-xs text-slate-450 font-black">
            {isRtl ? 'جاري جلب قاعدة بيانات المدارس المعتمدة...' : 'Fetching verified schools database...'}
          </p>
        </div>
      ) : filteredSchools.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-xs text-center p-6">
          <div className="p-4 bg-slate-50 text-slate-400 rounded-full mb-4">
            <School className="w-10 h-10 stroke-1" />
          </div>
          <h3 className="text-sm font-black text-slate-700">
            {isRtl ? 'لا توجد نتائج مطابقة' : 'No schools matching criteria'}
          </h3>
          <p className="text-xs text-slate-400 font-bold mt-1 max-w-sm">
            {isRtl 
              ? 'يرجى مراجعة التهجئة أو تغيير فلتر الولايات لتحديد المدرسة المطلوبة' 
              : 'Please check your spelling search keywords or modify the selected Wilayat filter.'}
          </p>
          {(searchQuery || selectedWilayaFilter) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedWilayaFilter('');
              }}
              className="mt-4 px-4 py-2 bg-[#051C3F] text-amber-300 text-xs font-black rounded-xl hover:bg-slate-900 transition-colors cursor-pointer"
            >
              {isRtl ? 'إعادة تعيين المرشحات' : 'Clear Filters'}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-sans max-h-[800px] overflow-y-auto pr-1">
          {filteredSchools.map((school, index) => {
            const isDeletingThis = confirmDeleteId === school.id;
            
            return (
              <motion.div
                key={`sch-db-${school.id || 'sch'}-${index}`}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`bg-white rounded-2xl border transition-all relative overflow-hidden ${
                  isDeletingThis 
                    ? 'border-rose-300 shadow-md bg-rose-50/10' 
                    : 'border-slate-150 shadow-xs hover:shadow-md hover:border-slate-300/80 bg-linear-to-b from-white to-slate-50/20'
                }`}
              >
                {/* Visual Accent Bar */}
                <div className={`h-1.5 w-full ${
                  school.wilayaId === 'haima' ? 'bg-amber-500' :
                  school.wilayaId === 'duqm' ? 'bg-indigo-650' :
                  school.wilayaId === 'mahout' ? 'bg-emerald-600' : 'bg-purple-600'
                }`} />

                <div className="p-4.5 space-y-4">
                  {/* Wilaya badge & Meta info */}
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-slate-100 text-slate-700">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      {isRtl ? school.wilayaAr : school.wilayaEn}
                    </span>
                    <span className="text-[9px] font-mono text-slate-400 font-medium">
                      ID: {school.id.slice(0, 11)}
                    </span>
                  </div>

                  {/* School names */}
                  <div className="space-y-1">
                    <h3 className="text-xs font-black text-slate-850 leading-snug">
                      {school.nameAr}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 leading-snug tracking-wide flex items-center gap-1">
                      <Globe className="w-3 h-3 flex-shrink-0" />
                      {school.nameEn}
                    </p>
                  </div>

                  {/* School Stamp Indicator Pill */}
                  <div className="flex items-center justify-between bg-slate-50 rounded-xl p-2 border border-slate-100/90">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center p-0.5 overflow-hidden shrink-0">
                        {school.stampUrl ? (
                          <img 
                            src={school.stampUrl} 
                            alt="Stamp" 
                            className="max-h-full max-w-full object-contain"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <Stamp className="w-4 h-4 text-slate-300 stroke-1" />
                        )}
                      </div>
                      <div className="text-[10px] font-bold min-w-0">
                        {school.stampUrl ? (
                          <span className="text-emerald-700 block truncate">✓ ختم معتمد</span>
                        ) : (
                          <span className="text-slate-400 block truncate">بدون ختم</span>
                        )}
                        <span className="text-[9px] text-slate-400 block truncate max-w-[110px]">
                          {school.stampName || (isRtl ? 'الختم الرسمي' : 'Official Seal')}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenEdit(school)}
                      className="text-[10px] font-bold text-[#0b5e32] hover:text-emerald-800 px-2 py-1 bg-emerald-50 hover:bg-emerald-100 rounded-lg shrink-0 transition-colors cursor-pointer"
                    >
                      {school.stampUrl ? (isRtl ? 'تعديل' : 'Edit') : (isRtl ? '+ رفع ختم' : '+ Stamp')}
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-slate-100/80 pt-3 flex items-center justify-between">
                    
                    {/* Timestamp element */}
                    <div className="flex items-center gap-1 text-[9px] text-slate-400 font-bold font-mono">
                      <Calendar className="w-3 h-3" />
                      {new Date(school.createdAt).toLocaleDateString(isRtl ? 'ar-OM' : 'en-US', {
                        year: 'numeric',
                        month: 'short'
                      })}
                    </div>

                    {/* Action controllers */}
                    <AnimatePresence mode="wait">
                      {isDeletingThis ? (
                        <div className="flex items-center gap-1.5 animate-in fade-in" key="delete-confirm">
                          <button
                            onClick={() => handleDelete(school.id)}
                            className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-black cursor-pointer"
                          >
                            {isRtl ? 'نعم، احذف' : 'Delete'}
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-[10px] font-bold cursor-pointer"
                          >
                            {isRtl ? 'إلغاء' : 'Cancel'}
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1" key="actions-regular">
                          <button
                            onClick={() => handleOpenEdit(school)}
                            className="p-2 text-indigo-700 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer"
                            title={isRtl ? 'تعديل الاسم المعتمد' : 'Edit School Name'}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(school.id)}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                            title={isRtl ? 'حذف من النظام' : 'Remove School'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </AnimatePresence>

                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Slide-over or persistent overlay Modal to Create/Edit items */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div 
            key="sch-db-form-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-lg w-full overflow-hidden text-right"
              dir="rtl"
            >
              {/* Modal header branding */}
              <div className="bg-[#051C3F] text-amber-400 p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-xl">
                    <School className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black">
                      {editingSchool 
                        ? (isRtl ? '📝 تعديل مسمى مدرسة معتمدة' : '📝 Modify Authorized School') 
                        : (isRtl ? '🏢 تسجيل مدرسة حكومية جديدة' : '🏢 Register New Government School')}
                    </h3>
                    <p className="text-[10px] text-slate-300 font-bold mt-0.5">
                      {isRtl 
                        ? 'يرجى إدخال البيانات المعتمدة في المراسلات الرسمية لوزارة التعليم' 
                        : 'Provide official registrar naming conforming to MOE directory guidelines.'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-slate-300 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form container */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                
                {/* Wilayat Selection */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-450 uppercase tracking-widest block font-sans">
                    {isRtl ? 'الولاية المنتسب إليها:' : 'Affiliated Wilayat:'}
                  </label>
                  <select
                    value={formWilayaId}
                    onChange={(e) => setFormWilayaId(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-xs text-slate-800 bg-white focus:outline-none focus:border-[#051C3F] font-bold cursor-pointer"
                  >
                    {WILAYATS.map(w => (
                      <option key={`sch-db-modal-opt-${w.id}`} value={w.id}>{isRtl ? w.nameAr : w.nameEn}</option>
                    ))}
                  </select>
                </div>

                {/* Arabic Naming input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-450 uppercase tracking-widest block font-sans">
                    {isRtl ? '* اسم المدرسة الرسمي (باللغة العربية):' : '* Official School Name (Arabic):'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formNameAr}
                    onChange={(e) => setFormNameAr(e.target.value)}
                    placeholder={isRtl ? 'مثال: مدرسة هيماء للتعليم الأساسي (١-١٢)' : 'e.g. Haima Basic School...'}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#051C3F] font-black"
                  />
                </div>

                {/* English Naming input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-450 uppercase tracking-widest block font-sans">
                    {isRtl ? '* اسم المدرسة المعتمد (باللغة الإنجليزية):' : '* Authorized School Name (English):'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formNameEn}
                    onChange={(e) => setFormNameEn(e.target.value)}
                    placeholder="e.g. Haima School for Basic Education (1-12)"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#051C3F] font-black text-left"
                    dir="ltr"
                  />
                </div>

                {/* Official School Stamp Upload Section */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-[10px] font-black text-slate-450 uppercase tracking-widest block font-sans">
                    {isRtl ? '💮 الختم الرسمي للمدرسة (Official Stamp):' : '💮 Official School Stamp:'}
                  </label>
                  <div className="border border-slate-200 rounded-2xl p-3 bg-slate-50/70 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div 
                        className="w-14 h-14 rounded-xl border border-slate-200 bg-white flex items-center justify-center p-1 relative shadow-inner shrink-0"
                        style={{
                          backgroundImage: formStampUrl ? 'radial-gradient(#cbd5e1 1px, transparent 1px)' : 'none',
                          backgroundSize: '8px 8px'
                        }}
                      >
                        {formStampUrl ? (
                          <img 
                            src={formStampUrl} 
                            alt="Stamp" 
                            className="max-h-full max-w-full object-contain"
                          />
                        ) : (
                          <Stamp className="w-6 h-6 text-slate-300 stroke-1" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-slate-800 truncate">
                          {formStampUrl ? (formStampName || (isRtl ? 'الختم المعتمد' : 'Verified Stamp')) : (isRtl ? 'لم يتم رفع ختم' : 'No stamp')}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                          {isRtl ? 'PNG شفاف (بحد أقصى 5MB)' : 'Transparent PNG'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <label className="cursor-pointer px-3 py-1.5 bg-[#0b5e32] hover:bg-[#084524] text-white rounded-xl text-[11px] font-black shadow-xs transition-all flex items-center gap-1">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{formStampUrl ? (isRtl ? 'استبدال' : 'Replace') : (isRtl ? 'رفع ختم' : 'Upload')}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const file = e.target.files[0];
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                if (ev.target?.result) {
                                  setFormStampUrl(ev.target.result as string);
                                  setFormStampName(file.name);
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                      {formStampUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            setFormStampUrl('');
                            setFormStampName('');
                          }}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                          title={isRtl ? 'حذف الختم' : 'Remove stamp'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action CTA Buttons */}
                <div className="border-t border-slate-100 pt-4 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 bg-white hover:bg-slate-50 cursor-pointer"
                  >
                    {isRtl ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-[#051C3F] hover:bg-indigo-950 transition-colors text-xs font-black text-amber-300 rounded-xl flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-55"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    {isRtl ? 'حفظ التغييرات' : 'Save Changes'}
                  </button>
                </div>

              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
